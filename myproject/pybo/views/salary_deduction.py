# salary_deduction.py  경조사별 급여 공제관리
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
bp = Blueprint('salary_deduction', __name__, url_prefix='/')

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

@bp.route('/salary_deduction')
def salary_deduction():
    return render_template('salary_deduction.html')

@bp.route('/api/salary_deduction', methods=['GET', 'POST', 'DELETE', 'PUT'])
def api_salary_deduction():
    logger.info("API 요청 수신")

#공제내역 조회
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
                item.get('EVENT_CD'),
                item.get('EVENT_NM'),
                item.get('EVENT_YMD'),
                item.get('DEPTNAME'),
                item.get('UMJPNAME'),
                item.get('EMPID'),
                item.get('EMPNAME'),
                item.get('ING_FLAG'),
                item.get('ING_START_YMD'),
                item.get('ING_END_YMD')
            )
            # INSERT/UPDATE 쿼리
            query = """ EXEC dbo.Z_SP_EVENT_DEDUCTION @QUERY_TYPE    =%s
                                                    , @frDate        =%s
                                                    , @toDate        =%s
                                                    , @EVENT_CD      =%s
                                                    , @EVENT_NM      =%s
                                                    , @EVENT_YMD     =%s
                                                    , @DEPTNAME      =%s
                                                    , @UMJPNAME      =%s
                                                    , @EMPID         =%s
                                                    , @EMPNAME       =%s                                                       
                                                    , @ING_FLAG      =%s   
                                                    , @ING_START_YMD =%s
                                                    , @ING_END_YMD   =%s                                                                                                                                                                                                                     
            """

            cursor.execute(query, data_tuple)

        conn.commit()
        conn.close()
        return jsonify({"success": True})

#개인별 공제내역 조회
    if request.method == 'PUT':
        logger.info("PUT 요청 처리")
        data = request.json  # JSON 데이터
        conn = get_db_connection()
        cursor = conn.cursor()

        query_type = '4'

        # event_cd 값을 쿼리스트링 또는 JSON 본문에서 가져오기
        event_cd = data.get('event_cd')

        if not event_cd:
            logger.warning("경조사번호가 전달되지 않았습니다.")
            conn.close()
            return jsonify({"success": False, "message": "경조사번호가 없습니다."}), 400

        # 저장 프로시저 실행 쿼리
        query = """
            EXEC dbo.Z_SP_EVENT_DEDUCTION 
                @QUERY_TYPE = %s,
                @frDate     = %s,
                @toDate     = %s,
                @EVENT_CD   = %s
        """
        cursor.execute(query, (query_type, None, None, event_cd))
        rows = cursor.fetchall()

        # ** 커서 닫기 전에 컬럼명 추출! **
        column_names = [desc[0] for desc in cursor.description]

        conn.close()  # 데이터 가져온 후 연결 종료

        # **데이터를 JSON 형식으로 변환**
        salary_deduction_data = [
            dict(zip(column_names, row)) for row in rows
        ]

        logger.info(f"조회된 데이터: {salary_deduction_data}")

        return salary_deduction_data

#공제내역 삭제
    if request.method == 'DELETE':
        logger.info("DELETE 요청 처리")
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        query_type = '3'

        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        for item in data:
            # 데이터 튜플로 변환
            data_tuple = (
                query_type,
                start_date,
                end_date,
                item.get('EVENT_CD')
            )
            # INSERT/UPDATE 쿼리
            query = """ EXEC dbo.Z_SP_EVENT_DEDUCTION @QUERY_TYPE=%s
                                                    , @frDate    =%s
                                                    , @toDate    =%s
                                                    , @EVENT_CD  =%s                                                                                                                                                                  
            """

            cursor.execute(query, data_tuple)

        conn.commit()
        conn.close()
        return jsonify({"success": True})

    logger.info("GET 요청 처리")
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        result = query_salary_deduction(start_date, end_date)

        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_datetime(datetime_obj):
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
def query_salary_deduction(start_date, end_date):
    query_type = '1'
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """ EXEC.dbo.Z_SP_EVENT_DEDUCTION
                    @QUERY_TYPE=%s,
                    @frDate    =%s,
                    @toDate    =%s, 
                    @EVENT_CD  =%s
    """
    cursor.execute(query, (query_type, start_date, end_date, None))
    rows = cursor.fetchall()
    conn.close()

    column_names = [desc[0] for desc in cursor.description]
    salary_deduction_data = []

    for row in rows:
        row_dict = dict(zip(column_names, row))

        if row_dict['EVENT_YMD']:
           row_dict['EVENT_YMD']     = format_datetime(row_dict['EVENT_YMD'])
        if row_dict['REGDATE']:
           row_dict['REGDATE']       = format_datetime(row_dict['REGDATE'])
        if row_dict['ING_START_YMD']:
           row_dict['ING_START_YMD'] = format_datetime(row_dict['ING_START_YMD'])
        if row_dict['ING_END_YMD']:
           row_dict['ING_END_YMD']   = format_datetime(row_dict['ING_END_YMD'])
        salary_deduction_data.append(row_dict)

    logger.info(f"조회된 데이터: {salary_deduction_data}")
    return salary_deduction_data

# 메일발송
@bp.route('/send_mail', methods=['POST'])
def send_mail():
    data = request.get_json()

    if not data:
        logger.error("잘못된 요청 데이터.")
        return jsonify({"success": False, "error": "잘못된 요청 데이터"})

    records = data.get('records', [])

    if not records:
        logger.error("전달된 데이터가 없습니다.")
        return jsonify({"success": False, "error": "전달된 데이터가 없습니다."})

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for record in records:
            event_cd = record.get('event_cd')
            empid = record.get('empid')
            if not event_cd or not empid:
                logger.warning(f"누락된 데이터 - event_cd: {event_cd}, empid: {empid}")
                continue

            # 프로시저 실행
            cursor.callproc("Z_SP_EVENT_DEDUCTION_SEND_MAIL", (event_cd, empid))

        conn.commit()
        return jsonify({"success": True})

    except Exception as e:
        logger.error(f"메일 발송 프로시저 실행 중 오류: {e}")
        return jsonify({"success": False, "error": str(e)})

    finally:
        cursor.close()
        conn.close()
