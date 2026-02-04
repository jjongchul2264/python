const backupEmpCode = null;


// 폼 로드 될때
document.addEventListener("DOMContentLoaded", () => {
    const dateInputs = document.querySelectorAll(".date-input");
    const textInputs = document.querySelectorAll(".text-input");
    const numberInputs = document.querySelectorAll(".number-input");
    const currentYear = new Date().getFullYear();
    const originalValues = {};
    const rows = document.querySelectorAll("#data-grid tbody tr");

    const viewBtn = document.getElementById("view-signatures-btn");
    if (!viewBtn) {
        console.error("조회 버튼을 찾을 수 없습니다.");
        return;
    }

    // 테이블 컨테이너 요소에 이벤트 리스너를 추가
    document.querySelector("thead").addEventListener("dblclick", (event) => {
        // 더블클릭한 요소가 'th:first-child'인지 확인
        if (event.target.matches("th:first-child")) {
            const tbody = document.querySelector("tbody");
            const checkboxes = tbody.querySelectorAll('input[type="checkbox"].select-row');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
        }
    });

    /* -------------------------------------------
   2) 숫자 표시용 (정수 + 천단위 콤마)
    ------------------------------------------- */
    function formatNumber(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        // 숫자 + 소수점 유지
        const cleaned = String(value).replace(/[^0-9.-]/g, "").trim();

        if (cleaned === "" || cleaned === "-" || cleaned === ".") {
            return cleaned;
        }

        const floatValue = parseFloat(cleaned);

        return floatValue.toLocaleString("ko-KR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }


    function removeFormatting(value) {
        return value.replace(/,/g, "");
    }

    numberInputs.forEach(input => {
        let originalValue = input.value;

        input.addEventListener("focus", function () {
            originalValue = input.value;
            input.value = input.value.replace(/,/g, "");
            setTimeout(() => input.select(), 0);
        });

        input.addEventListener("input", function () {
            const raw = input.value.replace(/,/g, "");

            // 숫자 + 소수점만 허용
            if (!/^-?\d*\.?\d*$/.test(raw)) {
                input.value = originalValue;
                return;
            }

            // 커서 위치 저장
            const cursor = input.selectionStart;

            // 원본 업데이트
            originalValue = raw;

            // 콤마 적용
            const formatted = formatNumber(raw);
            input.value = formatted;

            // 커서 위치 보정
            const diff = formatted.length - raw.length;
            input.setSelectionRange(cursor + diff, cursor + diff);
        });

        input.addEventListener("blur", function () {
            input.value = formatNumber(input.value);
        });
    });

    // text-input 전체 내용 선택 기능 추가
    textInputs.forEach(input => {
        let originalValue = input.value;

        input.addEventListener("focus", function (e) {
            console.log("Focus event triggered for text-input");
            originalValue = input.value;

            // 전체 내용 선택
            setTimeout(() => {
                input.select();
            }, 0);
        });

        input.addEventListener("blur", function (e) {
            console.log("Blur event triggered for text-input");
        });

        input.addEventListener("input", function (e) {
            console.log("Input event triggered for text-input");
            originalValue = input.value;
        });
    });

    // 조회 리스트 초기화
    function resetSignatureList() {
        const tbody = document.querySelector("#dataTable tbody");
        if (tbody) {
            tbody.innerHTML = "";
        } else {
            console.error("테이블의 tbody 요소를 찾을 수 없습니다.");
        }
    }

    // 조회, list, 세부내역 화면 초기화
    document.getElementById("all-clear-btn").addEventListener("click", () => {
        // 특정 요소 초기화
        document.getElementById("query-code").value = ""; // 사번 초기화
        document.getElementById("query-dept").value = ""; // 부서 초기화
        document.getElementById("query-name").value = ""; // 성명 초기화
        document.querySelector('input[name="distribution-status"][value="%"]').checked = true; // 라디오 버튼 초기화
        document.querySelector('input[name="empconfirm-status"][value="%"]').checked = true; // 라디오 버튼 초기화
        document.querySelector('input[name="manageconfirm-status"][value="%"]').checked = true; // 라디오 버튼 초기화

        // 연도 초기화 후 기본값으로 설정
        yearSelect1.value = currentYear;

        resetSignatureList();
    });

    // 조회하고 조회 리스트에서 해당 사번 행 선택하는 함수
    function fetchDataAndSelectRow(empCode) {
        // 이미 정의된 조회 이벤트를 호출
        document.getElementById("view-signatures-btn").click();
    }


    viewBtn.addEventListener("click", () => {
        console.log("조회 버튼 클릭됨");
        const queryYear = document.getElementById("query-year").value;
        const queryDept = document.getElementById("query-dept").value;
        const queryCode = document.getElementById("query-code").value;
        const queryName = document.getElementById("query-name").value;
        const radioStatus = document.querySelector('input[name="distribution-status"]:checked').value;
        const empStatus = document.querySelector('input[name="empconfirm-status"]:checked').value;
        const manageStatus = document.querySelector('input[name="manageconfirm-status"]:checked').value;
        const empregino = "N";

        if (!queryYear.trim()) {
            alert("연도를 입력해 주세요.");
            return;
        }
        fetch(`/api/get_signatures0?year=${encodeURIComponent(queryYear)}&dept=${encodeURIComponent(queryDept)}&name=${encodeURIComponent(queryName)}&status=${encodeURIComponent(radioStatus)}&empstatus=${encodeURIComponent(empStatus)}&managestatus=${encodeURIComponent(manageStatus)}&empregino=${encodeURIComponent(empregino)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                const dataTable = document.getElementById("dataTable");
                const tbody = dataTable.querySelector("tbody");
                tbody.innerHTML = ""; // 기존 내용을 초기화

                // 테이블 바디 생성
                data.signatures.forEach((signature, index) => {
                    const row = document.createElement("tr");
                    row.dataset.index = index; // 각 행에 인덱스를 데이터 속성으로 저장

                    const selectCell = document.createElement("td");
                    const seqCell = document.createElement("td");
                    const contractYearCell = document.createElement("td");
                    const employeeDeptCell = document.createElement("td");
                    const employeeSpotCell = document.createElement("td");
                    const employeeCodeCell = document.createElement("td");
                    const employeeNameCell = document.createElement("td");
                    const contractFlagCell = document.createElement("td");
                    const empConfirmCell = document.createElement("td");
                    const empConfirmDateCell = document.createElement("td");
                    const manageConfirmCell = document.createElement("td");
                    const manageConfirmDateCell = document.createElement("td");
                    const empregino = document.createElement("td");
                    const transflag = document.createElement("td");
                    const increaseAmt = document.createElement("td");

                    seqCell.textContent = signature.seq;
                    contractYearCell.textContent = signature.contract_year;
                    employeeDeptCell.textContent = signature.emp_dept;
                    employeeSpotCell.textContent = signature.emp_spot;
                    employeeCodeCell.textContent = signature.emp_code;
                    employeeNameCell.textContent = signature.emp_name;
                    empConfirmDateCell.textContent = signature.emp_confirm_date;
                    manageConfirmDateCell.textContent = signature.manage_confirm_date;
                    transflag.textContent = signature.trans_flag;
                    increaseAmt.textContent = formatNumber(signature.increase_amt);

                    const contractFlagCheckbox = document.createElement("input");
                    contractFlagCheckbox.type = "checkbox";
                    contractFlagCheckbox.checked = (signature.contract_flag === "Y");
                    contractFlagCheckbox.disabled = true; // 체크박스를 비활성화하여 수정 불가하도록 설정
                    contractFlagCell.appendChild(contractFlagCheckbox);

                    const empConfirmCheckbox = document.createElement("input");
                    empConfirmCheckbox.type = "checkbox";
                    empConfirmCheckbox.checked = (signature.emp_confirm === "Y");
                    empConfirmCheckbox.disabled = true; // 체크박스를 비활성화하여 수정 불가하도록 설정
                    empConfirmCell.appendChild(empConfirmCheckbox);

                    const manageConfirmCheckbox = document.createElement("input");
                    manageConfirmCheckbox.type = "checkbox";
                    manageConfirmCheckbox.checked = (signature.manage_confirm === "Y");
                    manageConfirmCheckbox.disabled = true; // 체크박스를 비활성화하여 수정 불가하도록 설정
                    manageConfirmCell.appendChild(manageConfirmCheckbox);

                    // 스타일 클래스 추가
                    contractFlagCell.classList.add("contract-flag-cell");
                    manageConfirmCell.classList.add("manageConfirmCell");
                    empConfirmCell.classList.add("empConfirmCell");

                    row.appendChild(seqCell);
                    row.appendChild(contractYearCell);
                    row.appendChild(employeeDeptCell);
                    row.appendChild(employeeSpotCell);
                    row.appendChild(employeeCodeCell);
                    row.appendChild(employeeNameCell);
                    row.appendChild(contractFlagCell);
                    row.appendChild(empConfirmCell);
                    row.appendChild(empConfirmDateCell);
                    row.appendChild(manageConfirmCell);
                    row.appendChild(manageConfirmDateCell);
                    row.appendChild(transflag);
                    row.appendChild(increaseAmt);

                    tbody.appendChild(row);

                    // 첫 번째 행 자동 클릭
                    if (index === 0) {
                        row.click();
                    }
                });
            })
            .catch(error => {
                console.error("저장된 내역 조회 중 에러가 발생했습니다:", error);
                alert("저장된 내역 조회 중 에러가 발생했습니다. 자세한 오류: " + error.message);
            });
    });


    // 현재 연도를 기준으로 ±10년 범위의 연도를 리스트박스에 추가
    const yearSelect1 = document.getElementById("query-year");
    //연도 리스트 생성
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        // 첫 번째 리스트박스에 옵션 추가
        const option1 = document.createElement("option");
        option1.value = year;
        option1.textContent = year;
        if (year === currentYear) {
            option1.selected = true; // 현재 연도를 기본값으로 설정
        }
        yearSelect1.appendChild(option1);
    }

    // 팝업 열기 함수 (연봉계약서 보기)
    function openContractPopup() {
        const year = document.getElementById("contract-year").value;
        const employeeCode = document.getElementById("employee-code").value;
        const deptflag = document.getElementById("dept-flag").value;

        if (deptflag === "1") {
            window.open(`/contract?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        } else {
            window.open(`/contract2?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        }
    }


    // "연봉근로계약서 보기" 버튼에 이벤트 리스너 추가
    //document.getElementById('viewContractButton').addEventListener('click', checkAndOpenContractPopup);

    // 전체 취소 버튼 이벤트 리스너
    //document.getElementById('all-cancel-btn').addEventListener('click', handleAllCancel);
});