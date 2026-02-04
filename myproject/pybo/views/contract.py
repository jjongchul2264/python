# contract.py  연봉근로계약서
from flask import Blueprint, request, jsonify, render_template, session, redirect, send_from_directory
import pymssql, logging
import base64, datetime
from decimal import Decimal
import win32com.client
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
bp = Blueprint('contract', __name__, url_prefix='/')

# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}


# 연봉계약서 보기(연구직/관리직)
@bp.route('/contract', methods=['GET'])
def contract():
    return render_template('contract.html')

# 연봉계약서 보기(제조/신뢰성)
@bp.route('/contract2', methods=['GET'])
def contract2():
    return render_template('contract2.html')

# 연봉근로계약서(갱신)
@bp.route('/contract_new')
def contract_new():
    return render_template('contract_new.html')

# 주민번호 뒷자리 검증
@bp.route('/verify_regi', methods=['POST'])
def verify_regi():
    data = request.get_json()
    regi = data.get('regi')

    if regi in ["1341926", "1036815"]:
        session['auth_ok'] = True
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

# 인증페이지 라우트
@bp.route('/contract_manage_auth', methods=['GET', 'POST'])
def contract_manage_auth():
    if request.method == 'POST':
        regi = request.form.get('regi')

        if regi == "1341926":
            session['auth_ok'] = True
            return redirect('/contract_manage')
        else:
            return render_template('contract_manage_auth.html', error="잘못된 번호입니다.")

    return render_template('contract_manage_auth.html')

# 연봉근로계약서(갱신)
@bp.route('/contract_manage')
def contract_manage():
    if not session.get('auth_ok'):
        return redirect('/contract_manage_auth')  # 인증 안 된 경우 로그인 페이지로

    return render_template('contract_manage.html')  # 인증된 경우 페이지 보여줌

# 연봉근로계약서 서명
@bp.route('/contract_sign')
def contract_sign():
    return render_template('contract_sign.html')

# 연봉근로계약서 현황 조회
@bp.route('/contract_query')
def contract_query():
    return render_template('contract_query.html')


