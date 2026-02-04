import os
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.secret_key = "123_jhd_inte!!ics"

    # 업로드 폴더 설정
    upload_path = os.path.join(app.root_path, "uploads")
    app.config['UPLOAD_FOLDER'] = upload_path
    os.makedirs(upload_path, exist_ok=True)

    BASE_DIR = os.path.dirname(__file__)
    viewer_path = os.path.join(BASE_DIR, "static", "viewer")
    app.config['VIEWER_FOLDER'] = viewer_path
    os.makedirs(viewer_path, exist_ok=True)

    # 블루프린트
    from pybo.views import login
    from pybo.views import macaddress
    from pybo.views import webserver
    from pybo.views import outhistory
    from pybo.views import main_views
    from pybo.views import contract
    from pybo.views import education
    from pybo.views import polist
    from pybo.views import salary_deduction
    from pybo.views import salary_deduction_ps
    from pybo.views import comm_vacation_apply_ps

    app.register_blueprint(login.bp)
    app.register_blueprint(main_views.bp)
    app.register_blueprint(education.bp)
    app.register_blueprint(contract.bp)
    app.register_blueprint(webserver.bp)
    app.register_blueprint(macaddress.bp)
    app.register_blueprint(outhistory.bp)
    app.register_blueprint(polist.bp)
    app.register_blueprint(salary_deduction.bp)
    app.register_blueprint(salary_deduction_ps.bp)
    app.register_blueprint(comm_vacation_apply_ps.bp)

    return app