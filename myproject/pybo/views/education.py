# documents_viewer 문서 뷰어
from flask import Blueprint, request, jsonify, send_from_directory, current_app, render_template
from utils.ppt_converter import convert_ppt_to_images
from pdf2image import convert_from_path
from datetime import datetime
import pymssql, logging, base64, os, re, traceback, shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
bp = Blueprint('documents_viewer', __name__, url_prefix='/docs')


# 데이터베이스 연결 설정
db_config = {
    'server': '192.168.0.72:1433',
    'user': 'sa',
    'password': 'Int!8230',
    'database': 'master'
}

# 외계인 파일명 막기
def clean_filename(filename):
    # 한글, 영문, 숫자, 일부 특수문자만 허용
    return re.sub(r'[^가-힣a-zA-Z0-9._-]', '', filename)

# pdf-> 이미지 반환
def convert_pdf_to_images(pdf_path, output_dir):
    pages = convert_from_path(pdf_path)
    for i, page in enumerate(pages, start=1):
        page.save(os.path.join(output_dir, f"슬라이드{i}.JPG"), "JPEG")

# 등록번호 자동 채번 함수
def generate_edu_no(edu_date):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    # 날짜를 yyyymmdd 형태로 변환
    date_prefix = edu_date.replace("-", "")  # "2025-01-19" → "20250119"

    # 해당 날짜의 마지막 번호 조회
    query = """
           SELECT ISNULL(RIGHT(MAX(edu_no), 2), '00')
             FROM ITCS_EDUCATION
            WHERE edu_no LIKE %s + '%'
       """
    cursor.execute(query, (date_prefix,))
    last_seq = cursor.fetchone()[0]  # "00", "01", "02" ...

    # 다음 번호 계산
    next_seq = str(int(last_seq) + 1).zfill(2)  # 1 → "01", 9 → "09", 10 → "10"

    # 최종 edu_no 생성
    new_edu_no = date_prefix + next_seq

    cursor.close()
    conn.close()

    return new_edu_no

# 이미지 반환
@bp.route("/viewer/<filename>/<int:page>")
def viewer_image(filename, page):
    folder_name = os.path.splitext(filename)[0]
    base_path = os.path.join(current_app.root_path, "static", "viewer", folder_name)
    return send_from_directory(base_path, f"슬라이드{page}.JPG")


# HTML 뷰어 페이지
@bp.route("/viewer_page/<filename>/<emp_email>")
def viewer_page(filename, emp_email):
    folder_name = os.path.splitext(filename)[0]
    slide_dir = os.path.join(current_app.root_path, "static", "viewer", folder_name)

    # 슬라이드 개수 계산
    slides = [f for f in os.listdir(slide_dir) if f.startswith("슬라이드")]
    total_slides = len(slides)

    return render_template("education_viewer.html",
                           filename=filename,
                           total_slides=total_slides,
                           emp_email=emp_email)

# 뷰어 오픈시 데이터 조회
@bp.route('/viewer-data')
def viewer_data():
    filename = request.args.get('filename')   # body.dataset.filename
    emp_email = request.args.get('email')     # body.dataset.email

    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    sql = """
    SELECT A.edu_no
         , A.edu_date
         , B.edu_name
         , B.edu_begin_date
         , B.edu_end_date
         , A.emp_sign
         , A.emp_grand_date
    FROM ITCS_EDUCATION_GRAN A
    LEFT OUTER JOIN ITCS_EDUCATION B ON A.edu_no = B.edu_no
    WHERE A.edu_no = %s
      AND A.emp_email = %s
    """
    cursor.execute(sql, (filename, emp_email))
    row = cursor.fetchone()
    if row:
        columns = [col[0].lower() for col in cursor.description]  # 컬럼명을 소문자로
        result = dict(zip(columns, row))  # 튜플 → 딕셔너리로 변환

        # 날짜 포맷 처리
        if result['edu_date']:
            result['edu_date'] = result['edu_date'].strftime('%Y년 %m월 %d일')  # datetime-local용
        else:
            result['edu_date'] = ''
        if result['emp_grand_date']:
            result['emp_grand_date'] = result['emp_grand_date'].strftime('%Y년 %m월 %d일')  # datetime-local용
        else:
            result['emp_grand_date'] = ''
        if result['edu_begin_date']:
            result['edu_begin_date'] = result['edu_begin_date'].strftime('%Y-%m-%dT%H:%M')
        else:
            result['edu_begin_date'] = ''
        if result['edu_end_date']:
            result['edu_end_date'] = result['edu_end_date'].strftime('%Y-%m-%dT%H:%M')
        else:
            result['edu_end_date'] = ''

        if result['emp_sign'] and isinstance(result['emp_sign'], (bytes, bytearray)):
            result['emp_sign'] = base64.b64encode(result['emp_sign']).decode('utf-8')

        return jsonify(result)
    else:
        return jsonify({"error": "조회 결과 없음"}), 404

