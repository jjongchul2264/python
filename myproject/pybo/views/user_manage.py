"""
사용자 관리 API 모듈
- 사용자 목록 조회/검색
- 사용자 상세 정보
- 권한 관리
"""
from flask import Blueprint, jsonify, request, render_template, session
import logging
import pymssql

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bp = Blueprint('user_manage', __name__, url_prefix='/user')

# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}


def get_db_connection():
    """데이터베이스 연결 반환"""
    return pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )


# =============================================
# 사용자 관리 페이지
# =============================================
@bp.route('/manage')
def user_manage_page():
    """사용자 관리 페이지 렌더링"""
    return render_template('user_manage.html')


# =============================================
# 사용자 목록 API
# =============================================
@bp.route('/api/list', methods=['GET'])
def get_user_list():
    """사용자 목록 조회 (페이징, 검색 지원)"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        keyword = request.args.get('keyword', '')
        dept_code = request.args.get('dept_code', '')

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 전체 건수 조회
        count_query = """
            SELECT COUNT(*) as total
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE 1=1
        """
        params = []

        if keyword:
            count_query += " AND (EmpName LIKE %s OR UserId LIKE %s OR EmpId LIKE %s)"
            params.extend([f'%{keyword}%', f'%{keyword}%', f'%{keyword}%'])

        if dept_code:
            count_query += " AND DeptSeq = %s"
            params.append(dept_code)

        cursor.execute(count_query, tuple(params) if params else None)
        total = cursor.fetchone()['total']

        # 사용자 목록 조회
        offset = (page - 1) * page_size
        query = """
            SELECT UserId as emp_id
                  , EmpId as emp_code
                  , EmpName as emp_name
                  , UMJPName as emp_rank
                  , DeptName as dept_name
                  , DeptSeq as dept_code
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE 1=1
        """

        params = []
        if keyword:
            query += " AND (EmpName LIKE %s OR UserId LIKE %s OR EmpId LIKE %s)"
            params.extend([f'%{keyword}%', f'%{keyword}%', f'%{keyword}%'])

        if dept_code:
            query += " AND DeptSeq = %s"
            params.append(dept_code)

        query += " ORDER BY DeptName, EmpName OFFSET %s ROWS FETCH NEXT %s ROWS ONLY"
        params.extend([offset, page_size])

        cursor.execute(query, tuple(params))
        users = cursor.fetchall()
        conn.close()

        return jsonify({
            'success': True,
            'data': users,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        })
    except Exception as e:
        logger.error(f"사용자 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/detail/<emp_code>', methods=['GET'])
def get_user_detail(emp_code):
    """사용자 상세 정보 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 기본 정보 조회
        query = """
            SELECT  UserId as emp_id
                  , EmpId as emp_code
                  , EmpName as emp_name
                  , UMJPName as emp_rank
                  , DeptName as dept_name
                  , DeptSeq as dept_code
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE EmpId = %s
        """
        cursor.execute(query, (emp_code,))
        user = cursor.fetchone()

        if not user:
            conn.close()
            return jsonify({'success': False, 'error': '사용자를 찾을 수 없습니다.'}), 404

        # 사용자 메뉴 권한 조회
        auth_query = """
            SELECT a.auth_id, a.menu_id, a.submenu_id, a.auth_type, a.auth_value,
                   a.can_view, m.menu_name, s.submenu_name
            FROM TB_MENU_AUTH a
            LEFT JOIN TB_MENU m ON a.menu_id = m.menu_id
            LEFT JOIN TB_SUBMENU s ON a.submenu_id = s.submenu_id
            WHERE a.auth_type = 'USER' AND a.auth_value = %s
        """
        cursor.execute(auth_query, (emp_code,))
        user_auths = cursor.fetchall()

        conn.close()

        user['auths'] = user_auths

        return jsonify({'success': True, 'data': user})
    except Exception as e:
        logger.error(f"사용자 상세 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 부서 목록 API
# =============================================
@bp.route('/api/depts', methods=['GET'])
def get_dept_list():
    """부서 목록 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT DISTINCT DeptSeq as dept_code, DeptName as dept_name
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            ORDER BY DeptName
        """
        cursor.execute(query)
        depts = cursor.fetchall()
        conn.close()

        return jsonify({'success': True, 'data': depts})
    except Exception as e:
        logger.error(f"부서 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/dept/users/<dept_code>', methods=['GET'])
def get_dept_users(dept_code):
    """부서별 사용자 목록 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT UserId as emp_id
                  , EmpId as emp_code
                  , EmpName as emp_name
                  , UMJPName as emp_rank
                  , DeptName as dept_name
                  , DeptSeq as dept_code
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE DeptSeq = %s
            ORDER BY DeptName, EmpName
        """
        cursor.execute(query, (dept_code,))
        users = cursor.fetchall()
        conn.close()

        return jsonify({'success': True, 'data': users})
    except Exception as e:
        logger.error(f"부서별 사용자 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 사용자 권한 관리 API
# =============================================
@bp.route('/api/auth/list/<emp_code>', methods=['GET'])
def get_user_auths(emp_code):
    """사용자의 전체 메뉴 권한 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 사용자 직접 권한
        user_auth_query = """
            SELECT a.auth_id, a.menu_id, a.submenu_id, 'USER' as source_type,
                   a.can_view, m.menu_name, s.submenu_name, s.submenu_url
            FROM TB_MENU_AUTH a
            LEFT JOIN TB_MENU m ON a.menu_id = m.menu_id
            LEFT JOIN TB_SUBMENU s ON a.submenu_id = s.submenu_id
            WHERE a.auth_type = 'USER' AND a.auth_value = %s
        """
        cursor.execute(user_auth_query, (emp_code,))
        user_auths = cursor.fetchall()

        # 사용자 소속 부서의 권한
        dept_auth_query = """
            SELECT a.auth_id, a.menu_id, a.submenu_id, 'DEPT' as source_type,
                   a.can_view, m.menu_name, s.submenu_name, s.submenu_url,
                   a.auth_value as dept_code
            FROM TB_MENU_AUTH a
            LEFT JOIN TB_MENU m ON a.menu_id = m.menu_id
            LEFT JOIN TB_SUBMENU s ON a.submenu_id = s.submenu_id
            WHERE a.auth_type = 'DEPT' AND a.auth_value IN (
                SELECT DeptSeq FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
                WHERE UserId = %s
            )
        """
        cursor.execute(dept_auth_query, (emp_code,))
        dept_auths = cursor.fetchall()

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'user_auths': user_auths,
                'dept_auths': dept_auths
            }
        })
    except Exception as e:
        logger.error(f"사용자 권한 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/auth/add', methods=['POST'])
def add_user_auth():
    """사용자에게 메뉴 권한 추가"""
    try:
        data = request.get_json()
        emp_code = data.get('emp_code')
        menu_id = data.get('menu_id')
        submenu_id = data.get('submenu_id')
        can_view = data.get('can_view', True)

        if not emp_code or not submenu_id:
            return jsonify({'success': False, 'error': '사용자와 서브메뉴는 필수입니다.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # 기존 권한 확인
        check_query = """
            SELECT auth_id FROM TB_MENU_AUTH
            WHERE auth_type = 'USER' AND auth_value = %s AND submenu_id = %s
        """
        cursor.execute(check_query, (emp_code, submenu_id))
        existing = cursor.fetchone()

        if existing:
            conn.close()
            return jsonify({'success': False, 'error': '이미 해당 권한이 존재합니다.'}), 400

        # 권한 추가
        insert_query = """
            INSERT INTO TB_MENU_AUTH (menu_id, submenu_id, auth_type, auth_value, can_view)
            VALUES (%s, %s, 'USER', %s, %s)
        """
        cursor.execute(insert_query, (menu_id, submenu_id, emp_code, 1 if can_view else 0))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"권한 추가 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/auth/remove/<int:auth_id>', methods=['DELETE'])
def remove_user_auth(auth_id):
    """사용자 메뉴 권한 삭제"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM TB_MENU_AUTH WHERE auth_id = %s", (auth_id,))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"권한 삭제 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 메뉴 목록 API (권한 추가용)
# =============================================
@bp.route('/api/menus', methods=['GET'])
def get_menus_for_auth():
    """메뉴 목록 조회 (권한 추가용)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 메뉴 목록
        menu_query = """
            SELECT menu_id, menu_name, menu_icon
            FROM TB_MENU
            WHERE is_active = 1
            ORDER BY menu_order
        """
        cursor.execute(menu_query)
        menus = cursor.fetchall()

        # 각 메뉴의 서브메뉴 조회
        for menu in menus:
            submenu_query = """
                SELECT submenu_id, submenu_name, submenu_url
                FROM TB_SUBMENU
                WHERE menu_id = %s AND is_active = 1
                ORDER BY submenu_order
            """
            cursor.execute(submenu_query, (menu['menu_id'],))
            menu['submenus'] = cursor.fetchall()

        conn.close()

        return jsonify({'success': True, 'data': menus})
    except Exception as e:
        logger.error(f"메뉴 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 사용자 접근 로그 API
# =============================================
@bp.route('/api/log/<emp_code>', methods=['GET'])
def get_user_access_log(emp_code):
    """사용자 메뉴 접근 로그 조회"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 전체 건수
        count_query = """
            SELECT COUNT(*) as total
            FROM TB_MENU_LOG
            WHERE emp_code = %s
        """
        cursor.execute(count_query, (emp_code,))
        total = cursor.fetchone()['total']

        # 로그 조회
        offset = (page - 1) * page_size
        query = """
            SELECT l.log_id, l.menu_id, l.submenu_id, l.access_time,
                   m.menu_name, s.submenu_name
            FROM TB_MENU_LOG l
            LEFT JOIN TB_MENU m ON l.menu_id = m.menu_id
            LEFT JOIN TB_SUBMENU s ON l.submenu_id = s.submenu_id
            WHERE l.emp_code = %s
            ORDER BY l.access_time DESC
            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
        """
        cursor.execute(query, (emp_code, offset, page_size))
        logs = cursor.fetchall()
        conn.close()

        # datetime 변환
        for log in logs:
            if log['access_time']:
                log['access_time'] = log['access_time'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            'success': True,
            'data': logs,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        })
    except Exception as e:
        logger.error(f"접근 로그 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 관리자 권한 API
# =============================================
@bp.route('/api/admin/check/<emp_code>', methods=['GET'])
def check_admin(emp_code):
    """관리자 여부 확인"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)
        cursor.execute("SELECT admin_id FROM TB_USER_ADMIN WHERE emp_code = %s", (emp_code,))
        result = cursor.fetchone()
        conn.close()
        return jsonify({'success': True, 'is_admin': result is not None})
    except Exception as e:
        logger.error(f"관리자 확인 오류: {e}")
        return jsonify({'success': False, 'is_admin': False})


@bp.route('/api/admin/set', methods=['POST'])
def set_admin():
    """관리자 권한 설정/해제"""
    try:
        data = request.get_json()
        emp_code = data.get('emp_code')
        is_admin = data.get('is_admin', False)

        conn = get_db_connection()
        cursor = conn.cursor()

        if is_admin:
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM TB_USER_ADMIN WHERE emp_code = %s)
                INSERT INTO TB_USER_ADMIN (emp_code) VALUES (%s)
            """, (emp_code, emp_code))
        else:
            cursor.execute("DELETE FROM TB_USER_ADMIN WHERE emp_code = %s", (emp_code,))

        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"관리자 설정 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
