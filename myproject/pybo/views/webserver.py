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
bp = Blueprint('webserver', __name__, url_prefix='/')

@bp.route('dashboard')
def dashboard():
    return render_template('dashboard.html')


def get_server_status(ip, username, password, os_type="Windows"):
    if os_type == 'Linux':
        return get_linux_server_status(ip, username, password)
    elif os_type == 'Windows':
        return get_windows_server_status(ip, username, password)
    else:
        return "Unsupported OS type", None

def get_linux_server_status(ip, username, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ip, username=username, password=password)

    try:
        # CPU 사용량 확인
        stdin, stdout, stderr = client.exec_command("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'")
        cpu_usage = float(stdout.read().decode().strip())

        # 메모리 사용량 확인
        stdin, stdout, stderr = client.exec_command("free -m")
        mem_info = stdout.readlines()[1].split()
        total_memory = int(mem_info[1])
        used_memory = int(mem_info[2])
        memory_usage = round((used_memory / total_memory) * 100, 2)

        return {
            'cpu_usage': cpu_usage,
            'total_memory': total_memory,
            'used_memory': used_memory,
            'memory_usage': memory_usage
        }
    except Exception as e:
        return str(e), None
    finally:
        client.close()


def get_windows_server_status(ip, username, password):
    session = winrm.Session(f'http://{ip}:5985/wsman', auth=(username, password), transport='ntlm')

    try:
        # CPU 사용량 확인
        cpu_command = 'powershell "Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average"'
        cpu_result = session.run_cmd(cpu_command)
        cpu_usage = float(cpu_result.std_out.decode().replace('\r\n', '').strip())

        # 메모리 사용량 확인
        mem_command = """
            powershell "Get-WmiObject Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json"
            """
        mem_result = session.run_cmd(mem_command)
        mem_info = json.loads(mem_result.std_out.decode().replace('\r\n', '').strip())
        total_memory = int(mem_info['TotalVisibleMemorySize'])
        free_memory = int(mem_info['FreePhysicalMemory'])
        used_memory = total_memory - free_memory
        memory_usage = round((used_memory / total_memory) * 100, 2)  # 소수점 두 자리까지 반올림

        return {
            'cpu_usage': cpu_usage,
            'total_memory': total_memory,
            'used_memory': used_memory,
            'memory_usage': memory_usage
        }
    except json.JSONDecodeError as e:
        return f"JSON Decode Error: {e}", None
    except Exception as e:
        return str(e), None

@bp.route('/serverstatus', methods=['GET'])
def serverstatus():
    servers = [
        {'name': '캡스 서버(15 : 캐드 라이선스)', 'ip': '192.168.0.15', 'username': 'ITCSHQ\Administrator', 'password': 'ahems!tjqj@', 'ostype': 'Windows'},
        {'name': 'ERP 서버(74 : Active)', 'ip': '192.168.0.74', 'username': 'ITCSHQ\INTELLICS-ERP-SVR', 'password': 'Int!8230', 'ostype': 'Windows'},
        {'name': 'ERP 서버(73 : Stand by)', 'ip': '192.168.0.73', 'username': 'ITCSHQ\INTELLICS-ERP-SVR', 'password': 'Int!8230', 'ostype': 'Windows'},
        {'name': 'Backup 서버(71)', 'ip': '192.168.0.71', 'username': 'ITCSHQ\INTELLICS-BACKUP-SVR', 'password': 'Int!8230', 'ostype': 'Windows'},
        {'name': 'Groupware 서버(72)', 'ip': '192.168.0.72', 'username': 'ITCSHQ\INTELLICS-GW-SVR', 'password': 'Int!8230', 'ostype': 'Windows'},
        {'name': 'Mail 서버(80)', 'ip': '192.168.0.80', 'username': 'root', 'password': 'Inte!!ics567!', 'ostype': 'Linux'},
        {'name': 'AD 서버(40)', 'ip': '192.168.0.40', 'username': 'ITCSHQ\itcs_admin', 'password': 'Inte!!ics567!', 'ostype': 'Windows'},
        {'name': 'AD2 서버(50)', 'ip': '192.168.0.50', 'username': 'ITCSHQ\itcs_admin', 'password': 'Inte!!ics567!', 'ostype': 'Windows'}
        # 추가 서버 정보
    ]
    server_statuses = [None] * len(servers)  # 서버 정보 순서 유지

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_index = {executor.submit(get_server_status, server['ip'], server['username'], server['password'], server['ostype']): idx
                           for idx, server in enumerate(servers)}
        for future in concurrent.futures.as_completed(future_to_index):
            idx = future_to_index[future]
            stats = future.result()
            if stats is not None:
                server_statuses[idx] = {
                    'name': servers[idx]['name'],
                    'cpu_usage': f"{stats['cpu_usage']}%",
                    'total_memory': stats['total_memory'],
                    'used_memory': stats['used_memory'],
                    'memory_usage': f"{stats['memory_usage']}%"
                }
        # 클라이언트가 요청한 형식에 따라 응답을 전송합니다
        if request.args.get('format') == 'json':
            return jsonify(server_statuses)
        else:
            return render_template('serverstatus.html', server_statuses=server_statuses)


@bp.route('/webstatus')
def webstatus():
    websites = [
        {'name': 'ERP(TEST)', 'url': 'https://erp.intellics.co.kr:8300/'},
        {'name': 'ERP(REAL)', 'url': 'https://erp.intellics.co.kr/'},
        {'name': 'Groupware', 'url': 'https://office.intellics.co.kr/'},
        {'name': 'E-Mail', 'url': 'https://email.intellics.co.kr/'},
        {'name': 'Intellics Addon', 'url': 'http://192.168.0.72:8888/'}
    ]
    web_statuses = []

    for site in websites:
        try:
            response = requests.get(site['url'])
            status = 'Up' if 200 <= response.status_code < 300 else 'Down'
        except requests.ConnectionError:
            status = 'Down'
        except requests.exceptions.InvalidURL:
            status = 'Invalid URL'

        web_statuses.append({'name': site['name'], 'status': status})

    erp_test_combined_status = get_combined_status(web_statuses, ['ERP(TEST:74)', 'ERP(TEST:73)'])
    erp_test_combined_name = get_combined_name(web_statuses, ['ERP(TEST:74)', 'ERP(TEST:73)'])

    if request.args.get('format') == 'json':
        return jsonify(web_statuses)
    else:
        return render_template(
            'webstatus.html',
            statuses=web_statuses,
            erp_test_combined_status=erp_test_combined_status,
            erp_test_combined_name=erp_test_combined_name
        )

def get_combined_status(statuses, names):
    for status in statuses:
        if status['name'] in names and status['status'] == 'Up':
            return 'Up'
    return 'Down'

def get_combined_name(statuses, names):
    for status in statuses:
        if status['name'] in names and status['status'] == 'Up':
            return status['name'].split(':')[-1]  # TEST:74 또는 TEST:73 반환
    return names[0].split(':')[-1]