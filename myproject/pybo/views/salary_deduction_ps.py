# salary_deduction.py  경조사별 급여 공제관리
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
bp = Blueprint('salary_deduction_ps', __name__, url_prefix='/')

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

#@bp.route('/salary_deduction_ps')
#def salary_deduction_ps():
#    return render_template('salary_deduction_ps.html')

@bp.route('/api/salary_deduction_ps', methods=['GET', 'POST', 'DELETE', 'PUT'])
def api_salary_deduction_ps():
    logger.info("API 요청 수신")

    if request.method == 'POST':
        logger.info("POST 요청 처리")

        data = request.json  # data는 JSON 형태로 전달됨
        residid = data.get('residid', None)
        event_cd = data.get('event_cd', None)

        if not residid or not event_cd:
            return jsonify({"success": False, "error": "residid 또는 event_cd 값이 없습니다."})

        conn = get_db_connection()
        cursor = conn.cursor()

        update_query = """
                        UPDATE D
                           SET D.deduction_yn = 'N',
                               D.LAST_UPDATED_DATE = GETDATE()
                               FROM itcs_event_deduction D
                               JOIN ITCS_EVENT_LIST E ON D.event_cd = E.event_cd
                         WHERE D.residid = %s
                           AND D.event_cd = %s
                           AND GETDATE() BETWEEN E.ING_START_YMD AND E.ING_END_YMD         
        """
        try:
            cursor.execute(update_query, (residid, event_cd))
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

    if request.method == 'DELETE':
        logger.info("DELETE 요청 처리")

        data = request.json  # data는 JSON 형태로 전달됨
        residid = data.get('residid', None)
        event_cd = data.get('event_cd', None)

        if not residid or not event_cd:
            return jsonify({"success": False, "error": "residid 또는 event_cd 값이 없습니다."})

        conn = get_db_connection()
        cursor = conn.cursor()

        update_query = """
                        UPDATE D
                           SET D.deduction_yn = 'Y',
                               D.LAST_UPDATED_DATE = GETDATE()
                               FROM itcs_event_deduction D
                               JOIN ITCS_EVENT_LIST E ON D.event_cd = E.event_cd
                         WHERE D.residid = %s
                           AND D.event_cd = %s
                           AND GETDATE() BETWEEN E.ING_START_YMD AND E.ING_END_YMD   
        """
        try:
            cursor.execute(update_query, (residid, event_cd))
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
        cursor.execute("SELECT DEPTNAME + ' ' + EMPNAME + ' ' + UMJPNAME + ' ' + EVENT_NM FROM ITCS_EVENT_LIST WHERE ING_FLAG = '진행중'")
        events = cursor.fetchall()
        logger.info(f"🎯 DB에서 불러온 경조사 목록: {events}")
        conn.close()
        return [event[0] for event in events]
    except Exception as e:
        logger.error(f"❌ get_ongoing_events() 오류: {e}")
        return []

@bp.route('/salary_deduction_ps')
def show_event_page():
    logger.info("✅ /salary_deduction_ps 라우트 호출됨!")
    events = get_ongoing_events()  # ✅ 경조사 리스트 가져오기
    logger.info(f"🎯 DB 이벤트 목록: {events}")
    return render_template('salary_deduction_ps.html', events=events)  # ✅ 넘겨주기

@bp.route('/api/current_events')
def get_current_events():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT EVENT_CD, 
               DEPTNAME + ' ' + EMPNAME + ' ' + UMJPNAME + ' ' + EVENT_NM AS DISPLAY_TEXT
          FROM ITCS_EVENT_LIST 
         WHERE CASE 
                   WHEN GETDATE() < ING_START_YMD THEN '대기'
                   WHEN GETDATE() BETWEEN ING_START_YMD AND ING_END_YMD THEN '진행중'
                   WHEN GETDATE() > ING_END_YMD THEN '종료'
               END = '진행중'
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    result = [{"EVENT_CD": row[0], "DISPLAY_TEXT": row[1]} for row in rows]
    return jsonify(result)