from flask import Blueprint, Flask, request, jsonify, render_template, session, redirect, url_for
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
bp = Blueprint('main', __name__, url_prefix='/')

# 기본
@bp.route('/')
def index():
    return render_template('index.html')
# 맥어드레스 관련
@bp.route('/test')
def test():
    return render_template('test.html')
# 맥어드레스 관련
@bp.route('/history')
def history():
    return render_template('history.html')
# 맥어드레스 관련
@bp.route('/create')
def create():
    return render_template('create.html')


