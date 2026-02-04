// 폼 로드 될때
document.addEventListener("DOMContentLoaded", () => {
    const eduTbody = document.querySelector("#edudataTable tbody");

    $(document).ready(function () {
        function setupDatePicker(selector) {
            $(selector).datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                closeText: "닫기",
                currentText: "오늘",
                monthNames: ["1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
                dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
                dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
                yearRange: "-100:+0",
                showButtonPanel: true,
                beforeShow: function (input, inst) {
                    inst.dpDiv.addClass("calendar-on-top");
                },
                onClose: function (dateText, inst) {
                    if (dateText.length <= 7) {
                        $(this).datepicker("setDate", new Date(inst.selectedYear, inst.selectedMonth, 1));
                    }
                }
            });

            // 오늘 날짜로 설정하는 버튼 추가
            $.datepicker._gotoToday = function (id) {
                const target = $(id);
                const inst = this._getInst(target[0]);
                const today = new Date();
                target.datepicker("setDate", today);
                this._hideDatepicker();
            };
        }
        // 여러 날짜 입력 필드에 적용
        setupDatePicker("#from_date");
        setupDatePicker("#to_date");

        // cretae, to_date → 오늘 날짜
        $("#to_date").datepicker("setDate", new Date());
        $("#edu_date").datepicker("setDate", new Date());

        // from_date → 이번 달 1일
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        $("#from_date").datepicker("setDate", firstDay);
    });

    // 높이, 너비 조절 함수
    function adjustTableSize() {
        const tableContainers = document.querySelectorAll(".table-container");
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        tableContainers.forEach(container => {
            const rect = container.getBoundingClientRect();

            // 높이 계산
            const bottomSpace = windowHeight - rect.top - 30;
            container.style.maxHeight = bottomSpace + "px";

            // 너비 계산
            const rightSpace = windowWidth - rect.left - 30;
            container.style.maxWidth = rightSpace + "px";
        });
    }

    // 페이지 로드 시 실행
    window.addEventListener("load", adjustTableSize);

    // 윈도우 크기 변경 시 다시 계산
    window.addEventListener("resize", adjustTableSize);

    // 교육 List 조회
    document.getElementById("btn_query").addEventListener("click", () => {
        const fromDate = document.getElementById("from_date").value;
        const toDate = document.getElementById("to_date").value;

        if (!fromDate || !toDate) {
            alert("조회 기간을 입력하세요.");
            return;
        }

        fetch(`/docs/query?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("조회 실패");
                }
                return response.json();
            })
            .then(data => {
                const tbody = document.querySelector("#edudataTable tbody");

                tbody.innerHTML = "";

                const rows = Array.isArray(data.rows) ? data.rows : [data.rows];

                rows.forEach((row, index) => {
                    const tr = document.createElement("tr");
                    tr.dataset.index = index;
                    tr.dataset.eduNo = row.edu_no;

                    const eduNoCell = document.createElement("td");
                    const eduDateCell = document.createElement("td");
                    const eduNameCell = document.createElement("td");
                    const beginDateCell = document.createElement("td");
                    const endDateCell = document.createElement("td");
                    const fileNameCell = document.createElement("td");
                    const eduemailFlagCell = document.createElement("td");
                    eduNoCell.classList.add("edu-no");

                    eduNoCell.textContent = row.edu_no;
                    eduDateCell.textContent = row.edu_date;
                    eduNameCell.textContent = row.edu_name;
                    beginDateCell.textContent = row.edu_begin_date;
                    endDateCell.textContent = row.edu_end_date;
                    fileNameCell.textContent = row.attach_file_name;

                    const eduemailFlagCheckbox = document.createElement("input");
                    eduemailFlagCheckbox.type = "checkbox";
                    eduemailFlagCheckbox.checked = (row.edu_email_flag === "Y");
                    eduemailFlagCheckbox.disabled = true; // 체크박스를 비활성화하여 수정 불가하도록 설정
                    eduemailFlagCell.appendChild(eduemailFlagCheckbox);

                    tr.appendChild(eduNoCell);
                    tr.appendChild(eduDateCell);
                    tr.appendChild(eduNameCell);
                    tr.appendChild(beginDateCell);
                    tr.appendChild(endDateCell);
                    tr.appendChild(fileNameCell);
                    tr.appendChild(eduemailFlagCell);

                    tbody.appendChild(tr);

                    if (index === 0) {
                        tr.click();
                    }
                });
            })
            .catch(error => {
                console.error("조회 중 오류:", error);
                alert("조회 중 오류 발생: " + error.message);
            });
    });

    // 교육 List 클릭
    eduTbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) {
            return;
        }

        // 기존 선택 제거
        eduTbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected", "focused-row"));

        // 현재 행 선택/포커스 처리
        tr.classList.add("selected", "focused-row");
        tr.focus();

        // 데이터셋에서 eduNo 가져오기
        const eduNo = tr.dataset.eduNo;
        if (!eduNo) {
            console.error("edu_no가 정의되지 않았습니다.", tr);
            return;
        }

        // 교육 수료 명단 조회 실행
        loadStudents(eduNo);
    });

    // 수료자 List 조회 (교육 List 클릭 시 발생)
    function loadStudents(eduNo) {
        fetch(`/docs/report?edu_no=${encodeURIComponent(eduNo)}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("조회 실패");
                }
                return res.json();
            })
            .then(data => {
                renderReport(data.rows);
                renderReport2(data.rows);
                // meta 값 세팅
                initMeta({
                    edu_no: data.edu_no,
                    edu_name: data.edu_name,
                    edu_date: data.edu_date
                });
            })

            .catch(err => {
                alert("조회 중 오류 발생: " + err.message);
                console.error(err);
            });
    }

    // 보고서 테이블 렌더링 (report 가로 3명씩)
    function renderReport(rows) {
        const reportTbody = document.getElementById("report_tbody");
        if (!reportTbody) {
            return;
        }
        reportTbody.innerHTML = "";

        const groupSize = 3; // 한 줄에 3명씩 출력

        for (let i = 0; i < rows.length; i += groupSize) {
            const tr = document.createElement("tr");

            for (let j = 0; j < groupSize; j++) {
                const person = rows[i + j] || {}; // 없으면 빈칸 처리
                tr.appendChild(makeCell(person.seq));
                tr.appendChild(makeCell(person.emp_name));
                tr.appendChild(makeSignatureCell(person.emp_sign));
            }

            reportTbody.appendChild(tr);
        }

        function makeCell(text) {
            const td = document.createElement("td");
            td.textContent = text || "";
            return td;
        }

        function makeSignatureCell(sign) {
            const td = document.createElement("td");
            td.className = "signature-cell";
            if (sign) {
                const img = document.createElement("img");
                img.src = `data:image/png;base64,${sign}`;
                img.style.height = "40px";
                td.appendChild(img);
            }
            return td;
        }
    }

    // 보고서 테이블 렌더링(수료 명단)
    function renderReport2(rows) {
        const grandTbody = document.getElementById("grand_tbody");;
        if (!grandTbody) {
            return;
        }
        grandTbody.innerHTML = "";

        const groupSize = 3; // 한 줄에 3명씩 출력

        for (let i = 0; i < rows.length; i += groupSize) {
            const tr = document.createElement("tr");

            for (let j = 0; j < groupSize; j++) {
                const person = rows[i + j] || {}; // 없으면 빈칸 처리
                tr.appendChild(makeCell(person.seq));
                tr.appendChild(makeCell(person.emp_name));
                tr.appendChild(makeSignatureCell(person.emp_sign));
            }

            // 클릭 시 선택행 색상 변경
            tr.addEventListener("click", () => {
            // 기존 선택 제거
                grandTbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected", "focused-row"));
                // 현재 행 선택
                tr.classList.add("selected", "focused-row");
                tr.focus();
            });

            grandTbody.appendChild(tr);

            if (i === 0) {
                tr.click();
            }
        }

        function makeCell(text) {
            const td = document.createElement("td");
            td.textContent = text || "";
            return td;
        }

        function makeSignatureCell(sign) {
            const td = document.createElement("td");
            td.className = "signature-cell";
            if (sign) {
                const img = document.createElement("img");
                img.src = `data:image/png;base64,${sign}`;
                img.style.height = "40px";
                td.appendChild(img);
            }
            return td;
        }
    }


    function initMeta(meta) {
        console.log("initMeta 호출됨:", meta);

        const elNo = document.getElementById("edu_no");
        const elName = document.getElementById("edu_name");
        const elDate = document.getElementById("edu_date");

        const rpt_elNo = document.getElementById("rpt_edu_no");
        const rpt_elName = document.getElementById("rpt_edu_name");
        const rpt_elDate = document.getElementById("rpt_edu_date");

        if (!elNo || !elName || !elDate) {
            console.warn("메타 요소를 찾지 못했습니다. ID를 확인하세요.");
            return;
        }

        // 키 매핑: 서버 응답에 맞춰 우선순위로 채움
        const eduNo = meta.edu_no ?? meta.eduNo ?? "";
        const eduName = meta.edu_name ?? meta.eduName ?? meta.title ?? "";
        const eduDate = meta.edu_date ?? meta.eduDate ?? meta.emp_grand_date ?? "";

        elNo.textContent = eduNo;
        elName.textContent = eduName;
        elDate.textContent = formatDateText(eduDate);

        rpt_elNo.textContent = eduNo;
        rpt_elName.textContent = eduName;
        rpt_elDate.textContent = formatDateText(eduDate);
    }

    function formatDateText(value) {
        // 서버가 문자열로 내려주면 그대로, Date 객체/ISO 문자열이면 보기 좋게 변환
        if (!value) {
            return "";
        }
        // ISO 문자열인 경우
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            const d = new Date(value);
            if (!isNaN(d)) {
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                const day = d.getDate();
                return `${y}년 ${m}월 ${day}일`;
            }
        }
        return value; // 이미 포맷된 문자열이면 그대로
    }

    // 인쇄 버튼 이벤트
    document.getElementById("btn_print").addEventListener("click", () => {
        window.print();
    });

    // PDF 저장
    document.getElementById("btn_pdf").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const printArea = document.getElementById("print-area");

        if (!printArea) {
            console.error("print-area 요소를 찾을 수 없습니다.");
            return;
        }

        // 잠깐 보이게
        printArea.style.display = "block";

        // 캡처
        const canvas = await html2canvas(printArea, { scale: 1 });
        const imgData = canvas.toDataURL("image/png");

        // 다시 숨김
        printArea.style.display = "none";

        // PDF 생성
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("교육수료명단.pdf");
    });

    // 엑셀 내보내기
    document.getElementById("btn_excel").addEventListener("click", () => {
        const header = [
            "순번","이름","서명",
            "순번","이름","서명",
            "순번","이름","서명"
        ];
        const data = [header];

        const tbody = document.getElementById("report_tbody");
        [...tbody.querySelectorAll("tr")].forEach(tr => {
            const cells = [...tr.querySelectorAll("td")].map(td => td.textContent.trim());
            data.push(cells);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "교육수료명단");
        const fileName = `교육수료명단_${document.getElementById("edu_no").textContent}.xlsx`;
        XLSX.writeFile(wb, fileName);
    });

});
