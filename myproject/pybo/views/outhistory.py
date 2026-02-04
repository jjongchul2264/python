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

# Flask 애플리케이션 생성
app = Flask(__name__)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}

# 메인 블루프린트 정의 및 등록
bp = Blueprint('outhistory', __name__, url_prefix='/')

@bp.route('/calendar')
def calendar():
    return render_template('calendar.html')

#calendar 조회
@bp.route('/get_events', methods=['GET'])
def get_events():
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    # Convert the start and end date to 'YYYY-MM-DD' format
    start_date = datetime.strptime(start_date, '%Y-%m-%d').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%Y-%m-%d').strftime('%Y-%m-%d')

    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )
    cursor = conn.cursor(as_dict=True)

    query = """
           SELECT distinct VacAppSeq  
                , EmpSeq  
                , Empid 
                , EmpName 
                , DeptSeq  
                , DeptName 
                , WkItemSeq 
                , WkItemName 
                , VacReason 
                , CAST(CONVERT(DATE, WkBegDate) AS VARCHAR(10)) + ' ' + LEFT(STUFF(BegTime, 3, 0, ':'), 5) AS WkBegDateTime
	            , CAST(CONVERT(DATE, WkEndDate) AS VARCHAR(10)) + ' ' + LEFT(STUFF(EndTime, 3, 0, ':'), 5) AS WkEndDateTime
                , out_color
             FROM ITCS_OUT_HISTORY
            WHERE CONVERT(DATE, WkBegDate) >= %s
              AND CONVERT(DATE, WkEndDate) <= %s
        ORDER BY DeptName, EmpName
    """
    cursor.execute(query, (start_date, end_date))
    events = cursor.fetchall()

    conn.close()
    return jsonify(events)

#calendar 오늘의 현황
@bp.route('/get_events2', methods=['GET'])
def get_events2():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    dept = request.args.get('dept')
    name = request.args.get('name')

    # Convert the start and end date to 'YYYY-MM-DD' format
    start_date = datetime.strptime(start_date, '%Y-%m-%d').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%Y-%m-%d').strftime('%Y-%m-%d')


    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )
    cursor = conn.cursor(as_dict=True)

    query = """
               SELECT distinct VacAppSeq  
                    , EmpSeq  
                    , Empid 
                    , EmpName 
                    , DeptSeq  
                    , DeptName 
                    , WkItemSeq 
                    , WkItemName 
                    , VacReason 
                    , CAST(CONVERT(DATE, WkBegDate) AS VARCHAR(10)) + ' ' + LEFT(STUFF(BegTime, 3, 0, ':'), 5) AS WkBegDateTime
    	            , CAST(CONVERT(DATE, WkEndDate) AS VARCHAR(10)) + ' ' + LEFT(STUFF(EndTime, 3, 0, ':'), 5) AS WkEndDateTime
                    , out_color
                 FROM ITCS_OUT_HISTORY
                WHERE 
                    (
                        CONVERT(DATE, WkBegDate) <= %s
                        AND CONVERT(DATE, WkEndDate) >= %s
                    )
        """
    params = [start_date, end_date]


    if dept and dept.strip():
        query += " AND DeptName LIKE %s"
        params.append('%' + dept + '%')

    if name and name.strip():
        query += " AND EmpName LIKE %s"
        params.append('%' + name + '%')

    query += " ORDER BY DeptName, EmpName"

    cursor.execute(query, tuple(params))
    events = cursor.fetchall()

    conn.close()
    return jsonify(events)

@bp.route('/add_event', methods=['POST'])
def add_event():
    user = request.form['user']
    description = request.form['description']
    starttime = request.form['starttime']
    endtime = request.form['endtime']
    color = request.form['color']
    # Convert starttime and endtime to datetime objects
    starttime = datetime.strptime(starttime, '%Y-%m-%dT%H:%M')
    endtime = datetime.strptime(endtime, '%Y-%m-%dT%H:%M')

    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )
    cursor = conn.cursor()

    # 데이터를 ITCS_OUT_HISTORY 테이블에 삽입
    cursor.execute("""
                    INSERT INTO ITCS_OUT_HISTORY (out_user, out_desc, out_start, out_end, out_color)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user, description, starttime, endtime, color))

    conn.commit()
    conn.close()

    return jsonify(success=True)


@bp.route('/delete_event', methods=['POST'])
def delete_event():
    out_start = request.form.get('start')
    out_end = request.form.get('end')
    out_user = request.form.get('user')
    out_desc = request.form.get('description')

    if out_start is not None:
        out_start = datetime.strptime(out_start, '%Y-%m-%dT%H:%M:%S')
        out_start = out_start.strftime('%Y-%m-%d %H:%M:%S')

    if out_end is not None:
        out_end = datetime.strptime(out_end, '%Y-%m-%dT%H:%M:%S')
        out_end = out_end.strftime('%Y-%m-%d %H:%M:%S')

    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )
    cursor = conn.cursor()

    # 쿼리 및 파라미터를 로그로 출력
    print(f"Executing DELETE query with parameters: out_desc={out_desc}, out_user={out_user}, out_start={out_start}, out_end={out_end}")

    # ITCS_OUT_HISTORY 테이블에서 데이터 삭제
    cursor.execute("""
                    DELETE FROM ITCS_OUT_HISTORY
                    WHERE out_start = %s AND out_end = %s AND out_user = %s AND out_desc = %s
                """, (out_start, out_end, out_user, out_desc))

    conn.commit()
    conn.close()

    return jsonify(success=True)

def format_date_to_yyyymmdd(date_str):
    if date_str:
        try:
            date_object = datetime.strptime(date_str, "%Y년 %m월 %d일")
            return date_object.strftime("%Y-%m-%d")
        except ValueError as e:
            print(f"Error occurred while formatting date: {e}")
            return None
    return None