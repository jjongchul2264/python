import win32com.client
import pythoncom
import os

def convert_ppt_to_images(ppt_path, output_dir):
    pythoncom.CoInitialize()
    try:
        powerpoint = win32com.client.Dispatch("PowerPoint.Application")
        powerpoint.Visible = 1

        presentation = powerpoint.Presentations.Open(ppt_path)

        # PowerPoint는 SaveAs로 전체 슬라이드를 이미지로 저장할 수 있음
        # output_dir\슬라이드1.JPG, 슬라이드2.JPG ... 자동 생성됨
        presentation.SaveAs(os.path.join(output_dir), 17)

        presentation.Close()
        powerpoint.Quit()

    except Exception as e:
        print("PPT 변환 실패:", e)

    finally:
        pythoncom.CoUninitialize()