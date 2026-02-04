window.onload = function () {
    console.log("Window loaded"); // 첫 번째 로그
    // 숫자 포맷팅
    const elements = document.getElementsByClassName("number_format");
    for (let i = 0; i < elements.length; i++) {
        const number = parseFloat(elements[i].textContent);
        if (!isNaN(number)) {
            elements[i].textContent = number.toLocaleString("ko-KR"); // 한국어 로케일을 사용하여 숫자를 포맷팅
        }
    }

    // 내용 편집 방지
    const contentElements = document.querySelectorAll("#tinymce p, #tinymce table");
    contentElements.forEach(function (element) {
        element.setAttribute("contenteditable", "false");
    });

    // 계약서 데이터 가져오기 및 표시
    const urlParams = new URLSearchParams(window.location.search);
    const employeeCode = urlParams.get("code");
    const year = urlParams.get("year"); // year 변수 추가

    if (employeeCode && year) {
        fetch(`/getContractData?code=${employeeCode}&year=${year}`)
            .then(response => response.json())
            .then(data => {
                console.log("Contract data loaded:", data); // 두 번째 로그

                document.getElementById("valgunmoo").innerText = data.valgunmoo;

                //포괄시간
                document.getElementById("val0").innerText = data.val0;
                document.getElementById("val00").innerText = data.val0;
                document.getElementById("val001").innerText = data.val0;
                document.getElementById("val002").innerText = data.val0;
                document.getElementById("val003").innerText = data.val0;
                document.getElementById("val004").innerText = data.val0;

                //업무
                document.getElementById("val10").innerText = data.val10;

                //성명
                document.getElementById("val1").innerText = data.val1;
                document.getElementById("val14").innerText = data.val1;
                //직위
                document.getElementById("val2").innerText = data.val2;
                //주소
                document.getElementById("val3").innerText = data.val3;
                document.getElementById("val13").innerText = data.val3;
                //생년월일
                document.getElementById("val4").innerText = data.val4;
                document.getElementById("val12").innerText = data.val4;
                //연락처
                document.getElementById("val5").innerText = data.val5;
                //근로시작일
                document.getElementById("val6").innerText = data.val6;
                //근로종료일
                document.getElementById("val7").innerText = data.val7;
                //근무직종
                document.getElementById("val8").innerText = data.val8;
                //연봉근로계약서일자
                document.getElementById("val9").innerText = data.val9;
                //연봉총액
                document.getElementById("amt0").innerText = data.amt0;
                //기본급
                document.getElementById("amt1").innerText = data.amt1;
                //시간외근로수당
                document.getElementById("amt2").innerText = data.amt2;
                //차량유지비
                document.getElementById("amt3").innerText = data.amt3;
                //연구활동비
                document.getElementById("amt4").innerText = data.amt4;
                //직무수당
                document.getElementById("amt5").innerText = data.amt5;
                //육아수당
                document.getElementById("amt6").innerText = data.amt6;
                //기타수당 포함해야할거 같아보임..
                //합계
                document.getElementById("amt7").innerText = data.amt7;
                //상여금
                document.getElementById("amt8").innerText = data.amt7;
            })
            .catch(error => console.error("데이터를 가져오는 중 오류 발생:", error));
    } else {
        console.error("필요한 데이터가 누락되었습니다: code, year, dept");
    }


    function validateDate() {
        const dobInput = document.getElementById("employee-dob");
        const dobValue = dobInput.value;
        const year = dobValue.split("-")[0]; // 연도 부분 추출
        if (year.length !== 4) {
            alert("생년월일의 년도는 4자리여야 합니다.");
            dobInput.value = ""; // 잘못된 입력값 초기화
        }
    }

    function saveAsPDF() {
        console.log("saveAsPDF function called");

        // 버튼들을 숨기기
        const buttons = document.querySelector(".button-group");
        buttons.style.display = "none";

        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = 210; // A4 너비
        const pageHeight = 297; // A4 높이
        const marginLeft = 10; // 좌측 마진
        const marginTop = 15; // 첫 페이지 상단 마진을 줄임
        const subsequentMarginTop = 20; // 이후 페이지 상단 마진
        const marginBottom = 20; // 하단 마진
        const contentHeight = document.body.scrollHeight; // 전체 콘텐츠 높이

        window.scrollTo(0, 0); // 처음에 페이지 맨 위로 스크롤

        html2canvas(document.body, {
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            width: document.body.scrollWidth,
            height: contentHeight
        }).then(function (canvas) {
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = pageWidth - (marginLeft * 2); // 페이지 너비에 맞춤
            const imgHeight = canvas.height * imgWidth / canvas.width; // 비율에 맞게 높이 조정
            const effectivePageHeight = pageHeight - subsequentMarginTop - marginBottom; // 상하 마진을 뺀 페이지 높이

            let totalHeight = imgHeight;
            let position = 0;

            // 첫 번째 페이지 (상단 마진 줄임)
            const firstPageHeight = pageHeight - marginBottom - marginTop; // 상단 마진을 줄인 첫 페이지 높이
            const canvasFirstPage = document.createElement("canvas");
            canvasFirstPage.width = canvas.width;
            canvasFirstPage.height = firstPageHeight * canvas.width / imgWidth;
            const contextFirstPage = canvasFirstPage.getContext("2d");
            contextFirstPage.drawImage(canvas, 0, 0, canvas.width, canvasFirstPage.height, 0, 0, canvasFirstPage.width, canvasFirstPage.height);
            const firstPageImgData = canvasFirstPage.toDataURL("image/png");
            doc.addImage(firstPageImgData, "PNG", marginLeft, marginTop, imgWidth, firstPageHeight);
            totalHeight -= firstPageHeight;
            position += firstPageHeight;

            // 남은 페이지들을 추가
            while (totalHeight > 0) {
                doc.addPage();

                // 마지막 페이지 검사
                const isLastPage = totalHeight <= effectivePageHeight;

                const canvasSection = document.createElement("canvas");
                canvasSection.width = canvas.width;
                const sectionHeight = Math.min(isLastPage ? (pageHeight - marginBottom) : effectivePageHeight, totalHeight);
                canvasSection.height = sectionHeight * canvas.width / imgWidth;
                const contextSection = canvasSection.getContext("2d");
                contextSection.drawImage(canvas, 0, position * canvas.width / imgWidth, canvas.width, canvasSection.height, 0, 0, canvasSection.width, canvasSection.height);
                const sectionImgData = canvasSection.toDataURL("image/png");
                doc.addImage(sectionImgData, "PNG", marginLeft, isLastPage ? marginTop : subsequentMarginTop, imgWidth, sectionHeight);
                totalHeight -= sectionHeight;
                position += sectionHeight;
            }

            doc.save("contract.pdf");

            // 버튼들을 다시 보이기
            buttons.style.display = "block";
        }).catch(function (error) {
            console.error("Error generating PDF:", error);
            // 버튼들을 다시 보이기
            buttons.style.display = "block";
        });
    }
    // 프린트 함수
    function printPage() {
        // 버튼들을 숨기기
        const buttons = document.querySelector(".button-group");
        buttons.style.display = "none";

        // 프린트 작업이 완료된 후 버튼들을 다시 보이기
        window.onafterprint = function () {
            buttons.style.display = "block";
        };
        // 프린트 대화상자 호출
        window.print();
    }


    // 서명 가져오기
    const empCode = employeeCode; // 실제 근로자 코드로 대체
    const contractyear = year; // 실제 근로자 코드로 대체
    fetch(`/get_signature?emp_code=${empCode}&year=${contractyear}`)
        .then(response => response.json())
        .then(data => {
            if (data.signature) {
                const signatureImage = document.getElementById("sign-image");
                if (signatureImage) {
                    const base64 = data.signature.trim(); // 공백 제거
                    signatureImage.src = `data:image/png;base64,${base64}`;
                    signatureImage.style.display = "block";
                } else {
                    console.error("sign-image element not found");
                }
            } else {
                console.error("No signature found for the employee.");
            }
        })
        .catch(error => {
            console.error("Error fetching signature:", error);
        });


    // 이벤트 리스너 추가
    document.getElementById("save_pdf_button").addEventListener("click", saveAsPDF);
    document.getElementById("print_button").addEventListener("click", printPage);
    document.getElementById("gen_pdf_button").addEventListener("click", generatePDF);
};
