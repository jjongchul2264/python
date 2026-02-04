document.addEventListener("DOMContentLoaded", function () {

    const canvas = document.getElementById("signature");
    const signaturePad = new SignaturePad(canvas);
    const body = document.querySelector("body");
    const filename = body.dataset.filename; //파일명이랑 교육번호는 동일하다.
    const totalSlides = parseInt(document.body.dataset.total);
    const empEmail = body.getAttribute("emp_email");

    let currentPage = 1;
    let zoomLevel = 1; // 확대 배율

    // 서버 API 호출
    fetch(`/docs/viewer-data?filename=${filename}&email=${empEmail}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`서버 오류: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("조회 결과:", data);
            document.getElementById("edu_no").value = data.edu_no;
            document.getElementById("edu_date").value = data.edu_date;
            document.getElementById("edu_name").value = data.edu_name;
            document.getElementById("edu_begin_date").value = data.edu_begin_date;
            document.getElementById("edu_end_date").value = data.edu_end_date;
            document.getElementById("edu_end_date").value = data.edu_end_date;
            document.getElementById("emp_grand_date").value = data.emp_grand_date;
            // 서명 패드 초기화 및 데이터 로드
            signaturePad.clear();
            const empSign = data.emp_sign;
            signaturePad.fromDataURL(`data:image/png;base64,${empSign}`);
        })
        .catch(err => console.error("조회 실패:", err));

    function loadPage(page) {
        const img = document.getElementById("pageImage");
        img.src = `/docs/viewer/${filename}/${page}`;
        img.style.transform = `scale(${zoomLevel})`;

        // 마지막 페이지일 때만 서명 영역과 버튼 보이기
        const signatureCanvas = document.querySelector(".canvas");
        const buttonGroup = document.querySelector(".button-group");

        if (page === totalSlides) {
            signatureCanvas.style.display = "block";
            buttonGroup.style.display = "flex"; // 버튼 그룹 보이기
        } else {
            signatureCanvas.style.display = "none";
            buttonGroup.style.display = "none"; // 버튼 그룹 숨기기
        }
    }

    function applyZoom() {
        const img = document.getElementById("pageImage");
        img.style.transform = `scale(${zoomLevel})`;

        // 확대 시에도 중앙 정렬 유지
        img.style.transformOrigin = "center center";
    }

    // 확대
    document.getElementById("zoomIn").addEventListener("click", () => {
        if (zoomLevel < 2) { // 최대 2배까지만 확대
            zoomLevel += 0.1;
            applyZoom();
        }
    });

    // 축소
    document.getElementById("zoomOut").addEventListener("click", () => {
        if (zoomLevel > 0.5) { // 최소 0.5배까지만 축소
            zoomLevel -= 0.1;
            applyZoom();
        }
    });

    // 이전 슬라이드
    document.getElementById("prev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadPage(currentPage); // zoomLevel 유지
        }
    });

    // 다음 슬라이드
    document.getElementById("next").addEventListener("click", () => {
        if (currentPage < totalSlides) {
            currentPage++;
            loadPage(currentPage); // zoomLevel 유지
        }
    });

    // 첫 페이지 로드
    loadPage(currentPage);

    // 서명 패드 초기화
    document.getElementById("clear-signature").addEventListener("click", () => {
        signaturePad.clear();
    });

    // 세부내역 저장
    document.getElementById("save-signatures").addEventListener("click", function (event) {
        event.preventDefault();

        if (signaturePad.isEmpty()) {
            alert("서명을 입력해 주세요.");
            return;
        }

        const edu_no = filename;
        const emp_email = empEmail;
        const signatureDataURL = signaturePad.toDataURL();

        const contractData = {
            signature: signatureDataURL,
            edu_no: edu_no,
            emp_email: emp_email
        };

        fetch("/docs/submit_sign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contractData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response Data:", data); // 디버깅용 콘솔 로그
                if (data.error) {
                    alert("서명 저장 중 에러가 발생했습니다: " + data.error);
                } else {
                    alert("서명 저장이 완료되었습니다!");
                }
            })
            .catch(error => {
                console.error("서명 저장 중 에러가 발생했습니다:", error);
                alert("서명 저장 중 에러가 발생했습니다.");
            });
    });
});