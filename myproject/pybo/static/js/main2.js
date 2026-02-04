document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("signature");
    const viewButton = document.getElementById("view-signatures");
    const clearButton = document.getElementById("all-clear");
    const signaturePad = new SignaturePad(canvas);

    // 현재 연도를 기준으로 ±10년 범위의 연도를 리스트박스에 추가
    const currentYear = new Date().getFullYear();
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

    // 숫자 포맷 천단위 지정
    function formatNumber(value) {
        if (value) {
            return new Intl.NumberFormat().format(value);
        }
        return value;
    }

    // 숫자 포맷 천단위 해제
    function removeFormatting(value) {
        return value.replace(/,/g, "");
    }

    // 천 단위 구분 기호를 제거하고 숫자로 변환
    function parseNumber(formattedNumber) {
        return parseFloat(formattedNumber.replace(/,/g, "")); // 천 단위 구분 기호를 제거하고 숫자로 변환
    }

    // 날짜 포맷 지정
    function formatDate(value) {
        if (value.length === 8) {
            const year = value.substring(0, 4);
            const month = value.substring(4, 6);
            const day = value.substring(6, 8);
            return `${year}-${month}-${day}`;
        }
        if (value.length === 10) {
            const dateParts = value.split("-");
            if (dateParts.length === 3) {
                const year = dateParts[0];
                const month = dateParts[1];
                const day = dateParts[2];
                return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`;
            }
        }
        return value;
    }

    // 폼 초기화 및 서명 패드 지우기
    function resetForm() {
        document.getElementById("contract-form").reset();
        signaturePad.clear();
    }

    // 조회 리스트 초기화
    function resetSignatureList() {
        const tbody = document.querySelector("#dataTable tbody");
        if (tbody) {
            tbody.innerHTML = "";
        } else {
            console.error("테이블의 tbody 요소를 찾을 수 없습니다.");
        }
    }

    // 전체 초기화 함수
    function resetAll() {
        resetForm();
        resetSignatureList();
        // 선택 칼럼의 헤더에 더블클릭 이벤트 추가
        document.querySelector("thead th:first-child").addEventListener("dblclick", () => {
            const checkboxes = tbody.querySelectorAll('input[type="checkbox"].select-row');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
        });
    }

    // 초기화 버튼 동작 정의
    if (clearButton) {
        clearButton.addEventListener("click", (event) => {
            event.preventDefault();
            // 특정 요소 초기화
            document.getElementById("query-regi-no").value = "";
            // 연도 초기화 후 기본값으로 설정
            yearSelect1.value = currentYear;
            resetAll();

            const iframe = document.getElementById("contract-iframe");
            iframe.src = "";

        });
    }


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

        const empcode = document.getElementById("employee-code").value;
        const empname = document.getElementById("employee-name").value;
        const empspot = document.getElementById("employee-spot").value;
        const empdept = document.getElementById("employee-dept").value;
        const empaddr = document.getElementById("employee-addr").value;
        const empbirth = document.getElementById("employee-birth").value;
        const empregino = document.getElementById("employee-regi-no").value;
        const empmobile = document.getElementById("employee-mobile").value;
        const jobfromdate = document.getElementById("job-from-date").value;
        const jobtodate = document.getElementById("job-to-date").value;
        const jobtype = document.getElementById("job-type").value;

        const amtall = removeFormatting(document.getElementById("amt-all").value);
        const amtbase = removeFormatting(document.getElementById("amt-base").value);
        const amtovertime = removeFormatting(document.getElementById("amt-overtime").value);
        const amtcar = removeFormatting(document.getElementById("amt-car").value);
        const amtresearch = removeFormatting(document.getElementById("amt-research").value);
        const amtjob = removeFormatting(document.getElementById("amt-job").value);
        const amtbaby = removeFormatting(document.getElementById("amt-baby").value);
        const amtsum = removeFormatting(document.getElementById("amt-sum").value);

        const contractdate = document.getElementById("contract-date").value;
        const contractyear = document.getElementById("contract-year").value;

        const signatureDataURL = signaturePad.toDataURL();
        console.log("Employee Code:", empcode); // 디버깅용 콘솔 로그
        //console.log('Signature Data URL:', signatureDataURL); // 디버깅용 콘솔 로그

        const contractData = {
            signature: signatureDataURL,
            emp_code: empcode,
            emp_name: empname,
            emp_spot: empspot,
            emp_dept: empdept,
            emp_addr: empaddr,
            emp_birth: empbirth,
            emp_regi_no: empregino,
            emp_mobile: empmobile,
            job_from_date: jobfromdate,
            job_to_date: jobtodate,
            job_type: jobtype,

            amt_all: amtall,
            amt_base: amtbase,
            amt_overtime: amtovertime,
            amt_car: amtcar,
            amt_research: amtresearch,
            amt_job: amtjob,
            amt_baby: amtbaby,
            amt_sum: amtsum,
            contract_date: contractdate,
            contract_year: contractyear
        };

        fetch("/submit", {
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
                    loadContractPage();
                }
            })
            .catch(error => {
                console.error("서명 저장 중 에러가 발생했습니다:", error);
                alert("서명 저장 중 에러가 발생했습니다.");
            });
    });

    // 조회 버튼 동작 정의
    if (viewButton) {
        viewButton.addEventListener("click", (event) => {
            event.preventDefault();
            console.log("View button clicked");
            const queryYear = document.getElementById("query-year").value;
            const empregino = document.getElementById("query-regi-no").value;

            if (!queryYear.trim()) {
                alert("연도를 입력해 주세요.");
                return;
            }

            if (!empregino.trim()) {
                alert("주민등록번호 뒷자리를 입력해 주세요.");
                return;
            }

            fetch(`/api/get_signatures1?year=${encodeURIComponent(queryYear)}&empregino=${encodeURIComponent(empregino)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
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
                        const manageConfirmCell = document.createElement("td");
                        const empregino = document.createElement("td");

                        const selectCheckbox = document.createElement("input");
                        selectCheckbox.type = "checkbox";
                        selectCheckbox.classList.add("select-row"); // 선택 행 체크박스 클래스 추가
                        selectCell.appendChild(selectCheckbox);

                        seqCell.textContent = signature.seq;
                        contractYearCell.textContent = signature.contract_year;
                        employeeDeptCell.textContent = signature.emp_dept;
                        employeeSpotCell.textContent = signature.emp_spot;
                        employeeCodeCell.textContent = signature.emp_code;
                        employeeNameCell.textContent = signature.emp_name;

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

                        // 서명 패드 초기화 및 데이터 로드
                        signaturePad.clear();
                        const empSign = data.signatures[0].emp_sign;
                        signaturePad.fromDataURL(`data:image/png;base64,${empSign}`);

                        // 스타일 클래스 추가
                        selectCell.classList.add("select-row");
                        contractFlagCell.classList.add("contract-flag-cell");
                        manageConfirmCell.classList.add("manageConfirmCell");
                        empConfirmCell.classList.add("empConfirmCell");

                        row.appendChild(selectCell);
                        row.appendChild(seqCell);
                        row.appendChild(contractYearCell);
                        row.appendChild(employeeDeptCell);
                        row.appendChild(employeeSpotCell);
                        row.appendChild(employeeCodeCell);
                        row.appendChild(employeeNameCell);
                        row.appendChild(contractFlagCell);
                        row.appendChild(empConfirmCell);
                        row.appendChild(manageConfirmCell);

                        tbody.appendChild(row);

                        // 행 클릭 이벤트 추가
                        row.addEventListener("click", () => {
                        // 모든 행에서 선택 클래스 제거
                            document.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
                            // 클릭한 행에 선택 클래스 추가
                            row.classList.add("selected");

                            const selectedSignature = data.signatures[row.dataset.index];
                            document.getElementById("contract-year").value = selectedSignature.contract_year;
                            document.getElementById("employee-code").value = selectedSignature.emp_code;
                            document.getElementById("employee-name").value = selectedSignature.emp_name;
                            document.getElementById("employee-spot").value = selectedSignature.emp_spot;
                            document.getElementById("employee-dept").value = selectedSignature.emp_dept;
                            document.getElementById("employee-addr").value = selectedSignature.emp_addr;
                            document.getElementById("employee-birth").value = formatDate(selectedSignature.emp_birth);
                            document.getElementById("employee-regi-no").value = formatDate(selectedSignature.emp_regi_no);
                            document.getElementById("employee-mobile").value = selectedSignature.emp_mobile;
                            document.getElementById("job-from-date").value = formatDate(selectedSignature.job_from_date);
                            document.getElementById("job-to-date").value = formatDate(selectedSignature.job_to_date);
                            document.getElementById("job-type").value = selectedSignature.job_type;

                            document.getElementById("amt-base").value = formatNumber(selectedSignature.amt_base);
                            document.getElementById("amt-overtime").value = formatNumber(selectedSignature.amt_overtime);
                            document.getElementById("amt-car").value = formatNumber(selectedSignature.amt_car);
                            document.getElementById("amt-research").value = formatNumber(selectedSignature.amt_research);
                            document.getElementById("amt-job").value = formatNumber(selectedSignature.amt_job);
                            document.getElementById("amt-baby").value = formatNumber(selectedSignature.amt_baby);

                            document.getElementById("bf-amt-base").value = formatNumber(selectedSignature.bf_amt_base);
                            document.getElementById("bf-amt-overtime").value = formatNumber(selectedSignature.bf_amt_overtime);
                            document.getElementById("bf-amt-car").value = formatNumber(selectedSignature.bf_amt_car);
                            document.getElementById("bf-amt-research").value = formatNumber(selectedSignature.bf_amt_research);
                            document.getElementById("bf-amt-job").value = formatNumber(selectedSignature.bf_amt_job);
                            document.getElementById("bf-amt-baby").value = formatNumber(selectedSignature.bf_amt_baby);

                            // 합계금액 계산 및 표시
                            const totalAmount = selectedSignature.amt_base + selectedSignature.amt_overtime + selectedSignature.amt_car + selectedSignature.amt_research + selectedSignature.amt_job + selectedSignature.amt_baby;
                            document.getElementById("amt-sum").value = formatNumber(totalAmount);
                            document.getElementById("amt-all").value = formatNumber(totalAmount * 13);

                            // 합계금액 계산 및 표시2
                            const bftotalAmount = selectedSignature.bf_amt_base + selectedSignature.bf_amt_overtime + selectedSignature.bf_amt_car + selectedSignature.bf_amt_research + selectedSignature.bf_amt_job + selectedSignature.bf_amt_baby;
                            document.getElementById("bf-amt-sum").value = formatNumber(bftotalAmount);
                            document.getElementById("bf-amt-all").value = formatNumber(bftotalAmount * 13);

                            document.getElementById("contract-date").value = formatDate(selectedSignature.contract_date);

                            // 배포 여부 체크박스를 수정하지 못하게 설정
                            document.getElementById("contract-flag").checked = selectedSignature.contract_flag === "Y";
                            document.getElementById("contract-flag").disabled = true;

                            // 사용자 확정 체크박스를 수정하지 못하게 설정
                            document.getElementById("emp-confirm").checked = selectedSignature.emp_confirm === "Y";
                            document.getElementById("emp-confirm").disabled = true;

                            // 관리자 확정 체크박스를 수정하지 못하게 설정
                            document.getElementById("manage-confirm").checked = selectedSignature.manage_confirm === "Y";
                            document.getElementById("manage-confirm").disabled = true;
                        });
                        // 첫 번째 행 자동 클릭
                        if (index === 0) {
                            row.click();
                            loadContractPage();
                        }
                    });
                })
                .catch(error => {
                    console.error("데이터 조회 중 에러가 발생했습니다:", error);
                    alert("데이터 조회 중 에러가 발생했습니다. 자세한 오류: " + error.message);
                });
        });
    }

    // 팝업 열기 함수 (연봉계약서 보기)
    function openContractPopup() {
        const year = document.getElementById("contract-year").value;
        const employeeCode = document.getElementById("employee-code").value;
        window.open(`/contract?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
    }


    // 성명 입력 여부 확인 후 팝업 열기 함수
    function checkAndOpenContractPopup() {
        const employeecode = document.getElementById("employee-code").value;
        console.log("checkAndOpenContractPopup 함수 호출됨"); // 함수 호출 여부 확인을 위한 로그
        if (employeecode) {
            openContractPopup();
        } else {
            alert("데이터를 확인하세요.");
        }
    }

    // 조회하고 조회 리스트에서 해당 사번 행 선택하는 함수
    function fetchDataAndSelectRow(empCode) {
        // 이미 정의된 조회 이벤트를 호출
        document.getElementById("view-signatures").click();
    }


    function loadContractPage() {
        const year = document.getElementById("contract-year").value;
        const employeeCode = document.getElementById("employee-code").value;
        const iframe = document.getElementById("contract-iframe");
        iframe.src = `/contract?code=${employeeCode}&year=${year}`;
    }

    // 사용자 확정 처리 함수
    function handleEmpConfirm() {
        // 사용자 확정된 항목 검사
        const alreadyDistributedSeq = [];
        const alreadyEmpConfirmSeqs = [];
        const alreadyAdminConfirmSeqs = [];
        const empCodes = [];

        // 사용자 확정 취소 확인 메시지 박스
        if (!confirm("사용자 확정 처리 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 확정 처리 로직 실행 중단
        }

        // 사용자 확정 정보 추가
        empCodes.push({
            emp_code: document.getElementById("employee-code").value,
            contract_year: document.getElementById("contract-year").value,
            adminconfirm: document.getElementById("manage-confirm").checked,
            emp_confirm: "Y"
        });

        // adminconfirm 이 체크 상태이면 처리중단 에러로 떨어지게 처리
        if (document.getElementById("emp-confirm").checked) {
            alert("사용자 확정된 항목이 있어 처리가 중단됩니다.");
            return;
        }

        // adminconfirm 이 체크 상태이면 처리중단 에러로 떨어지게 처리
        if (document.getElementById("manage-confirm").checked) {
            alert("관리자가 확정된 항목이 있어 처리가 중단됩니다.");
            return;
        }

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송 (관리자 확정 처리)
        fetch("/submit3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(empCodes)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Received response from server:", data); // 서버 응답 형식 확인 로그

                // 응답이 배열인지 확인
                if (!Array.isArray(data)) {
                    console.error("Unexpected response format:", data);
                    alert("서버 응답 형식이 올바르지 않습니다.");
                    return;
                }

                // 응답 데이터 처리
                let processedCount = 0;
                data.forEach(result => {
                    if (result.error) {
                        console.error(`사용자 확정 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 사용자 확정 처리가 완료되었습니다.`);
                } else {
                    alert("사용자 확정 처리 중 에러가 발생했습니다.");
                }

                // 사용자 확정 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = document.getElementById("employee-code").value;
                fetchDataAndSelectRow(empCodesList);

            })
            .catch(error => {
                console.error("사용자 확정 처리 중 에러가 발생했습니다:", error);
                alert("사용자 확정 처리 중 에러가 발생했습니다.");
            });

    }

    // 사용자 확정 취소 처리 함수
    function handleEmpConfirmCancel() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        // 사용자 확정 취소 확인 메시지 박스
        if (!confirm("사용자 확정 취소 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 취소 로직 실행 중단
        }

        // 이미 확정된 항목 검사 및 배포 여부 확인
        const notConfirmedSeqs = [];
        const AdminConfirmedSeqs = [];
        const empCodes = [];
        // 사용자 확정 정보 추가
        empCodes.push({
            emp_code: document.getElementById("employee-code").value,
            contract_year: document.getElementById("contract-year").value,
            adminconfirm: document.getElementById("manage-confirm").checked,
            emp_confirm: "N"
        });

        // adminconfirm 이 체크 상태이면 처리중단 에러로 떨어지게 처리
        if (!document.getElementById("emp-confirm").checked) {
            alert("사용자 확정처리가 안된 항목이 있어 처리가 중단됩니다.");
            return;
        }
        // adminconfirm 이 체크 상태이면 처리중단 에러로 떨어지게 처리
        if (document.getElementById("manage-confirm").checked) {
            alert("관리자가 확정된 항목이 있어 처리가 중단됩니다.");
            return;
        }

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송
        fetch("/submit3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(empCodes)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Received response from server:", data); // 서버 응답 형식 확인 로그

                // 응답이 배열인지 확인
                if (!Array.isArray(data)) {
                    console.error("Unexpected response format:", data);
                    alert("서버 응답 형식이 올바르지 않습니다.");
                    return;
                }

                // 응답 데이터 처리
                let processedCount = 0;
                data.forEach(result => {
                    if (result.error) {
                        console.error(`사용자 확정 취소 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 사용자 확정 취소 처리가 완료되었습니다.`);
                } else {
                    alert("사용자 확정 취소 처리 중 에러가 발생했습니다.");
                }

                // 사용자 확정 취소가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = document.getElementById("employee-code").value;
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("사용자 확정 취소 처리 중 에러가 발생했습니다:", error);
                alert("사용자 확정 취소 처리 중 에러가 발생했습니다.");
            });
    }


    // 입력 필드의 값을 합산하여 합계금액과 연봉총액을 계산하는 함수
    function calculateTotalAndAnnualSalary() {
        const amtBase = parseNumber(document.getElementById("amt-base").value) || 0;
        const amtOvertime = parseNumber(document.getElementById("amt-overtime").value) || 0;
        const amtCar = parseNumber(document.getElementById("amt-car").value) || 0;
        const amtResearch = parseNumber(document.getElementById("amt-research").value) || 0;
        const amtJob = parseNumber(document.getElementById("amt-job").value) || 0;
        const amtBaby = parseNumber(document.getElementById("amt-baby").value) || 0;

        const totalAmount = amtBase + amtOvertime + amtCar + amtResearch + amtJob + amtBaby;

        document.getElementById("amt-sum").value = formatNumber(totalAmount);
        document.getElementById("amt-all").value = formatNumber(totalAmount * 13);

    }

    // 각 입력 필드에 이벤트 리스너 추가
    document.getElementById("amt-base").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-overtime").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-car").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-research").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-job").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-baby").addEventListener("input", calculateTotalAndAnnualSalary);


    // "연봉근로계약서 보기" 버튼에 이벤트 리스너 추가
    document.getElementById("viewContractButton").addEventListener("click", checkAndOpenContractPopup);

    window.onload = function () {
    // 좌우 분할
        window.splitInstance = Split(["#left-pane", "#right-pane"], {
            sizes: [41.5, 58.5], // 기본 비율을 41.5:58.5으로 설정
            minSize: 200,
            gutterSize: 8,
            cursor: "col-resize",
            gutter: function (index, direction) {
                const gutter = document.createElement("div");
                gutter.className = `gutter gutter-${direction}`;
                return gutter;
            },
            elementStyle: function (dimension, size, gutterSize) {
                return {
                    "flex-basis": `calc(${size}% - ${gutterSize}px)`
                };
            },
            gutterStyle: function (dimension, gutterSize) {
                return {
                    "flex-basis": `${gutterSize}px}`
                };
            }
        });

        // 왼쪽 상하 분할
        window.splitInstanceLeft = Split(["#left-top-pane", "#left-bottom-pane"], {
            direction: "vertical",
            sizes: [10, 90],
            minSize: 100,
            gutterSize: 8,
            cursor: "row-resize",
            gutter: function (index, direction) {
                const gutter = document.createElement("div");
                gutter.className = `gutter gutter-${direction}`;
                return gutter;
            },
            elementStyle: function (dimension, size, gutterSize) {
                return {
                    "flex-basis": `calc(${size}% - ${gutterSize}px)`
                };
            },
            gutterStyle: function (dimension, gutterSize) {
                return {
                    "flex-basis": `${gutterSize}px}`
                };
            }
        });

        const leftVerticalGutter = document.querySelector(".gutter.gutter-vertical"); // 첫 번째로 나타나는 왼쪽 상하 스플릿바
        const horizontalGutter = document.querySelector(".gutter.gutter-horizontal"); // 좌우 스플릿바
        leftVerticalGutter.style.pointerEvents = "none"; // 비활성화
        horizontalGutter.style.pointerEvents = "none"; // 비활성화
    };

    // 사용자 확인 버튼 클릭 이벤트 리스너
    document.getElementById("btn-emp-confirm").addEventListener("click", handleEmpConfirm);
    document.getElementById("btn-emp-cancel").addEventListener("click", handleEmpConfirmCancel);

});