# 서명 저장
@bp.route('/submit_sign', methods=['POST'])
def submit_sign():
    try:
        data = request.json
        edu_no = data['edu_no']
        emp_email = data['emp_email']

        signature_data = data['signature'].split(",")[1]  # 데이터 URL에서 실제 서명 데이터를 추출
        signature = base64.b64decode(signature_data)

        # 저장함수 호출
        save_signature(signature, edu_no, emp_email)

        signature_base64 = base64.b64encode(signature).decode('utf-8')

        return jsonify({'message': '서명 저장이 완료되었습니다!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 서명 저장 함수
def save_signature(signature, edu_no, emp_email):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'  # 데이터베이스 연결 시 UTF-8 인코딩 설정
    )
    cursor = conn.cursor()

    update_query = """
                        update ITCS_EDUCATION_GRAN 
                        set emp_sign = %s
                          , emp_grand_date = edu_date
                          , update_date = getdate()
                        where edu_no = %s
                         and emp_email = %s
                        """
    try:
        cursor.execute(update_query, (signature, edu_no, emp_email))
        conn.commit()
    except pymssql.Error as e:
        print("Error occurred:", e)
    finally:
        cursor.close()
        conn.close()


# 파일 업로드 화면
@bp.route("/education_report")
def education_report():
    return render_template("education_report.html")


# 파일 업로드 화면
@bp.route("/education_manage")
def education_manage():
    return render_template("education_manage.html")

# 교육 등록저장
@bp.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        edu_date = data['edu_date']
        edu_name = data['edu_name']
        edu_begin_date = datetime.strptime(data['edu_begin_date'], "%Y-%m-%dT%H:%M")
        edu_end_date = datetime.strptime(data['edu_end_date'], "%Y-%m-%dT%H:%M")


        # 자동번호 생성 (임시값, 실제는 프로시저에서 최종 채번)
        edu_no = generate_edu_no(edu_date)

        # 저장 후 실제 채번된 번호 반환
        new_edu_no = save_edu(edu_date, edu_no, edu_name, edu_begin_date, edu_end_date)

        return jsonify({'message': '저장이 완료되었습니다!', 'edu_no': new_edu_no})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 저장 함수, 저장 시에 교육대상인원 자동 생성된다.
def save_edu(edu_date, edu_no, edu_name, edu_begin_date, edu_end_date):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    # 저장 프로시저 호출
    cursor.callproc(
        'EDUCATION_MANAGE',
        (edu_date, edu_no, edu_name, edu_begin_date, edu_end_date)
    )

    # 프로시저에서 SELECT @edu_no 반환 → fetchone()으로 읽음
    row = cursor.fetchone()
    new_edu_no = row[0] if row else edu_no

    conn.commit()
    cursor.close()
    conn.close()

    return new_edu_no

# 등록된 교육 삭제
@bp.route('/edu_delete', methods=['POST'])
def edu_delete():
    try:
        data = request.get_json()
        selected_Data = data.get('selectedData', [])

        if not selected_Data:
            return jsonify({'error': 'edu_no_list 값이 없습니다'}), 400

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor()

        print("받은 데이터:", selected_Data)

        # 여러 개 삭제 처리
        for item  in selected_Data:
            print("edu_no:", item.get("edu_no"))

            edu_no = item.get("edu_no")

            cursor.execute("DELETE FROM ITCS_EDUCATION_GRAN WHERE edu_no = %s", (edu_no,))
            cursor.execute("DELETE FROM ITCS_EDUCATION WHERE edu_no = %s", (edu_no,))
            # 첨부 파일 삭제
            delete_doc(edu_no)

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': '삭제 완료', 'deleted': selected_Data})
    except Exception as e:
        print("삭제 에러:", str(e))
        return jsonify({'error': '서버 내부 오류'}), 500

# 교육 삭제 시 교육번호로 첨부된 파일도 삭제 처리
def delete_doc(edu_no):
    try:
        # 업로드 폴더 (날짜/교육번호 구조)
        date_folder = edu_no.replace("-", "")
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], date_folder[:8], edu_no)

        if os.path.exists(upload_folder):
            shutil.rmtree(upload_folder)
            print(f"업로드 폴더 삭제 완료: {upload_folder}")
        else:
            print(f"업로드 폴더 없음: {upload_folder}")

        # viewer 폴더 (교육번호 기준)
        viewer_root = current_app.config['VIEWER_FOLDER']
        viewer_folder = os.path.join(viewer_root, edu_no)

        if os.path.exists(viewer_folder):
            shutil.rmtree(viewer_folder)
            print(f"뷰어 폴더 삭제 완료: {viewer_folder}")
        else:
            print(f"뷰어 폴더 없음: {viewer_folder}")

    except Exception as e:
        print("폴더 삭제 중 에러:", e)


