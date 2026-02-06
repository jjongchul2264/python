# Project: [프로젝트 이름]
# Framework: Flask (Python)

## 🏗️ Project Structure
- `app/`: 핵심 애플리케이션 코드 (Routes, Models)
- `templates/`: Jinja2 HTML 템플릿
- `static/`: CSS, JS, 이미지 파일
- `config.py`: 설정 파일
- `requirements.txt`: 의존성 목록

## 🛠️ Tech Stack
- Backend: Python 3.x, Flask
- Database: SQLite (SQLAlchemy)
- Frontend: Jinja2, Bootstrap 5

## 📜 Coding Guidelines & Rules
- **Blueprints**: 기능 단위로 라우트를 분리하여 (Blueprints) 구조화합니다.
- **Security**:
    - 모든 HTML 폼은 CSRF 토큰을 사용합니다 (`Flask-WTF`).
    - 디버그 모드는 개발 환경에서만 `True`로 설정합니다.
- **Structure**:
    - 앱 팩토리 패턴(`create_app()`)을 사용하여 `__init__.py`에서 인스턴스를 생성합니다.
- **Database**:
    - SQL 대신 `Flask-SQLAlchemy` ORM을 사용합니다.
    - 데이터베이스 마이그레이션은 `Flask-Migrate`를 사용합니다.

## 🚀 Workflow
- **Code Change**: 코드를 변경한 후 항상 파일 저장 후 서버를 재시작하거나 핫 리로드 기능을 확인합니다.
- **Testing**: 수정 후 `pytest`를 실행하여 500 에러가 없는지 확인합니다.
- **File Naming**: 파이썬 파일은 snake_case, HTML 파일은 kebab-case를 권장합니다.

## 📝 Important Notes
- 시크릿 키는 절대 코드에 하드코딩하지 않고 `.env` 파일에서 가져옵니다.