# 연봉근로계약서 신규 저장
@bp.route('/submit_new', methods=['POST'])
def submit_new():
    try:
        data = request.json

        save_signature_new(
            data.get('emp_code'),
            data.get('emp_name'),
            data.get('emp_spot'),
            data.get('emp_dept'),
            data.get('emp_addr'),
            data.get('emp_birth'),
            data.get('emp_regi_no'),
            data.get('emp_mobile'),
            data.get('emp_email'),
            data.get('emp_jo'),
            data.get('job_from_date'),
            data.get('job_to_date'),
            data.get('job_type'),
            data.get('std_wk_hour'),
            data.get('ot_wk_hour'),
            data.get('tot_wk_hour'),
            data.get('amt_std'),
            data.get('amt_plus'),
            data.get('amt_all'),
            data.get('amt_base'),
            data.get('amt_overtime'),
            data.get('amt_car'),
            data.get('amt_research'),
            data.get('amt_job'),
            data.get('amt_baby'),
            data.get('amt_etc'),
            data.get('amt_sum'),
            data.get('contract_date'),
            data.get('contract_year'),
            data.get('flag'),
            data.get('work_start_flag'),
            data.get('pay_flag'),
            data.get('transaction_flag')
        )

        return jsonify({'message': '세부내역 저장이 완료되었습니다!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def save_signature_new(emp_code, emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile, emp_email, emp_jo,
                       job_from_date, job_to_date, job_type,
                       std_wk_hour, ot_wk_hour, tot_wk_hour,
                       amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job, amt_baby,
                       amt_etc, amt_sum,
                       contract_date, contract_year, flag, work_start_flag, pay_flag, transaction_flag):

    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    # None 처리
    emp_birth = emp_birth or None
    job_from_date = job_from_date or None
    job_to_date = job_to_date or None
    contract_date = contract_date or None

    # 존재 여부 확인
    check_query = """
        SELECT COUNT(*)
        FROM ITCS_CONTRACT_SIGN
        WHERE emp_code = %s AND contract_year = %s
    """
    cursor.execute(check_query, (emp_code, contract_year))
    exists = cursor.fetchone()[0]

    if exists:
        # UPDATE
        query = """
            UPDATE ITCS_CONTRACT_SIGN
            SET emp_name = %s,
                emp_spot = %s,
                emp_dept = %s,
                emp_addr = %s,
                emp_birth = %s,
                emp_regi_no = %s,
                emp_mobile = %s,
                emp_email = %s,
                emp_jo = %s,
                job_from_date = %s,
                job_to_date = %s,
                job_type = %s,
                std_wk_hour = %s,
                ot_wk_hour = %s,
                tot_wk_hour = %s,
                amt_std = %s,
                amt_plus = %s,
                amt_all = %s,
                amt_base = %s,
                amt_overtime = %s,
                amt_car = %s,
                amt_research = %s,
                amt_job = %s,
                amt_baby = %s,
                amt_etc = %s,
                amt_sum = %s,
                contract_date = %s,
                contract_year = %s,
                update_date = GETDATE()
            WHERE emp_code = %s
              AND contract_year = %s
        """
        params = (
            emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile, emp_email, emp_jo,
            job_from_date, job_to_date, job_type,
            std_wk_hour, ot_wk_hour, tot_wk_hour,
            amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job,
            amt_baby, amt_etc, amt_sum,
            contract_date, contract_year, emp_code, contract_year
        )
    else:
        # INSERT
        query = """
            INSERT INTO ITCS_CONTRACT_SIGN (
                emp_code, emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile, emp_email, emp_jo,
                job_from_date, job_to_date, job_type,
                std_wk_hour, ot_wk_hour, tot_wk_hour,
                amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job, 
                amt_baby, amt_etc, amt_sum, flag, work_start_flag, pay_flag, transaction_flag, 
                contract_date, contract_year, create_date
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, GETDATE()
            )
        """
        params = (
            emp_code, emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile, emp_email, emp_jo,
            job_from_date, job_to_date, job_type,
            std_wk_hour, ot_wk_hour, tot_wk_hour,
            amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job,
            amt_baby, amt_etc, amt_sum, flag, work_start_flag, pay_flag, transaction_flag,
            contract_date, contract_year, contract_date
        )

    # 모든 값 변환
    params = tuple(normalize_param(v) for v in params)

    cursor.execute(query, params)
    conn.commit()
    cursor.close()
    conn.close()



# 관리자 세부내역 저장
@bp.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        emp_code = data['emp_code']
        emp_name = data['emp_name']
        emp_spot = data['emp_spot']
        emp_dept = data['emp_dept']
        emp_addr = data['emp_addr']
        emp_birth = data['emp_birth']
        emp_regi_no = data['emp_regi_no']
        emp_mobile = data['emp_mobile']

        job_from_date = data['job_from_date']
        job_to_date = data['job_to_date']
        job_type = data['job_type']

        std_wk_hour = data['std_wk_hour']
        ot_wk_hour = data['ot_wk_hour']
        tot_wk_hour = data['tot_wk_hour']


        amt_std = data['amt_std']
        amt_plus = data['amt_plus']
        amt_all = data['amt_all']
        amt_base = data['amt_base']
        amt_overtime = data['amt_overtime']
        amt_car = data['amt_car']
        amt_research = data['amt_research']
        amt_job = data['amt_job']
        amt_baby = data['amt_baby']
        amt_etc = data['amt_etc']
        amt_sum = data['amt_sum']
        increase_amt = data['increase_amt']

        contract_date = data['contract_date']
        contract_year = data['contract_year']
        contract_flag = data['contract_flag']

        signature_data = data['signature'].split(",")[1]  # 데이터 URL에서 실제 서명 데이터를 추출
        signature = base64.b64decode(signature_data)

        # 저장함수 호출
        save_signature(signature, emp_code, emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no,
                       emp_mobile,
                       job_from_date, job_to_date, job_type,
                       std_wk_hour, ot_wk_hour, tot_wk_hour,
                       amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job, amt_baby, amt_etc, amt_sum,
                       increase_amt,
                       contract_date, contract_year, contract_flag)

        signature_base64 = base64.b64encode(signature).decode('utf-8')

        return jsonify({'message': '세부내역 저장이 완료되었습니다!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 저장 함수
def save_signature(signature, emp_code, emp_name, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile,
                   job_from_date, job_to_date, job_type,
                   std_wk_hour, ot_wk_hour, tot_wk_hour,
                   amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job, amt_baby,
                   amt_etc, amt_sum, increase_amt,
                   contract_date, contract_year, contract_flag):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
    )
    cursor = conn.cursor()

    if not emp_birth:
        emp_birth = None
    if not job_from_date:
        job_from_date = None
    if not job_to_date:
        job_to_date = None
    if not contract_date:
        contract_date = None

    update_query = """
                        update ITCS_CONTRACT_SIGN 
                        set emp_sign = %s,
                            emp_spot = %s,
                            emp_dept = %s,
                            emp_addr = %s,
                            emp_birth = %s,
                            emp_regi_no = %s,
                            emp_mobile = %s,
                            job_from_date = %s,
                            job_to_date = %s,
                            job_type = %s,
                            std_wk_hour = %s,
                            ot_wk_hour = %s,
                            tot_wk_hour = %s,
                            amt_std = %s,
                            amt_plus = %s,
                            amt_all = %s,
                            amt_base = %s,
                            amt_overtime = %s,
                            amt_car = %s,
                            amt_research = %s,
                            amt_job = %s,
                            amt_baby = %s,
                            amt_etc = %s,
                            amt_sum = %s,
                            increase_amt = %s,
                            contract_date = %s,
                            contract_year = %s,
                            transaction_flag = %s,
                            update_date = getdate()
                        where emp_code = %s
                         and contract_year = %s
                        """
    try:
        cursor.execute(update_query, (signature, emp_spot, emp_dept, emp_addr, emp_birth, emp_regi_no, emp_mobile,
                                      job_from_date, job_to_date, job_type,
                                      std_wk_hour, ot_wk_hour, tot_wk_hour,
                                      amt_std, amt_plus, amt_all, amt_base, amt_overtime, amt_car, amt_research, amt_job, amt_baby,
                                      amt_etc, amt_sum, increase_amt,
                                      contract_date, contract_year, contract_flag, emp_code, contract_year))
        conn.commit()
    except pymssql.Error as e:
        print("Error occurred:", e)
    finally:
        cursor.close()
        conn.close()

# 서명 저장
@bp.route('/submit_sign', methods=['POST'])
def submit_sign():
    try:
        data = request.json
        emp_code = data['emp_code']
        contract_year = data['contract_year']

        signature_data = data['signature'].split(",")[1]  # 데이터 URL에서 실제 서명 데이터를 추출
        signature = base64.b64decode(signature_data)

        # 저장함수 호출
        save_signature2(signature, emp_code, contract_year)

        signature_base64 = base64.b64encode(signature).decode('utf-8')

        return jsonify({'message': '세부내역 저장이 완료되었습니다!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 저장 함수
def save_signature2(signature, emp_code, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
    )
    cursor = conn.cursor()

    update_query = """
                        update ITCS_CONTRACT_SIGN 
                        set emp_sign = %s,
                            update_date = getdate()
                        where emp_code = %s
                         and contract_year = %s
                        """
    try:
        cursor.execute(update_query, (signature, emp_code, contract_year))
        conn.commit()
    except pymssql.Error as e:
        print("Error occurred:", e)
    finally:
        cursor.close()
        conn.close()

# 작성일자 일괄 변경
@bp.route('/update_date', methods=['POST'])
def update_date():
    try:
        data = request.json
        results = []

        for emp in data:
            emp_code = emp.get('emp_code')
            contract_year = emp.get('contract_year')
            contract_date = emp.get('create_date')

            # contract_distribution 함수 호출
            result = create_date_update(contract_date, emp_code, contract_year)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_date_update(contract_date, emp_code, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    update_query = """
                    update ITCS_CONTRACT_SIGN 
                    set contract_date = %s
                    where emp_code = %s
                    and contract_year = %s
                    """
    try:
        cursor.execute(update_query, (contract_date, emp_code, contract_year))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'seq': emp_code}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        return {'message': '작성일자 변경 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}

# 배포 처리
@bp.route('/submit2', methods=['POST'])
def submit2():
    try:
        data = request.json
        results = []

        for emp in data:
            emp_code = emp.get('emp_code')
            contract_flag = emp.get('contract_flag')
            contract_year = emp.get('contract_year')

            # contract_distribution 함수 호출
            result = contract_distribution(emp_code, contract_flag, contract_year)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def contract_distribution(emp_code, contract_flag, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    update_query = """
                    update ITCS_CONTRACT_SIGN 
                    set contract_flag = %s
                    where emp_code = %s
                    and contract_year = %s
                    """
    try:
        cursor.execute(update_query, (contract_flag, emp_code, contract_year))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'seq': emp_code}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        if contract_flag == "Y":
            return {'message': '배포 처리가 완료되었습니다!', 'seq': emp_code}
        else:
            return {'message': '배포 취소 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}

# 사용자 확정 처리
@bp.route('/submit3', methods=['POST'])
def submit3():
    try:
        data = request.json
        results = []

        for item in data:
            emp_code = item['emp_code']
            emp_confirm_flag = item['emp_confirm']
            contract_year = item['contract_year']

            result = emp_confirm(emp_code, emp_confirm_flag, contract_year)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def emp_confirm(emp_code, emp_confirm_flag, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    update_query = """
                    UPDATE ITCS_CONTRACT_SIGN 
                    SET emp_confirm = %s
                      , emp_confirm_date = getdate()
                    WHERE emp_code = %s
                      AND contract_year = %s
                    """
    try:
        cursor.execute(update_query, (emp_confirm_flag, emp_code, contract_year))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'emp_code': emp_code, 'seq': item['seq']}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        if emp_confirm_flag == "Y":
            return {'message': '배포 처리가 완료되었습니다!', 'seq': emp_code}
        else:
            return {'message': '배포 취소 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}


# 관리자 확정 처리
@bp.route('/submit4', methods=['POST'])
def submit4():
    try:
        data = request.json
        results = []

        for emp in data:
            emp_code = emp.get('emp_code')
            admin_confirm_flag = emp.get('admin_confirm')
            contract_year = emp.get('contract_year')

            result = admin_confirm(emp_code, admin_confirm_flag, contract_year)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def admin_confirm(emp_code, admin_confirm_flag, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    update_query = """
                    update ITCS_CONTRACT_SIGN 
                    set manage_confirm = %s
                      , manage_confirm_date = getdate()
                    where emp_code = %s
                      and contract_year = %s
                    """
    try:
        cursor.execute(update_query, (admin_confirm_flag, emp_code, contract_year))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'seq': emp_code}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        return {'message': '관리자 확정 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}

# 전체 취소
@bp.route('/allCancel', methods=['POST'])
def allCancel():
    try:
        data = request.json
        results = []

        for emp in data:
            emp_code = emp.get('emp_code')
            cancel_flag = emp.get('cancel_flag')
            contract_year = emp.get('contract_year')

            result = all_Cacel(emp_code, cancel_flag, contract_year)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def all_Cacel(emp_code, cancel_flag, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    update_query = """
                    update ITCS_CONTRACT_SIGN 
                    set contract_flag = %s
                      , emp_confirm = %s
                      , emp_confirm_date = null
                      , manage_confirm = %s
                      , manage_confirm_date = null
                    where emp_code = %s
                      and contract_year = %s
                    """
    try:
        cursor.execute(update_query, (cancel_flag, cancel_flag, cancel_flag, emp_code, contract_year))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'seq': emp_code}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        return {'message': '전체 취소 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}

# 일괄 생성(연봉근로계약서)
@bp.route('/create_contract', methods=['POST'])
def create_contract():
    try:
        data = request.json
        contract_flag = data.get('contract_flag')
        contract_year = data.get('contract_year')
        emp_name = data.get('emp_name')
        dept_name = data.get('dept_name')

        result = contract_create(contract_flag, contract_year, emp_name, dept_name)

        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def contract_create(contract_flag, contract_year, emp_name, dept_name):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    # 입력된 변수값을 확인하기 위해 출력
    print(f"contract_flag: {contract_flag}, contract_year: {contract_year}, emp_name: {emp_name}, dept_name: {dept_name}")

    query = """
            DECLARE @RowCount INT;
            EXEC @RowCount = dbo.CREATE_CONTRACT 
                @contract_flag=%s, 
                @contract_year=%s,
                @emp_name=%s, 
                @dept_name=%s;
            SELECT @RowCount;

            """
    try:
        cursor.execute(query, (contract_flag, contract_year, emp_name, dept_name))
        rows_affected = cursor.fetchone()[0]  # 반환된 행 수를 가져옴

        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e)}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        if contract_flag == "0":
            return {'message': '일괄 생성이 완료 되었습니다!'}
        else:
            return {'message': '조건별 생성이 완료 되었습니다!'}
    else:
        return {'message': '처리된 행이 없습니다.'}


import base64

def get_signature(emp_code, contract_year):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()
    query = "SELECT emp_sign FROM ITCS_CONTRACT_SIGN WHERE emp_code = %s AND contract_year = %s"
    cursor.execute(query, (emp_code, contract_year))
    result = cursor.fetchone()
    conn.close()

    if result and result[0]:
        value = result[0]

        # memoryview 타입이면 bytes로 변환
        if isinstance(value, memoryview):
            value = value.tobytes()

        # bytes 타입만 인코딩
        if isinstance(value, (bytes, bytearray)):
            return base64.b64encode(value).decode('utf-8')
        else:
            raise TypeError(f"emp_sign 타입이 예상과 다릅니다: {type(value)}")
    return None

@bp.route('/get_signature', methods=['GET'])
def get_signature_route():
    try:
        emp_code = request.args.get('emp_code')
        contract_year = request.args.get('year')
        signature = get_signature(emp_code, contract_year)
        if signature:
            print(f"Signature: {signature[:50]}...")  # 너무 길면 앞부분만 로그
            return jsonify({'signature': signature})
        else:
            return jsonify({'error': 'Signature not found'}), 404
    except Exception as e:
        print(f"Error in get_signature_route: {e}")
        return jsonify({'error': str(e)}), 500



# 연봉근로계약서 관리 조회
@bp.route('/api/get_signatures1', methods=['GET'])
def get_signatures1():
    query_type = '1'
    year = request.args.get('year')
    emp_dept = request.args.get('dept')
    emp_code = request.args.get('code')
    emp_name = request.args.get('name')
    status = request.args.get('status')
    empstatus = request.args.get('empstatus')
    managestatus = request.args.get('managestatus')
    empregino = request.args.get('empregino')

    if not emp_dept:
        emp_dept = '%'

    if not emp_code:
        emp_code = '%'

    if not emp_name:
        emp_name = '%'

    try:
        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor(as_dict=True)

        if empregino == 'N':
            query = """
                EXEC dbo.CONTRACT_MANAGE
                    @QUERY_TYPE=%s,
                    @CONTRACT_YEAR=%s, 
                    @EMP_DEPT=%s,
                    @EMP_CODE=%s, 
                    @EMP_NAME=%s, 
                    @STATUS=%s, 
                    @EMP_STATUS=%s, 
                    @MANAGE_STATUS=%s, 
                    @EMP_REGI_NO=%s
            """
            cursor.execute(query,
                           (query_type, year, emp_dept, emp_code, emp_name,
                            status, empstatus, managestatus, empregino))
        else:
            query = """
                EXEC dbo.CONTRACT_MANAGE
                    @QUERY_TYPE=%s,
                    @CONTRACT_YEAR=%s, 
                    @EMP_REGI_NO=%s
            """
            cursor.execute(query, (query_type, year, empregino))

        signatures = cursor.fetchall()

        # 숫자(Decimal) → float 변환
        for signature in signatures:
            for key, value in signature.items():
                if isinstance(value, Decimal):
                    signature[key] = float(value)

        # 날짜 및 서명 처리
        for signature in signatures:
            if signature['emp_sign']:
                signature['emp_sign'] = base64.b64encode(signature['emp_sign']).decode('utf-8')

            if signature['emp_birth']:
                signature['emp_birth'] = signature['emp_birth'].strftime('%Y%m%d')
            else:
                signature['emp_birth'] = ''

            if signature['job_from_date']:
                signature['job_from_date'] = signature['job_from_date'].strftime('%Y%m%d')
            else:
                signature['job_from_date'] = ''

            if signature['job_to_date']:
                signature['job_to_date'] = signature['job_to_date'].strftime('%Y%m%d')
            else:
                signature['job_to_date'] = ''

            if signature['contract_date']:
                signature['contract_date'] = signature['contract_date'].strftime('%Y%m%d')
            else:
                signature['contract_date'] = ''

        conn.close()
        return jsonify({'signatures': signatures})

    except Exception as e:
        print(f'Error occurred: {str(e)}')
        return jsonify({'error': str(e)}), 500

@bp.route('/api/get_signatures2', methods=['GET'])
def get_signatures2():
    query_type = '3'
    year = request.args.get('year')
    emp_code = request.args.get('code')

    if not emp_code:
        emp_code = '%'

    try:
        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
        )
        cursor = conn.cursor(as_dict=True)

        query = """
                            EXEC dbo.CONTRACT_MANAGE
                                @QUERY_TYPE=%s,
                                @CONTRACT_YEAR=%s, 
                                @EMP_CODE=%s
                            """
        cursor.execute(query, (query_type, year, emp_code))
        signatures = cursor.fetchall()

        # 서명 데이터를 base64로 인코딩하여 반환
        for signature in signatures:
            if signature['emp_sign']:
                signature['emp_sign'] = base64.b64encode(signature['emp_sign']).decode('utf-8')

            if signature['emp_birth']:
                formatted_birth = signature['emp_birth'].strftime('%Y%m%d')
                signature['emp_birth'] = formatted_birth

        conn.close()
        return jsonify({'signatures': signatures})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/get_signatures0', methods=['GET'])
def get_signatures0():
    query_type = '0'
    year = request.args.get('year')
    emp_dept = request.args.get('dept')
    emp_code = request.args.get('code')
    emp_name = request.args.get('name')
    status = request.args.get('status')
    empstatus = request.args.get('empstatus')
    managestatus = request.args.get('managestatus')
    empregino = request.args.get('empregino')

    if not emp_dept:
        emp_dept = '%'

    if not emp_code:
        emp_code = '%'

    if not emp_name:
        emp_name = '%'

    try:
        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor(as_dict=True)

        if empregino == 'N':
            query = """
                    EXEC dbo.CONTRACT_MANAGE
                        @QUERY_TYPE=%s,
                        @CONTRACT_YEAR=%s, 
                        @EMP_DEPT=%s,
                        @EMP_CODE=%s, 
                        @EMP_NAME=%s, 
                        @STATUS=%s, 
                        @EMP_STATUS=%s, 
                        @MANAGE_STATUS=%s, 
                        @EMP_REGI_NO=%s
                """
            cursor.execute(query,
                           (query_type, year, emp_dept, emp_code, emp_name,
                            status, empstatus, managestatus, empregino))
        else:
            query = """
                    EXEC dbo.CONTRACT_MANAGE
                        @QUERY_TYPE=%s,
                        @CONTRACT_YEAR=%s, 
                        @EMP_REGI_NO=%s
                """
            cursor.execute(query, (query_type, year, empregino))

        signatures = cursor.fetchall()

        for signature in signatures:
            if signature['emp_confirm_date']:
                formatted_emp_con_date = signature['emp_confirm_date'].strftime('%Y년 %m월 %d일 %H시 %M분 %S초')
                signature['emp_confirm_date'] = formatted_emp_con_date
            if signature['manage_confirm_date']:
                formatted_manage_con_date = signature['manage_confirm_date'].strftime('%Y년 %m월 %d일 %H시 %M분 %S초')
                signature['manage_confirm_date'] = formatted_manage_con_date

        conn.close()
        return jsonify({'signatures': signatures})

    except Exception as e:
        print(f'Error occurred: {str(e)}')
        return jsonify({'error': str(e)}), 500

#연봉근로계약서 보기(연구, 관리)
@bp.route('/getContractData', methods=['GET'])
def get_contract_data():
    query_type = '2'
    year = request.args.get('year')
    emp_code = request.args.get('code')

    if not emp_code:
        emp_code = '%'
    try:
        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
        )
        cursor = conn.cursor(as_dict=True)

        query = """
                                    EXEC dbo.CONTRACT_MANAGE
                                        @QUERY_TYPE=%s,
                                        @CONTRACT_YEAR=%s, 
                                        @EMP_CODE=%s
                                    """
        cursor.execute(query, (query_type, year, emp_code))
        signatures = cursor.fetchall()

        # 서명 데이터를 base64로 인코딩하여 반환
        for signature in signatures:
            if signature['emp_sign']:
                signature['emp_sign'] = base64.b64encode(signature['emp_sign']).decode('utf-8')
            if signature['emp_birth']:
                formatted_birth = signature['emp_birth'].strftime('%Y년 %m월 %d일')
                signature['emp_birth'] = formatted_birth
            if signature['job_from_date']:
                formatted_from = signature['job_from_date'].strftime('%Y년 %m월 %d일')
                signature['job_from_date'] = formatted_from
            if signature['job_to_date']:
                formatted_to = signature['job_to_date'].strftime('%Y년 %m월 %d일')
                signature['job_to_date'] = formatted_to
            if signature['contract_date']:
                formatted_con_date = signature['contract_date'].strftime('%Y년 %m월 %d일')
                signature['contract_date'] = formatted_con_date

        conn.close()

        # 쿼리에서 select 한 employee_name 값을 val1에 대입
        val0_value = signatures[0]['pg_time'] if signatures else 'No Data Found'
        val1_value = signatures[0]['emp_name'] if signatures else 'No Data Found'
        val2_value = signatures[0]['emp_spot'] if signatures else 'No Data Found'
        val3_value = signatures[0]['emp_addr'] if signatures else 'No Data Found'
        val4_value = signatures[0]['emp_birth'] if signatures else 'No Data Found'
        val5_value = signatures[0]['emp_mobile'] if signatures else 'No Data Found'
        val6_value = signatures[0]['job_from_date'] if signatures else 'No Data Found'
        val7_value = signatures[0]['job_to_date'] if signatures else 'No Data Found'
        val8_value = signatures[0]['job_type'] if signatures else 'No Data Found'
        val9_value = signatures[0]['contract_date'] if signatures else 'No Data Found'
        val10_value = signatures[0]['up_moo'] if signatures else 'No Data Found'

        val_gun_moo_value = signatures[0]['gun_moo'] if signatures else 'No Data Found'
        val_work_start_flag = signatures[0]['work_start_flag'] if signatures else 'No Data Found'

        data = {
            'valgunmoo': val_gun_moo_value,
            'valworkstartflag': val_work_start_flag,
            'val0': val0_value,
            'val1': val1_value,
            'val2': val2_value,
            'val3': val3_value,
            'val4': val4_value,
            'val5': val5_value,
            'val6': val6_value,
            'val7': val7_value,
            'val8': val8_value,
            'val9': val9_value,
            'val10': val10_value,
            'amt0': safe_format(signature['amt_plus']),
            'amt1': safe_format(signature['amt_base']),
            'amt2': safe_format(signature['amt_overtime']),
            'amt3': safe_format(signature['amt_car']),
            'amt4': safe_format(signature['amt_research']),
            'amt5': safe_format(signature['amt_job']),
            'amt6': safe_format(signature['amt_baby']),
            'amt7': safe_format(signature['amt_sum']),
            'amt8': safe_format(signature['amt_etc']),
            'signatures': signature['emp_sign']
        }
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def safe_format(value):
    try:
        return "{:,}".format(int(value)) if value is not None else ''
    except (ValueError, TypeError):
        return ''

#연봉근로계약서 보기(제조, 신뢰성)
@bp.route('/getContractData2', methods=['GET'])
def get_contract_data2():
    query_type = '2'
    year = request.args.get('year')
    emp_code = request.args.get('code')

    if not emp_code:
        emp_code = '%'
    try:
        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
        )
        cursor = conn.cursor(as_dict=True)

        query = """
                                    EXEC dbo.CONTRACT_MANAGE
                                        @QUERY_TYPE=%s,
                                        @CONTRACT_YEAR=%s, 
                                        @EMP_CODE=%s
                                    """
        cursor.execute(query, (query_type, year, emp_code))
        signatures = cursor.fetchall()

        # 서명 데이터를 base64로 인코딩하여 반환
        for signature in signatures:
            if signature['emp_sign']:
                signature['emp_sign'] = base64.b64encode(signature['emp_sign']).decode('utf-8')
            if signature['emp_birth']:
                formatted_birth = signature['emp_birth'].strftime('%Y년 %m월 %d일')
                signature['emp_birth'] = formatted_birth
            if signature['job_from_date']:
                formatted_from = signature['job_from_date'].strftime('%Y년 %m월 %d일')
                signature['job_from_date'] = formatted_from
            if signature['job_to_date']:
                formatted_to = signature['job_to_date'].strftime('%Y년 %m월 %d일')
                signature['job_to_date'] = formatted_to
            if signature['contract_date']:
                formatted_con_date = signature['contract_date'].strftime('%Y년 %m월 %d일')
                signature['contract_date'] = formatted_con_date

        conn.close()

        # 쿼리에서 select 한 employee_name 값을 val1에 대입
        val01_value = signatures[0]['su_dang'] if signatures else 'No Data Found'
        val02_value = signatures[0]['su_dang2'] if signatures else 'No Data Found'

        val1_value = signatures[0]['emp_name'] if signatures else 'No Data Found'
        val2_value = signatures[0]['emp_spot'] if signatures else 'No Data Found'
        val3_value = signatures[0]['emp_addr'] if signatures else 'No Data Found'
        val4_value = signatures[0]['emp_birth'] if signatures else 'No Data Found'
        val5_value = signatures[0]['emp_mobile'] if signatures else 'No Data Found'
        val6_value = signatures[0]['job_from_date'] if signatures else 'No Data Found'
        val7_value = signatures[0]['job_to_date'] if signatures else 'No Data Found'
        val8_value = signatures[0]['job_type'] if signatures else 'No Data Found'
        val9_value = signatures[0]['contract_date'] if signatures else 'No Data Found'

        val_gun_moo_value = signatures[0]['gun_moo'] if signatures else 'No Data Found'

        data = {
            'valgunmoo': val_gun_moo_value,
            'val1': val1_value,
            'val2': val2_value,
            'val3': val3_value,
            'val4': val4_value,
            'val5': val5_value,
            'val6': val6_value,
            'val7': val7_value,
            'val8': val8_value,
            'val9': val9_value,
            'val01': val01_value,
            'val02': val02_value,
            'amt0': safe_format(signature['amt_plus']),
            'amt1': safe_format(signature['amt_base']),
            'amt2': safe_format(signature['amt_overtime']),
            'amt3': safe_format(signature['amt_car']),
            'amt4': safe_format(signature['amt_research']),
            'amt5': safe_format(signature['amt_job']),
            'amt6': safe_format(signature['amt_baby']),
            'amt7': safe_format(signature['amt_sum']),
            'amt8': safe_format(signature['amt_etc']),
            'signatures': signature['emp_sign']
        }
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def safe_format(value):
    try:
        return "{:,}".format(int(value)) if value is not None else ''
    except (ValueError, TypeError):
        return ''

# 연봉처리 (flag값에 따라서 호봉증가/진급처리)
@bp.route('/salary_increase', methods=['POST'])
def salary_increase():
    try:
        data = request.json
        results = []

        for emp in data:
            contract_year = emp.get('contract_year')
            emp_code = emp.get('emp_code')
            contract_flag = emp.get('contract_flag')
            increase_amt_manual = emp.get('increase_amt_manual')

            # salary_increate_run 함수 호출
            result = salary_increate_run(contract_year, emp_code, contract_flag,  increase_amt_manual)
            results.append(result)

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def salary_increate_run(contract_year, emp_code, contract_flag, increase_amt_manual):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    exec_query = """
                    EXEC dbo.CONTRACT_AMT_UPDATE
                        @CONTRACT_YEAR=%s, 
                        @EMP_CODE=%s,
                        @CONTRACT_FLAG=%s,
                        @INCREASE_AMT=%s
                    """
    try:
        cursor.execute(exec_query, (contract_year, emp_code, contract_flag, increase_amt_manual))
        rows_affected = cursor.rowcount
        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e), 'seq': emp_code}
    finally:
        cursor.close()
        conn.close()

    if rows_affected > 0:
        return {'message': '호봉 증가 처리가 완료되었습니다!', 'seq': emp_code}
    else:
        return {'message': '처리된 행이 없습니다.', 'seq': emp_code}


# 신규 생성(연봉근로계약서)
@bp.route('/new_create_contract', methods=['POST'])
def new_create_contract():
    try:
        data = request.json
        contract_year = data.get('contract_year')
        emp_name = data.get('emp_name')

        result = new_create_contract(contract_year, emp_name)

        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def new_create_contract(contract_year, emp_name):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor(as_dict=True)  # 결과를 dict 형태로 받기 위해 as_dict=True

    print(f"contract_year: {contract_year}, emp_name: {emp_name}")

    query = """
        EXEC dbo.NEW_CREATE_CONTRACT 
            @contract_year=%s,
            @emp_name=%s;
    """
    try:
        cursor.execute(query, (contract_year, emp_name))
        rows = cursor.fetchall()  # 실제 SELECT 결과 가져오기
        print("프로시저 실행 결과:", rows)

        conn.commit()
    except pymssql.Error as e:
        print(f"Error occurred: {e}")
        return {'error': str(e)}
    finally:
        cursor.close()
        conn.close()

    if rows:
        # 여러 행이 있을 수 있으므로 리스트 그대로 반환
        return {'data': rows, 'message': '조회 성공'}
    else:
        return {'message': '조회된 데이터가 없습니다.'}

def normalize_param(value):
    if isinstance(value, Decimal):
        return float(value)
    elif isinstance(value, datetime.datetime):
        return value.strftime("%Y-%m-%d")
    elif isinstance(value, datetime.date):
        return value.strftime("%Y-%m-%d")
    elif isinstance(value, dict):
        # dict는 지원되지 않으므로 문자열로 변환
        return str(value)
    elif value is None or value == "":
        return None
    return value
