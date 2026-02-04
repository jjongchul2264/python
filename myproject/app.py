import os
from pybo import create_app

app = create_app()

app.config['UPLOAD_FOLDER'] = r"C:\venvs\myproject\pybo\uploads"
app.config['VIEWER_FOLDER'] = r"C:\venvs\myproject\pybo\static\viewer"

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['VIEWER_FOLDER'], exist_ok=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888, debug=False)