# 첨부파일 업로드 후, 등록된 교육정보에 파일/패스 정보 업데이트
@bp.route('/upload_doc', methods=['POST'])
def upload_doc():
    try:
        file = request.files['file']
        edu_no = request.form['edu_no']
        edu_date = request.form['edu_date']

        print("=== UPLOAD_FOLDER 경로 확인 ===")
        print("UPLOAD_FOLDER:", current_app.config.get('UPLOAD_FOLDER'))
        print("==============================")

        # 업로드 경로
        UPLOAD_ROOT = current_app.config['UPLOAD_FOLDER']

        # 등록날짜 폴더 생성 (ex: 20251223)
        date_folder = edu_date.replace("-", "")
        date_dir = os.path.join(UPLOAD_ROOT, date_folder)
        os.makedirs(date_dir, exist_ok=True)

        # 문서번호 폴더 (ex: 2025122310)
        doc_dir = os.path.join(date_dir, edu_no)
        os.makedirs(doc_dir, exist_ok=True)

        # 원본 파일명 (DB 저장용)
        original_filename = file.filename

        # 저장 파일명 = 등록번호 + 확장자
        ext = os.path.splitext(original_filename)[1]
        saved_filename = f"{edu_no}{ext}"

        save_path = os.path.join(doc_dir, saved_filename)
        file.save(save_path)

        # DB에는 원본 파일명 + 저장 파일명 저장
        db_path = f"{date_folder}/{saved_filename}"

        # 문서 -> 이미지 변환
        viewer_root = os.path.join(current_app.root_path, "static", "viewer")
        viewer_dir = os.path.join(viewer_root, edu_no)
        os.makedirs(viewer_dir, exist_ok=True)

        if ext.lower() in [".pdf"]:
            convert_pdf_to_images(save_path, viewer_dir)
        elif ext.lower() in [".ppt", ".pptx"]:
            convert_ppt_to_images(save_path, viewer_dir)
        else:
            return jsonify({"error": "지원하지 않는 파일 형식입니다"}), 400

        print("=== update_file_info 호출 직전 값 확인 ===")
        print("original_filename:", repr(original_filename))
        print("db_path:", repr(db_path))
        print("edu_no:", repr(edu_no))
        print("=======================================")

        # 파일정보 업데이트(교육번호가 키값임)
        update_file_info(original_filename, db_path, edu_no)

        return jsonify({
            "status": "ok",
            "file_name": original_filename,
            "file_path": db_path,
            "viewer_path": f"/static/viewer/{edu_no}/"
        })

    except Exception as e:
        # 에러 로그를 콘솔에 상세히 출력
        print("=== 업로드 중 에러 발생 ===")
        print("에러 메시지:", str(e))
        traceback.print_exc()
        print("==========================")

        return jsonify({"error": str(e)}), 500

