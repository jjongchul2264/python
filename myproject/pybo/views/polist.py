# polist.py  발주관리시트
from flask import Blueprint, Flask, request, jsonify, render_template
from datetime import datetime
from dateutil.relativedelta import relativedelta
import requests
import paramiko
import wmi
import pythoncom
import winrm
import json
import os
import pymssql, logging
import concurrent.futures
import uuid
import base64
import sys


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
bp = Blueprint('polist', __name__, url_prefix='/')

# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}

def get_db_connection():
    conn = pymssql.connect(server=db_config['server'],
                           user=db_config['user'],
                           password=db_config['password'],
                           database=db_config['database'])
    return conn



@bp.route('/polist')
def polist():
    return render_template('polist.html')


@bp.route('/api/polist', methods=['GET', 'POST', 'DELETE'])
def api_polist():
    logger.info("API 요청 수신")

    if request.method == 'POST':
        logger.info("POST 요청 처리")
        data = request.json  # data는 JSON 형태로 전달됨
        conn = get_db_connection()
        cursor = conn.cursor()

        query_type = '2'

        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        for item in data:
            # 데이터 튜플로 변환
            data_tuple = (
                query_type,
                start_date,
                end_date,
                item.get('ErpRegist'),
                item.get('PoDate'),
                item.get('PONo'),
                item.get('ProjectAcronyms'),
                item.get('ProjectName'),
                item.get('EquipName'),
                item.get('ProejctType'),
                item.get('AmountUSD'),
                item.get('ExchangeRate'),
                item.get('AmountKRW'),
                item.get('OrderCompany'),
                item.get('POEmp'),
                item.get('ReqEmp'),
                item.get('EDeliveryDate'),
                item.get('DeliveryDate'),
                item.get('COC'),
                item.get('Remark')
            )

            # INSERT/UPDATE 쿼리
            query = """ EXEC dbo.Z_SP_POLIST @QUERY_TYPE=%s
                                           , @fromDate=%s
                                           , @toDate=%s
                                           , @ErpRegist=%s    
                                           , @PoDate=%s          
                                           , @PONo=%s            
                                           , @ProjectAcronyms=%s 
                                           , @ProjectName=%s     
                                           , @EquipName=%s        
                                           , @ProejctType=%s        
                                           , @AmountUSD=%s        
                                           , @ExchangeRate=%s    
                                           , @AmountKRW=%s        
                                           , @OrderCompany=%s    
                                           , @POEmp=%s            
                                           , @ReqEmp=%s            
                                           , @EDeliveryDate=%s    
                                           , @DeliveryDate=%s    
                                           , @COC=%s                
                                           , @Remark=%s
            """

            cursor.execute(query, (data_tuple))

        conn.commit()
        conn.close()
        return jsonify({"success": True})

    if request.method == 'DELETE':
        logger.info("DELETE 요청 처리")
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM ITCS_PO_LIST WHERE PONo = %s"
        cursor.execute(query, (data['PONo'],))
        conn.commit()
        conn.close()
        return jsonify({"success": True})


    logger.info("GET 요청 처리")
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        project_Name = request.args.get('projectName') or '%'
        po_Emp = request.args.get('poEmp') or '%'
        req_Emp = request.args.get('reqEmp') or '%'
        flag = request.args.get('erpRegist') or '%'

        result = query_polist(start_date, end_date, project_Name, po_Emp, req_Emp, flag)

        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def format_datetime(datetime_obj):
    if isinstance(datetime_obj, datetime):
        return datetime_obj.strftime('%Y-%m-%d %H:%M:%S')
    else:
        try:
            datetime_obj = datetime.strptime(datetime_obj, '%Y-%m-%d %H:%M:%S')
            return datetime_obj.strftime('%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError) as e:
            logger.error(f"Date format error: {e}")
            return datetime_obj  # 변환 실패 시 원본 문자열 반환

def format_datetime2(datetime_obj):
    if datetime_obj is None:
        return datetime_obj  # null 값은 그대로 반환
    if isinstance(datetime_obj, datetime):
        # 날짜 값이 "1900-01-01 00:00:00"인 경우 빈 문자열 반환
        if datetime_obj == datetime(1900, 1, 1):
            return ''
        return datetime_obj.strftime('%Y-%m-%d')
    else:
        try:
            datetime_obj = datetime.strptime(datetime_obj, '%Y-%m-%d')
            # 날짜 값이 "1900-01-01 00:00:00"인 경우 빈 문자열 반환
            if datetime_obj == datetime(1900, 1, 1):
                return ''
            return datetime_obj.strftime('%Y-%m-%d')
        except (ValueError, TypeError) as e:
            logger.error(f"Date format error: {e}")
            return datetime_obj  # 변환 실패 시 원본 문자열 반환

# SELECT
def query_polist(start_date, end_date, project_Name, po_Emp, req_Emp, flag):
    query_type = '1'
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """ EXEC.dbo.Z_SP_POLIST
                    @QUERY_TYPE=%s,
                    @fromDate=%s,
                    @toDate=%s, 
                    @ProjectName=%s,
                    @POEmp=%s,
                    @ReqEmp=%s,
                    @ErpRegist=%s
    """
    cursor.execute(query, (query_type, start_date, end_date, project_Name, po_Emp, req_Emp, flag))
    rows = cursor.fetchall()
    conn.close()

    # 결과를 dict 형태로 변환하고 날짜 형식 변경
    column_names = [desc[0] for desc in cursor.description]
    polist_data = []

    for row in rows:
        row_dict = dict(zip(column_names, row))
        if row_dict['PoDate']:
            row_dict['PoDate'] = format_datetime2(row_dict['PoDate'])
        if row_dict['EDeliveryDate']:
            row_dict['EDeliveryDate'] = format_datetime2(row_dict['EDeliveryDate'])
        if row_dict['DeliveryDate']:
            row_dict['DeliveryDate'] = format_datetime2(row_dict['DeliveryDate'])
        if row_dict['CreateDate']:
            row_dict['CreateDate'] = format_datetime(row_dict['CreateDate'])
        if row_dict['UpdateDate']:
            row_dict['UpdateDate'] = format_datetime(row_dict['UpdateDate'])
        polist_data.append(row_dict)

    logger.info(f"조회된 데이터: {polist_data}")
    return polist_data

