@echo off
cd c:/venvs/myproject
set FLASK_APP=pybo
set FLASK_DEBUG=true
c:/venvs/myproject/scripts/activate

flask run --host=0.0.0.0 --port=8888