# 파일 정보 업데이트 함수
def update_file_info(file_name, file_path, edu_no):
    conn = pymssql.connect(
        server=db_config['server'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        charset='utf8'
    )
    cursor = conn.cursor()

    query = """
        UPDATE ITCS_EDUCATION
        SET attach_file_name = %s,
            attach_file_path = %s,
            update_date = GETDATE()
        WHERE edu_no = %s
    """

    cursor.execute(query, (file_name, file_path, edu_no))
    conn.commit()

    print("업데이트된 행 수:", cursor.rowcount)  # 디버깅용

    cursor.close()
    conn.close()

# 레포트 조회 함수
@bp.route('/report', methods=['GET'])
def report():
    try:
        edu_no = request.args.get("edu_no")

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor(as_dict=True)

        sql = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.emp_name) AS seq,
                A.edu_date,
                A.edu_no,
                B.edu_name,
                A.emp_dept,
                A.emp_code,
                A.emp_name,
                A.emp_grand_date,
                A.emp_sign
            FROM ITCS_EDUCATION_GRAN A
              LEFT OUTER JOIN ITCS_EDUCATION B ON A.edu_no = B.edu_no
            WHERE A.edu_no = %s
              AND A.emp_grand_date IS NOT NULL
            ORDER BY A.emp_name
        """

        cursor.execute(sql, (edu_no, ))
        rows = cursor.fetchall()

        # 날짜 및 서명 처리
        for row in rows:
            if row['edu_date']:
                row['edu_date'] = row['edu_date'].strftime('%Y년 %m월 %d일')
            else:
                row['edu_date'] = ''
            if row['emp_grand_date']:
                row['emp_grand_date'] = row['emp_grand_date'].strftime('%Y년 %m월 %d일')
            else:
                row['emp_grand_date'] = ''
            if row['emp_sign']:
                row['emp_sign'] = base64.b64encode(row['emp_sign']).decode('utf-8')

        edu_name = rows[0]['edu_name'] if rows else ''
        edu_date = rows[0]['edu_date'] if rows else ''

        cursor.close()
        conn.close()

        return jsonify({"rows": rows,
                        "edu_no": edu_no,
                        "edu_name": edu_name,
                        "edu_date": edu_date
                        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 조회 함수
@bp.route('/query', methods=['GET'])
def query():
    try:
        from_date = request.args.get("from")
        to_date = request.args.get("to")

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor(as_dict=True)

        sql = """
            SELECT 
                edu_no,
                edu_date,
                edu_name,
                edu_begin_date,
                edu_end_date,
                attach_file_name,
                edu_email_flag
            FROM ITCS_EDUCATION
            WHERE edu_date BETWEEN %s AND %s
            ORDER BY edu_no DESC
        """

        cursor.execute(sql, (from_date, to_date))
        rows = cursor.fetchall()

        # 날짜 및 서명 처리
        for row in rows:
            if row['edu_date']:
                row['edu_date'] = row['edu_date'].strftime('%Y년 %m월 %d일')
            else:
                row['edu_date'] = ''
            if row['edu_begin_date']:
                row['edu_begin_date'] = row['edu_begin_date'].strftime("%Y년 %m월 %d일 %H시 %M분")
            else:
                row['edu_begin_date'] = ''
            if row['edu_end_date']:
                row['edu_end_date'] = row['edu_end_date'].strftime("%Y년 %m월 %d일 %H시 %M분")
            else:
                row['edu_end_date'] = ''
        cursor.close()
        conn.close()

        return jsonify({"rows": rows})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 수료자 List 조회
@bp.route('/query_gran', methods=['GET'])
def query_gran():
    try:
        edu_no = request.args.get("edu_no")

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor(as_dict=True)

        # 첫 번째 쿼리: 수료자 리스트
        cursor.execute("""
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY emp_dept, emp_name) AS seq,
                        edu_no,
                        emp_dept,
                        emp_code,
                        emp_name,
                        emp_grand_date
                    FROM ITCS_EDUCATION_GRAN
                    WHERE edu_no = %s
                    ORDER BY emp_dept, emp_name
                """, (edu_no,))
        rows = cursor.fetchall()



        # 두 번째 쿼리: 총인원 / 미수료 인원
        cursor.execute("""
                    SELECT 
                        COUNT(*) AS tot_count,
                        SUM(CASE WHEN emp_grand_date IS NULL THEN 1 ELSE 0 END) AS nc_count
                    FROM ITCS_EDUCATION_GRAN
                    WHERE edu_no = %s
                """, (edu_no,))
        summary = cursor.fetchone()

        cursor.close()
        conn.close()

        # 날짜 및 서명 처리
        for row in rows:
            if row['emp_grand_date']:
                row['emp_grand_date'] = row['emp_grand_date'].strftime('%Y년 %m월 %d일')
            else:
                row['emp_grand_date'] = ''

        return jsonify({
            "rows": rows,
            "tot_count": summary['tot_count'],
            "nc_count": summary['nc_count']
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 이메일 발송
@bp.route('/send_mail', methods=['POST'])
def send_mail():
    try:
        data = request.get_json()
        edu_no_list = data.get('edu_no_list', [])
        flag = data.get('flag')
        emp_code1 = data.get('emp_code1')

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor()

        for edu_no in edu_no_list:
            cursor.callproc("EDUCATION_MAILING", (edu_no, flag, emp_code1))

        conn.commit()
        cursor.close()
        conn.close()

        #return jsonify({"message": f"{len(edu_no)}건 메일 발송 완료"})
        return jsonify({"message": "메일 발송 완료"})
    except Exception as e:
        print("메일 발송 에러:", str(e))
        return jsonify({"error": str(e)}), 500


# 대상자 삭제 함수
@bp.route('/emp_delete', methods=['POST'])
def emp_delete():
    try:
        data = request.get_json()
        selected_Data = data.get('selectedData', [])

        if not selected_Data:
            return jsonify({'error': 'emp code list 값이 없습니다'}), 400

        conn = pymssql.connect(
            server=db_config['server'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            charset='utf8'
        )
        cursor = conn.cursor()

        print("받은 데이터:", selected_Data)

        # 여러 개 삭제 처리
        for item  in selected_Data:
            print("edu_no:", item.get("edu_no"))
            print("emp_code:", item.get("emp_code"))

            edu_no = item.get("edu_no")
            emp_code = item.get("emp_code")

            cursor.execute("DELETE FROM ITCS_EDUCATION_GRAN WHERE edu_no = %s AND emp_code = %s", (edu_no, emp_code,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': '대상자 삭제 완료', 'deleted': selected_Data})
    except Exception as e:
        print("삭제 에러:", str(e))
        return jsonify({'error': '서버 내부 오류'}), 500
