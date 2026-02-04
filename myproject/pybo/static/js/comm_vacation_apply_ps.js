document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const saveDataButton = document.getElementById("saveDataButton");
    const cancelButton = document.getElementById("cancelButton");
    const select = document.getElementById("eventSelect");
    const display = document.getElementById("selectedEvent");
    //미사용 신청
    if (saveDataButton) {
        saveDataButton.addEventListener("click", function () {
            const residid = document.getElementById("residid").value.trim();
            const comm_vacation_cd = document.getElementById("eventSelect").value;
            const reasonText = document.getElementById("reasonText").value;
            console.log("📌 전송할 residid 값:", residid);
            console.log("📌 전송할 comm_vacation_cd 값:", comm_vacation_cd);
            console.log("📌 전송할 reasonText 값:", reasonText);
            // 유효성 검사
            if (!residid) {
                alert("주민등록번호를 입력해주세요.");
                return;
            }
            if (!comm_vacation_cd) {
                alert("공통 휴일을 선택해주세요.");
                return;
            }
            if (!reasonText) {
                alert("미사용 신청 사유를 입력해주세요.");
                return;
            }

            if (confirm("미사용 신청을 하시겠습니까?")) {

                fetch("/api/comm_vacation_apply_ps", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    /*body: JSON.stringify({ residid: residid, comm_vacation_cd: comm_vacation_cd })*/
                    /*body: JSON.stringify({ resid: residid, comm_vacation_cd: parseInt(comm_vacation_cd) })*/
                    body: JSON.stringify({ resid: residid, comm_vacation_cd: parseInt(comm_vacation_cd), reasonText: reasonText })
                })
                    .then(response => {
                        console.log("응답 상태 코드:", response.status);
                        if (!response.ok) {
                            throw new Error("서버 응답 오류: " + response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("서버 응답 데이터:", data);
                        if (data.success) {
                            if (data.updated_rows > 0) {
                                alert("미사용 신청이 정상적으로 처리 되었습니다!");
                            } else {
                                alert("⚠️ 업데이트된 데이터가 없습니다.\n     입력한 주민등록번호(뒷 7자리)가 올바른지\n     또는 조사기간이 종료되었는지 확인해보세요.");
                                refreshEventDropdown(); // 여기서 드롭다운 새로고침
                            }
                        } else {
                            alert("❌ 업데이트 중 오류가 발생했습니다. 관리자에게 문의하세요.");
                            refreshEventDropdown(); // 여기서 드롭다운 새로고침
                        }
                    })
                    .catch(error => {
                        alert("데이터 저장 중 오류가 발생했습니다.");
                        console.error("데이터 저장 중 오류:", error);
                    });
            }
        });
    }
    // 사용 신청
    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            const residid = document.getElementById("residid").value.trim();
            const comm_vacation_cd = document.getElementById("eventSelect").value;
            console.log("📌 전송할 residid 값:", residid); // 값 확인
            console.log("📌 전송할 comm_vacation_cd 값:", comm_vacation_cd);
            // 유효성 검사
            if (!residid) {
                alert("주민등록번호를 입력해주세요.");
                return;
            }
            if (!comm_vacation_cd) {
                alert("공통휴일을 선택해주세요.");
                return;
            }

            if (confirm("사용 신청을 하시겠습니까?")) {

                fetch("/api/comm_vacation_apply_ps", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    /*body: JSON.stringify({ residid: residid, comm_vacation_cd: comm_vacation_cd })*/
                    body: JSON.stringify({ resid: residid, comm_vacation_cd: parseInt(comm_vacation_cd) })
                })
                    .then(response => {
                        console.log("응답 상태 코드:", response.status);
                        if (!response.ok) {
                            throw new Error("서버 응답 오류: " + response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("서버 응답 데이터:", data);
                        if (data.success) {
                            if (data.updated_rows > 0) {
                                alert("사용 신청이 정상적으로 처리 되었습니다!");
                            } else {
                                alert("⚠️ 업데이트된 데이터가 없습니다.\n     입력한 주민등록번호(뒷 7자리)가 올바른지\n     또는 조사기간이 종료되었는지 확인해보세요.");
                                refreshEventDropdown(); // 여기서 드롭다운 새로고침
                            }
                        } else {
                            alert("❌ 업데이트 중 오류가 발생했습니다. 관리자에게 문의하세요.");
                            refreshEventDropdown(); // 여기서 드롭다운 새로고침
                        }
                    })
                    .catch(error => {
                        alert("데이터 저장 중 오류가 발생했습니다.");
                        console.error("데이터 저장 중 오류:", error);
                    });
            }
        });
    }

    fetch("/api/comm_vacation_events")
        .then(res => {
            console.log("📥 응답 상태:", res.status);
            return res.json();
        })
        .then(data => {
            console.log("📌 받은 데이터:", data);
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("⚠️ 데이터가 비어있음 또는 배열이 아님");
            }
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.comm_vacation_cd;
                option.textContent = item.DISPLAY_TEXT;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("❌ 공통 휴일 로딩 실패:", err);
        });


    select.addEventListener("change", () => {
        const selectedText = select.options[select.selectedIndex].text;
        const selectedValue = select.value;

        if (selectedValue) {
            display.innerHTML = ` - 선택된 공통 휴일 : <strong>${selectedText}</strong><br>
                                  - 공통 휴일 코드 : <span style="font-weight:bold; color:green; font-size:inherit;">${selectedValue}</span>`;
        } else {
            display.innerHTML = "";
        }
    });

});

function refreshEventDropdown() {
    fetch("/api/comm_vacation_events")
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById("eventSelect"); // 드롭다운 ID에 맞게 수정
            dropdown.innerHTML = ""; // 기존 옵션 제거

            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.comm_vacation_cd;
                option.textContent = item.DISPLAY_TEXT;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error("❌ 공통 휴일 리스트 갱신 실패:", error));
}