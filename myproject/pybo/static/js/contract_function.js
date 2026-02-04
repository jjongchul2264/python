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

// 배포 처리 함수
function handleDistribution() {
    // 선택된 항목 확인
    const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

    if (selectedRows.length === 0) {
        alert("배포할 항목을 선택해 주세요.");
        return;
    }

    // 이미 배포된 항목 검사
    const alreadyDistributedSeqs = [];
    const empCodes = [];
    selectedRows.forEach(row => {
        const distributionStatusCheckbox = row.closest("tr").querySelector('td:nth-child(8) input[type="checkbox"]'); // 8번째 컬럼의 체크박스 선택
        const distributionStatus = distributionStatusCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

        if (distributionStatus === "Y") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            alreadyDistributedSeqs.push(seq);
        } else {
            empCodes.push({
                emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                contract_flag: "Y"
            });
        }
    });

    // 이미 배포된 항목이 있는 경우 알림
    if (alreadyDistributedSeqs.length > 0) {
        alert(`다음 항목들이 이미 배포되어있어 처리가 중단됩니다.: ${alreadyDistributedSeqs.join(", ")} 번행`);
        return;
    }

    console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

    // 서버로 데이터 전송
    fetch("/submit2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(empCodes)
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(result => {
                if (result.error) {
                    alert(`배포 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                } else {
                    alert(`순번 ${result.seq}: ${result.message || "배포 처리가 완료되었습니다!"}`);
                }
            });

            // 배포가 완료된 경우 조회를 위한 함수 호출
            const empCodesList = empCodes.map(emp => emp.emp_code);
            fetchDataAndSelectRow(empCodesList);
        })
        .catch(error => {
            console.error("배포 처리 중 에러가 발생했습니다:", error);
            alert("배포 처리 중 에러가 발생했습니다.");
        });
}


// 관리자 확정 처리 함수
function handleAdminConfirm() {
    // 선택된 항목 확인
    const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

    if (selectedRows.length === 0) {
        alert("관리자 확정 처리할 항목을 선택해 주세요.");
        return;
    }

    // 사용자 확정된 항목 검사
    const alreadyEmpConfirmSeqs = [];
    const alreadyAdminConfirmSeqs = [];
    const empCodes = [];
    selectedRows.forEach(row => {
        const empconfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(9) input[type="checkbox"]'); // 사용자 확정 체크박스
        const empconfirmStatus = empconfirmStatusCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

        const adminconfirmCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]');
        const adminconfirmStatus = adminconfirmCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

        if (empconfirmStatus === "N") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            alreadyEmpConfirmSeqs.push(seq);
        } else if (adminconfirmStatus === "Y") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            alreadyAdminConfirmSeqs.push(seq);
        } else {
            empCodes.push({
                code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim() // 순번 열 값 (2번째 열)
            });
        }
    });

    // 사용자 확정된 항목이 안된 경우 알림
    if (alreadyEmpConfirmSeqs.length > 0) {
        alert(`사용자 확정이 안된 항목이 있어 처리가 중단됩니다.: ${alreadyEmpConfirmSeqs.join(", ")} 번행`);
        return;
    }

    // 관리자 확정이 된 경우 알림
    if (alreadyAdminConfirmSeqs.length > 0) {
        alert(`관리자 확정 처리된 항목이 있어 처리가 중단됩니다.: ${alreadyAdminConfirmSeqs.join(", ")} 번행`);
        return;
    }

    // 각 사번에 대해 개별 확정 처리
    selectedRows.forEach(row => {
        const empCode = row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(); // 사번 열의 값을 가져옴 (6번째 열)
        const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
        const year = row.closest("tr").querySelector("td:nth-child(3)").textContent.trim();
        const contractData = {
            emp_code: empCode,
            admin_confirm: "Y", // 확정할 경우 플래그를 'Y'로 설정
            contract_year: year
        };

        console.log("Sending data to server:", contractData); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송 (관리자 확정 처리)
        fetch("/submit4", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contractData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Response for seq ${seq}:`, data); // 디버깅용 콘솔 로그
                if (data.error) {
                    alert(`관리자 확정 처리 중 에러가 발생했습니다 (순번 ${seq}): ` + data.error);
                } else {
                    alert(`순번 ${seq}: ${data.message || "관리자 확정 처리가 완료되었습니다!"}`);
                    // 확정이 완료된 경우 사원번호를 백업 변수에 저장
                    backupEmpCode = empCode;

                    // 조회를 위한 함수 호출
                    fetchDataAndSelectRow(backupEmpCode);
                }
            })
            .catch(error => {
                console.error(`관리자 확정 처리 중 에러가 발생했습니다 (순번 ${seq}):`, error);
                alert(`관리자 확정 처리 중 에러가 발생했습니다 (순번 ${seq}).`);
            });
    });
}

