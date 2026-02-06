"""
메뉴 관리 API 모듈
- 메뉴/서브메뉴 CRUD
- 권한 관리
- 사용 통계
"""
from flask import Blueprint, jsonify, request, render_template, session
import logging
import pymssql

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bp = Blueprint('menu_manage', __name__, url_prefix='/menu')

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
# 메뉴 관리 페이지
# =============================================
@bp.route('/manage')
def menu_manage_page():
    """메뉴 관리 페이지 렌더링"""
    return render_template('menu_manage.html')


# =============================================
# 메뉴 API
# =============================================
@bp.route('/api/menu/list', methods=['GET'])
def get_menu_list():
    """전체 메뉴 목록 조회 (관리자용)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT menu_id, menu_name, menu_icon, menu_order, is_active,
                   created_at, updated_at
            FROM TB_MENU
            ORDER BY menu_order
        """
        cursor.execute(query)
        menus = cursor.fetchall()
        conn.close()

        # datetime 객체를 문자열로 변환
        for menu in menus:
            if menu['created_at']:
                menu['created_at'] = menu['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if menu['updated_at']:
                menu['updated_at'] = menu['updated_at'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({'success': True, 'data': menus})
    except Exception as e:
        logger.error(f"메뉴 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/user', methods=['GET'])
def get_user_menu():
    """사용자별 메뉴 조회 (권한 적용)"""
    try:
        username = session.get('username', '')  # UserId (jjongchul)
        emp_code = session.get('emp_code', '')  # 사번 (0389)

        logger.info(f"메뉴 조회 - username: {username}, emp_code: {emp_code}")

        conn = get_db_connection()

        cursor = conn.cursor(as_dict=True)

        # 관리자 여부 확인
        cursor.execute("SELECT COUNT(*) as cnt FROM TB_USER_ADMIN WHERE emp_code = %s", (emp_code,))
        admin_result = cursor.fetchone()
        is_admin = admin_result['cnt'] > 0
        logger.info(f"관리자 확인 - emp_code: {emp_code}, is_admin: {is_admin}")

        # 메인 메뉴 조회
        menu_query = """
            SELECT m.menu_id, m.menu_name, m.menu_icon, m.menu_order
            FROM TB_MENU m
            WHERE m.is_active = 1
            ORDER BY m.menu_order
        """
        cursor.execute(menu_query)
        menus = cursor.fetchall()

        # 각 메뉴의 서브메뉴 조회
        for menu in menus:
            if is_admin:
                # 관리자는 모든 서브메뉴 표시
                submenu_query = """
                    SELECT s.submenu_id, s.submenu_name, s.submenu_url, s.submenu_order
                    FROM TB_SUBMENU s
                    WHERE s.menu_id = %s AND s.is_active = 1
                    ORDER BY s.submenu_order
                """
                cursor.execute(submenu_query, (menu['menu_id'],))
            else:
                # 일반 사용자는 권한 있는 메뉴만 표시
                submenu_query = """
                    SELECT s.submenu_id, s.submenu_name, s.submenu_url, s.submenu_order
                    FROM TB_SUBMENU s
                    WHERE s.menu_id = %s AND s.is_active = 1
                    AND EXISTS (
                        SELECT 1 FROM TB_MENU_AUTH a
                        WHERE a.submenu_id = s.submenu_id
                        AND a.can_view = 1
                        AND (
                            (a.auth_type = 'USER' AND a.auth_value = %s)
                            OR (a.auth_type = 'DEPT' AND a.auth_value IN (
                                SELECT DeptSeq FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
                                WHERE UserId = %s
                            ))
                        )
                    )
                    ORDER BY s.submenu_order
                """
                cursor.execute(submenu_query, (menu['menu_id'], emp_code, username))
            menu['submenus'] = cursor.fetchall()

        # 서브메뉴가 없는 메뉴는 제외
        menus = [m for m in menus if len(m.get('submenus', [])) > 0]

        conn.close()
        return jsonify({'success': True, 'data': menus, 'is_admin': is_admin})
    except Exception as e:
        logger.error(f"사용자 메뉴 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/create', methods=['POST'])
def create_menu():
    """메인 메뉴 생성"""
    try:
        data = request.get_json()
        menu_name = data.get('menu_name')
        menu_icon = data.get('menu_icon', 'fas fa-folder')
        menu_order = data.get('menu_order', 0)

        if not menu_name:
            return jsonify({'success': False, 'error': '메뉴명은 필수입니다.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # INSERT 실행
        insert_query = """
            INSERT INTO TB_MENU (menu_name, menu_icon, menu_order, is_active)
            VALUES (%s, %s, %s, 1)
        """
        cursor.execute(insert_query, (menu_name, menu_icon, menu_order))

        # 새로 생성된 ID 조회
        cursor.execute("SELECT SCOPE_IDENTITY()")
        result = cursor.fetchone()
        new_id = result[0] if result else None

        conn.commit()
        conn.close()

        if new_id is None:
            return jsonify({'success': False, 'error': 'ID 생성 실패'}), 500

        return jsonify({'success': True, 'menu_id': int(new_id)})
    except Exception as e:
        logger.error(f"메뉴 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/update/<int:menu_id>', methods=['PUT'])
def update_menu(menu_id):
    """메인 메뉴 수정"""
    try:
        data = request.get_json()
        menu_name = data.get('menu_name')
        menu_icon = data.get('menu_icon')
        is_active = data.get('is_active')

        conn = get_db_connection()
        cursor = conn.cursor()

        updates = []
        params = []

        if menu_name is not None:
            updates.append("menu_name = %s")
            params.append(menu_name)
        if menu_icon is not None:
            updates.append("menu_icon = %s")
            params.append(menu_icon)
        if is_active is not None:
            updates.append("is_active = %s")
            params.append(1 if is_active else 0)

        updates.append("updated_at = GETDATE()")
        params.append(menu_id)

        query = f"UPDATE TB_MENU SET {', '.join(updates)} WHERE menu_id = %s"
        cursor.execute(query, tuple(params))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"메뉴 수정 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/delete/<int:menu_id>', methods=['DELETE'])
def delete_menu(menu_id):
    """메인 메뉴 삭제"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 먼저 해당 메뉴의 모든 서브메뉴에 대한 로그 삭제
        cursor.execute("DELETE FROM TB_MENU_LOG WHERE menu_id = %s", (menu_id,))
        # 해당 메뉴의 모든 서브메뉴에 대한 권한 삭제
        cursor.execute("DELETE FROM TB_MENU_AUTH WHERE menu_id = %s", (menu_id,))
        # 해당 메뉴의 모든 서브메뉴 삭제
        cursor.execute("DELETE FROM TB_SUBMENU WHERE menu_id = %s", (menu_id,))
        # 메뉴 삭제
        cursor.execute("DELETE FROM TB_MENU WHERE menu_id = %s", (menu_id,))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"메뉴 삭제 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/order', methods=['PUT'])
def update_menu_order():
    """메뉴 순서 변경"""
    try:
        data = request.get_json()
        orders = data.get('orders', [])  # [{menu_id: 1, order: 1}, ...]

        conn = get_db_connection()
        cursor = conn.cursor()

        for item in orders:
            cursor.execute(
                "UPDATE TB_MENU SET menu_order = %s, updated_at = GETDATE() WHERE menu_id = %s",
                (item['order'], item['menu_id'])
            )

        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"메뉴 순서 변경 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 서브메뉴 API
# =============================================
@bp.route('/api/submenu/list/<int:menu_id>', methods=['GET'])
def get_submenu_list(menu_id):
    """서브메뉴 목록 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT submenu_id, menu_id, submenu_name, submenu_url,
                   submenu_order, is_active, created_at, updated_at
            FROM TB_SUBMENU
            WHERE menu_id = %s
            ORDER BY submenu_order
        """
        cursor.execute(query, (menu_id,))
        submenus = cursor.fetchall()
        conn.close()

        for submenu in submenus:
            if submenu['created_at']:
                submenu['created_at'] = submenu['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if submenu['updated_at']:
                submenu['updated_at'] = submenu['updated_at'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({'success': True, 'data': submenus})
    except Exception as e:
        logger.error(f"서브메뉴 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/submenu/create', methods=['POST'])
def create_submenu():
    """서브메뉴 생성"""
    try:
        data = request.get_json()
        menu_id = data.get('menu_id')
        submenu_name = data.get('submenu_name')
        submenu_url = data.get('submenu_url', '')
        submenu_order = data.get('submenu_order', 0)

        if not menu_id or not submenu_name:
            return jsonify({'success': False, 'error': '메뉴ID와 서브메뉴명은 필수입니다.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # INSERT 실행
        insert_query = """
            INSERT INTO TB_SUBMENU (menu_id, submenu_name, submenu_url, submenu_order, is_active)
            VALUES (%s, %s, %s, %s, 1)
        """
        cursor.execute(insert_query, (menu_id, submenu_name, submenu_url, submenu_order))

        # 새로 생성된 ID 조회
        cursor.execute("SELECT SCOPE_IDENTITY()")
        result = cursor.fetchone()
        new_id = result[0] if result else None

        conn.commit()
        conn.close()

        if new_id is None:
            return jsonify({'success': False, 'error': 'ID 생성 실패'}), 500

        return jsonify({'success': True, 'submenu_id': int(new_id)})
    except Exception as e:
        logger.error(f"서브메뉴 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/submenu/update/<int:submenu_id>', methods=['PUT'])
def update_submenu(submenu_id):
    """서브메뉴 수정"""
    try:
        data = request.get_json()
        submenu_name = data.get('submenu_name')
        submenu_url = data.get('submenu_url')
        is_active = data.get('is_active')

        conn = get_db_connection()
        cursor = conn.cursor()

        updates = []
        params = []

        if submenu_name is not None:
            updates.append("submenu_name = %s")
            params.append(submenu_name)
        if submenu_url is not None:
            updates.append("submenu_url = %s")
            params.append(submenu_url)
        if is_active is not None:
            updates.append("is_active = %s")
            params.append(1 if is_active else 0)

        updates.append("updated_at = GETDATE()")
        params.append(submenu_id)

        query = f"UPDATE TB_SUBMENU SET {', '.join(updates)} WHERE submenu_id = %s"
        cursor.execute(query, tuple(params))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"서브메뉴 수정 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/submenu/delete/<int:submenu_id>', methods=['DELETE'])
def delete_submenu(submenu_id):
    """서브메뉴 삭제"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 먼저 관련 로그 삭제
        cursor.execute("DELETE FROM TB_MENU_LOG WHERE submenu_id = %s", (submenu_id,))
        # 관련 권한 삭제
        cursor.execute("DELETE FROM TB_MENU_AUTH WHERE submenu_id = %s", (submenu_id,))
        # 서브메뉴 삭제
        cursor.execute("DELETE FROM TB_SUBMENU WHERE submenu_id = %s", (submenu_id,))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"서브메뉴 삭제 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/submenu/order', methods=['PUT'])
def update_submenu_order():
    """서브메뉴 순서 변경"""
    try:
        data = request.get_json()
        orders = data.get('orders', [])  # [{submenu_id: 1, order: 1}, ...]

        conn = get_db_connection()
        cursor = conn.cursor()

        for item in orders:
            cursor.execute(
                "UPDATE TB_SUBMENU SET submenu_order = %s, updated_at = GETDATE() WHERE submenu_id = %s",
                (item['order'], item['submenu_id'])
            )

        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"서브메뉴 순서 변경 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 권한 관리 API
# =============================================
@bp.route('/api/menu/auth/<int:menu_id>', methods=['GET'])
def get_menu_auth(menu_id):
    """메뉴 권한 조회"""
    try:
        submenu_id = request.args.get('submenu_id')

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        if submenu_id:
            query = """
                SELECT auth_id, menu_id, submenu_id, auth_type, auth_value, can_view, created_at
				     , b.empname as emp_name, b.deptname as dept_name, b.UMJPName as emp_rank
                FROM TB_MENU_AUTH A JOIN [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2] B ON A.auth_value = B.empid
				WHERE auth_type = 'USER'
                AND submenu_id = %s
				union all
				SELECT auth_id, menu_id, submenu_id, auth_type, auth_value, can_view, created_at
				     , b.empname as emp_name, b.deptname as dept_name, b.UMJPName as emp_rank
                FROM TB_MENU_AUTH A JOIN [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2] B ON A.auth_value = B.DEPTSEQ
				WHERE auth_type = 'DEPT'
                AND submenu_id = %s
            """
            cursor.execute(query, (submenu_id, submenu_id,))
        else:
            query = """
                SELECT auth_id, menu_id, submenu_id, auth_type, auth_value, can_view, created_at
				     , b.empname as emp_name, b.deptname as dept_name, b.UMJPName as emp_rank
                FROM TB_MENU_AUTH A JOIN [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2] B ON A.auth_value = B.empid
				WHERE auth_type = 'USER'
                AND menu_id = %s
				union all
				SELECT auth_id, menu_id, submenu_id, auth_type, auth_value, can_view, created_at
				     , b.empname as emp_name, b.deptname as dept_name, b.UMJPName as emp_rank
                FROM TB_MENU_AUTH A JOIN [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2] B ON A.auth_value = B.DEPTSEQ
				WHERE auth_type = 'DEPT'
                AND menu_id = %s
            """
            cursor.execute(query, (menu_id, menu_id,))

        auths = cursor.fetchall()
        conn.close()

        for auth in auths:
            if auth['created_at']:
                auth['created_at'] = auth['created_at'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({'success': True, 'data': auths})
    except Exception as e:
        logger.error(f"권한 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/auth/set', methods=['POST'])
def set_menu_auth():
    """권한 설정"""
    try:
        data = request.get_json()
        menu_id = data.get('menu_id')
        submenu_id = data.get('submenu_id')
        auth_type = data.get('auth_type')  # 'USER' or 'DEPT'
        auth_value = data.get('auth_value')
        can_view = data.get('can_view', True)

        if not auth_type or not auth_value:
            return jsonify({'success': False, 'error': '권한 타입과 값은 필수입니다.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # 기존 권한 확인
        check_query = """
            SELECT auth_id FROM TB_MENU_AUTH
            WHERE menu_id = %s AND submenu_id = %s AND auth_type = %s AND auth_value = %s
        """
        cursor.execute(check_query, (menu_id, submenu_id, auth_type, auth_value))
        existing = cursor.fetchone()

        if existing:
            # 기존 권한 업데이트
            cursor.execute(
                "UPDATE TB_MENU_AUTH SET can_view = %s WHERE auth_id = %s",
                (1 if can_view else 0, existing[0])
            )
        else:
            # 새 권한 추가
            cursor.execute(
                """INSERT INTO TB_MENU_AUTH (menu_id, submenu_id, auth_type, auth_value, can_view)
                   VALUES (%s, %s, %s, %s, %s)""",
                (menu_id, submenu_id, auth_type, auth_value, 1 if can_view else 0)
            )

        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"권한 설정 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/auth/delete/<int:auth_id>', methods=['DELETE'])
def delete_menu_auth(auth_id):
    """권한 삭제"""
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
# 통계 API
# =============================================
@bp.route('/api/menu/log', methods=['POST'])
def log_menu_access():
    """메뉴 접근 로그 기록"""
    try:
        data = request.get_json()
        menu_id = data.get('menu_id')
        submenu_id = data.get('submenu_id')

        username = session.get('username', '')
        emp_code = ''
        if '(' in username and ')' in username:
            emp_code = username.split('(')[1].replace(')', '').strip()

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO TB_MENU_LOG (menu_id, submenu_id, emp_code) VALUES (%s, %s, %s)",
            (menu_id, submenu_id, emp_code)
        )
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"로그 기록 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/menu/stats', methods=['GET'])
def get_menu_stats():
    """메뉴 사용 통계 조회"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        # 메뉴별 접근 통계
        query = """
            SELECT
                m.menu_name,
                s.submenu_name,
                COUNT(l.log_id) as access_count,
                COUNT(DISTINCT l.emp_code) as unique_users
            FROM TB_MENU_LOG l
            LEFT JOIN TB_MENU m ON l.menu_id = m.menu_id
            LEFT JOIN TB_SUBMENU s ON l.submenu_id = s.submenu_id
            WHERE 1=1
        """
        params = []

        if start_date:
            query += " AND l.access_time >= %s"
            params.append(start_date)
        if end_date:
            query += " AND l.access_time <= %s"
            params.append(end_date + ' 23:59:59')

        query += " GROUP BY m.menu_name, s.submenu_name ORDER BY access_count DESC"

        cursor.execute(query, tuple(params) if params else None)
        stats = cursor.fetchall()

        # 일별 접근 추이
        trend_query = """
            SELECT
                CONVERT(VARCHAR(10), access_time, 120) as date,
                COUNT(*) as count
            FROM TB_MENU_LOG
            WHERE 1=1
        """
        trend_params = []

        if start_date:
            trend_query += " AND access_time >= %s"
            trend_params.append(start_date)
        if end_date:
            trend_query += " AND access_time <= %s"
            trend_params.append(end_date + ' 23:59:59')

        trend_query += " GROUP BY CONVERT(VARCHAR(10), access_time, 120) ORDER BY date"

        cursor.execute(trend_query, tuple(trend_params) if trend_params else None)
        trend = cursor.fetchall()

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'stats': stats,
                'trend': trend
            }
        })
    except Exception as e:
        logger.error(f"통계 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================
# 사용자/부서 검색 API (권한 설정용)
# =============================================
@bp.route('/api/search/users', methods=['GET'])
def search_users():
    """사용자 검색"""
    try:
        keyword = request.args.get('keyword', '')

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT TOP 20 UserId as emp_id, Empid as emp_code, EmpName as emp_name, DeptName as dept_name
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE EmpName LIKE %s OR UserId LIKE %s OR Empid LIKE %s
            ORDER BY EmpName
        """
        cursor.execute(query, (f'%{keyword}%', f'%{keyword}%', f'%{keyword}%'))
        users = cursor.fetchall()
        conn.close()

        return jsonify({'success': True, 'data': users})
    except Exception as e:
        logger.error(f"사용자 검색 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/api/search/depts', methods=['GET'])
def search_depts():
    """부서 검색"""
    try:
        keyword = request.args.get('keyword', '')

        conn = get_db_connection()
        cursor = conn.cursor(as_dict=True)

        query = """
            SELECT DISTINCT TOP 20 DeptSeq as dept_code, DeptName as dept_name
            FROM [ERP_ITCS].[ITCS].[DBO].[ITCS_VWHROrgEmpQueryGw2]
            WHERE DeptName LIKE %s OR DeptSeq LIKE %s
            ORDER BY DeptName
        """
        cursor.execute(query, (f'%{keyword}%', f'%{keyword}%'))
        depts = cursor.fetchall()
        conn.close()

        return jsonify({'success': True, 'data': depts})
    except Exception as e:
        logger.error(f"부서 검색 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
