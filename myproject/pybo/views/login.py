from flask import Flask, Blueprint, render_template, request, redirect, url_for, session
from datetime import datetime
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
bp = Blueprint('loginPage', __name__, url_prefix='/')

# 가짜 사용자 데이터 (실제로는 DB에서 조회)
users = {
    "1": "1"
}

# 로그인/아웃 처리
@bp.route('/intellics', methods=['GET', 'POST'])
def intellics():
    if request.method == 'POST':
        # 로그인 처리
        username = request.form['username']
        password = request.form['password']

        if username in users and users[username] == password:
            session['username'] = username
            session['login_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return render_template('main.html', username=username, login_time=session['login_time'])
        else:
            return render_template('login.html', error="로그인 실패! 다시 시도하세요.")
    else:
        # 로그아웃 처리 (GET 요청으로 들어온 경우)
        session.pop('username', None)
        session.pop('login_time', None)
        return render_template('login.html', message="로그아웃 되었습니다.")