// 배포 취소 처리 함수
function handleDistributionCancel() {
    // 선택된 항목 확인
    const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

    if (selectedRows.length === 0) {
        alert("배포 취소할 항목을 선택해 주세요.");
        return;
    }

    // 이미 배포된 항목 검사 및 사용자 확정 여부 확인
    const notDistributedSeqs = [];
    const empConfirmSeqs = [];
    const empCodes = [];
    selectedRows.forEach(row => {
        const distributionStatusCheckbox = row.closest("tr").querySelector('td:nth-child(8) input[type="checkbox"]'); // 배포 상태 체크박스
        const empConfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]'); // 사용자 확정 상태 체크박스

        const distributionStatus = distributionStatusCheckbox.checked ? "Y" : "N";
        const empConfirmStatus = empConfirmStatusCheckbox.checked ? "Y" : "N";

        if (distributionStatus === "N") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            notDistributedSeqs.push(seq);
        } else if (empConfirmStatus === "Y") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            empConfirmSeqs.push(seq);
        } else {
            empCodes.push({
                code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim() // 연도 열 값 (3번째 열)
            });
        }
    });

    // 배포되지 않은 항목이 있는 경우 알림
    if (notDistributedSeqs.length > 0) {
        alert(`다음 항목들은 배포되지 않아 취소할 수 없습니다: ${notDistributedSeqs.join(", ")} 번행`);
        return;
    }

    // 사용자 확정이 된 항목이 있는 경우 알림
    if (empConfirmSeqs.length > 0) {
        alert(`사용자 확정 상태로 배포 취소가 불가합니다: ${empConfirmSeqs.join(", ")} 번행`);
        return;
    }

    // 각 사번에 대해 개별 배포 취소 처리
    empCodes.forEach(emp => {
        const contractData = {
            emp_code: emp.code,
            contract_flag: "N", // 배포 취소할 경우 플래그를 'N'로 설정
            contract_year: emp.year
        };

        console.log("Sending data to server:", contractData); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송
        fetch("/submit2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contractData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Response for seq ${emp.seq}:`, data); // 디버깅용 콘솔 로그
                if (data.error) {
                    alert(`배포 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}): ` + data.error);
                } else {
                    alert(`순번 ${emp.seq}: ${data.message || "배포 취소 처리가 완료되었습니다!"}`);
                    // 배포가 완료된 경우 사원번호를 백업 변수에 저장
                    backupEmpCode = emp.code;

                    // 조회를 위한 함수 호출
                    fetchDataAndSelectRow(backupEmpCode);
                }
            })
            .catch(error => {
                console.error(`배포 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}):`, error);
                alert(`배포 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}).`);
            });
    });
}

// 관리자 확정 취소 처리 함수
function handleAdminConfirmCancel() {
    // 선택된 항목 확인
    const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

    if (selectedRows.length === 0) {
        alert("관리자 확정 취소할 항목을 선택해 주세요.");
        return;
    }

    // 이미 확정된 항목 검사 및 배포 여부 확인
    const notConfirmedSeqs = [];
    const empCodes = [];
    selectedRows.forEach(row => {
        const empConfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]'); // 사용자 확정 상태 체크박스

        const empConfirmStatus = empConfirmStatusCheckbox.checked ? "Y" : "N";

        if (empConfirmStatus === "N") {
            const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
            notConfirmedSeqs.push(seq);
        } else {
            empCodes.push({
                code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim() // 연도 열 값 (3번째 열)
            });
        }
    });

    // 확정되지 않은 항목이 있는 경우 알림
    if (notConfirmedSeqs.length > 0) {
        alert(`다음 항목들은 확정되지 않아 취소할 수 없습니다: ${notConfirmedSeqs.join(", ")} 번행`);
        return;
    }

    // 각 사번에 대해 개별 확정 취소 처리
    empCodes.forEach(emp => {
        const contractData = {
            emp_code: emp.code,
            admin_confirm: "N", // 확정 취소할 경우 플래그를 'N'로 설정
            contract_year: emp.year
        };

        console.log("Sending data to server:", contractData); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송
        fetch("/submit4", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contractData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Response for seq ${emp.seq}:`, data); // 디버깅용 콘솔 로그
                if (data.error) {
                    alert(`관리자 확정 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}): ` + data.error);
                } else {
                    alert(`순번 ${emp.seq}: ${data.message || "관리자 확정 취소 처리가 완료되었습니다!"}`);
                    // 확정 취소가 완료된 경우 사원번호를 백업 변수에 저장
                    backupEmpCode = emp.code;

                    // 조회를 위한 함수 호출
                    fetchDataAndSelectRow(backupEmpCode);
                }
            })
            .catch(error => {
                console.error(`관리자 확정 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}):`, error);
                alert(`관리자 확정 취소 처리 중 에러가 발생했습니다 (순번 ${emp.seq}).`);
            });
    });
}