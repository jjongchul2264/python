# comm_vacation_apply_ps.py  공통 휴일 미사용 신청
from flask import Blueprint, Flask, request, jsonify, render_template
import pymssql, logging
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
bp = Blueprint('comm_vacation_apply_ps', __name__, url_prefix='/')

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

#@bp.route('/comm_vacation_apply_ps')
#def comm_vacation_apply_ps():
#    return render_template('comm_vacation_apply_ps.html')

@bp.route('/api/comm_vacation_apply_ps', methods=['GET', 'POST', 'DELETE', 'PUT'])
def api_comm_vacation_apply_ps():
    logger.info("API 요청 수신")

    # 미사용 신청
    if request.method == 'POST':
        logger.info("POST 요청 처리")

        data = request.json  # data는 JSON 형태로 전달됨
        resid = data.get('resid', None)
        #comm_vacation_cd = data.get('comm_vacation_cd', None)
        comm_vacation_cd = int(data.get('comm_vacation_cd'))
        reasonText = data.get('reasonText', '').strip()  # 사유

        if not resid or not comm_vacation_cd:
            return jsonify({"success": False, "error": "resid 또는 comm_vacation_cd 값이 없습니다."})

        conn = get_db_connection()
        cursor = conn.cursor()

        update_query = """
                        UPDATE D
                           SET D.apply_status = 'N',
                               D.reason = %s           
                               FROM ITCS_COMM_VACATION_LIST D
                               JOIN ITCS_COMM_VACATION E ON D.comm_vacation_cd = E.comm_vacation_cd
                         WHERE D.resid = %s
                           AND D.comm_vacation_cd = %s
                           AND GETDATE() BETWEEN E.ING_START_YMD AND E.ING_END_YMD         
        """
        try:
            #cursor.execute(update_query, (resid, comm_vacation_cd))
            cursor.execute(update_query, (reasonText, resid, comm_vacation_cd))
            conn.commit()
            rows_affected = cursor.rowcount

            logger.info(f"✅ UPDATE 실행 완료! 적용된 행 수: {rows_affected}")

            return jsonify({"success": True, "updated_rows": rows_affected})

        except pymssql.Error as e:
            logger.error(f"❌ SQL 실행 오류: {e}")
            return jsonify({"success": False, "error": str(e)})

        finally:
            cursor.close()
            conn.close()

    #사용 신청
    if request.method == 'DELETE':
        logger.info("DELETE 요청 처리")

        data = request.json  # data는 JSON 형태로 전달됨
        resid = data.get('resid', None)
        comm_vacation_cd = data.get('comm_vacation_cd', None)

        if not resid or not comm_vacation_cd:
            return jsonify({"success": False, "error": "resid 또는 comm_vacation_cd 값이 없습니다."})

        conn = get_db_connection()
        cursor = conn.cursor()

        update_query = """
                        UPDATE D
                           SET D.apply_status = 'Y',
                               D.reason = ''                                                 
                               FROM ITCS_COMM_VACATION_LIST D
                               JOIN ITCS_COMM_VACATION E ON D.comm_vacation_cd = E.comm_vacation_cd                               
                         WHERE D.resid = %s
                           AND D.comm_vacation_cd = %s
                           AND GETDATE() BETWEEN E.ING_START_YMD AND E.ING_END_YMD   
        """
        try:
            cursor.execute(update_query, (resid, comm_vacation_cd))
            conn.commit()
            rows_affected = cursor.rowcount

            logger.info(f"✅ UPDATE 실행 완료! 적용된 행 수: {rows_affected}")

            return jsonify({"success": True, "updated_rows": rows_affected})

        except pymssql.Error as e:
            logger.error(f"❌ SQL 실행 오류: {e}")
            return jsonify({"success": False, "error": str(e)})

        finally:
            cursor.close()
            conn.close()

def get_ongoing_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
          SELECT comm_vacation_cd,  
                 '(' + comm_vacation_date + ') ' + remark AS display_text
            FROM ITCS_COMM_VACATION
           WHERE CONVERT(date, ing_start_ymd, 112) <= CONVERT(date, GETDATE(), 112)
             AND CONVERT(date, ing_end_ymd, 112) >= CONVERT(date, GETDATE(), 112)
        """)
        events = cursor.fetchall()
        logger.info(f"🎯 DB에서 불러온 공통 휴일 목록: {events}")
        conn.close()
        return [event[0] for event in events]
    except Exception as e:
        logger.error(f"❌ get_ongoing_events() 오류: {e}")
        return []

@bp.route('/comm_vacation_apply_ps')
def show_event_page():
    logger.info("✅ /comm_vacation_apply_ps 라우트 호출됨!")
    events = get_ongoing_events()  # ✅ 공통 휴일 리스트 가져오기
    logger.info(f"🎯 DB 이벤트 목록: {events}")
    return render_template('comm_vacation_apply_ps.html', events=events)  # ✅ 넘겨주기

@bp.route('/api/comm_vacation_events')
def get_comm_vacation_events():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT comm_vacation_cd, 
               '(' + comm_vacation_date + ') ' + remark AS display_text
          FROM ITCS_COMM_VACATION 
         WHERE CONVERT(date, ING_START_YMD, 112) <= CONVERT(date, GETDATE(), 112)
           AND CONVERT(date, ING_END_YMD, 112)   >= CONVERT(date, GETDATE(), 112)
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    result = [{"comm_vacation_cd": row[0], "DISPLAY_TEXT": row[1]} for row in rows]
    return jsonify(result)
