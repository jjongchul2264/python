import os
from pdf2image import convert_from_path

def convert_pdf_to_images(pdf_path, output_dir):
    """
    PDF 파일을 PNG 이미지로 변환하는 함수
    pdf_path: 업로드된 PDF 파일 경로
    output_dir: 변환된 이미지가 저장될 폴더
    """

    # 출력 폴더 없으면 생성
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # PDF → 이미지 변환
    pages = convert_from_path(pdf_path)

    # 페이지별 PNG 저장
    for idx, page in enumerate(pages, start=1):
        page_path = os.path.join(output_dir, f"Page{idx}.PNG")
        page.save(page_path, "PNG")