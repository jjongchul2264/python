from flask import Flask, Blueprint, render_template, request, redirect, url_for, session
from datetime import datetime
import logging, hashlib, pymssql

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
bp = Blueprint('loginPage', __name__, url_prefix='/')



# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}


users = {

    "jjongchul": hashlib.sha512("Wlswn3511!!@@##".encode()).hexdigest()
}


def get_user_password_hash(user_id: str) ->  dict:
    """
    DB에서 해당 UserId의 패스워드 해시, 부서, 성명, 사번을 가져오는 함수
    """

    try:

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor()
        query = """
                        SELECT LoginPwd
                             , EmpName
                             , DeptName
                             , EmpId
                        FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
                        WHERE UserId = %s
                    """
        cursor.execute(query, (user_id))
        result = cursor.fetchone()
        conn.close()


        if result:
            return {
                "LoginPwd": result[0],  # 패스워드 해시
                "EmpName": result[1],   # 성명
                "DeptName": result[2],  # 부서명
                "EmpId": result[3]      # 사번 (emp_code)
            }

        else:
            return None

    except Exception as e:
        logger.error(f"DB 조회 오류: {e}")
        return None


@bp.route('/intellics', methods=['GET', 'POST'])
def intellics():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # 입력받은 패스워드 해시화
        hashed_pw = hashlib.sha512(password.encode()).hexdigest()

        # DB에서 사용자 해시 조회
        user_info = get_user_password_hash(username)

        if user_info and user_info["LoginPwd"] == hashed_pw:
            # 로그인 성공 처리
            dept = user_info["DeptName"]
            name = user_info["EmpName"]
            emp_code = user_info["EmpId"]
            session['username'] = username      # UserId (jjongchul)
            session['emp_code'] = emp_code      # 사번 (0389)
            display_name = f"{name} ({username})"
            session['login_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            logger.info(f"로그인 성공: {username}")
            return render_template('main.html', username=display_name,deptname=dept,login_time=session['login_time'])
        else:
            logger.warning(f"로그인 실패: {username}")
            return render_template('login.html', error="로그인 실패! 다시 시도하세요.")
    else:
        session.pop('username', None)
        session.pop('login_time', None)
        logger.info("로그아웃 처리 완료")
        return render_template('login.html', message="로그아웃 되었습니다.")