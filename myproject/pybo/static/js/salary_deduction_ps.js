document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const saveDataButton = document.getElementById("saveDataButton");
    const cancelButton = document.getElementById("cancelButton");
    const select = document.getElementById("eventSelect");
    const display = document.getElementById("selectedEvent");

    if (saveDataButton) {
        saveDataButton.addEventListener("click", function () {
            const residid = document.getElementById("residid").value.trim();
            const eventCd = document.getElementById("eventSelect").value;
            console.log("📌 전송할 residid 값:", residid);
            console.log("📌 전송할 event_cd 값:", eventCd);
            // 유효성 검사
            if (!residid) {
                alert("주민등록번호를 입력해주세요.");
                return;
            }
            if (!eventCd) {
                alert("경조사를 선택해주세요.");
                return;
            }

            if (confirm("미공제 신청을 하시겠습니까?")) {

                fetch("/api/salary_deduction_ps", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ residid: residid, event_cd: eventCd })
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
                                alert("미공제 신청이 정상적으로 처리 되었습니다!");
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

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            const residid = document.getElementById("residid").value.trim();
            const eventCd = document.getElementById("eventSelect").value;
            console.log("📌 전송할 residid 값:", residid); // 값 확인
            console.log("📌 전송할 event_cd 값:", eventCd);
            // 유효성 검사
            if (!residid) {
                alert("주민등록번호를 입력해주세요.");
                return;
            }
            if (!eventCd) {
                alert("경조사를 선택해주세요.");
                return;
            }

            if (confirm("공제 신청을 하시겠습니까?")) {

                fetch("/api/salary_deduction_ps", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ residid: residid, event_cd: eventCd })
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
                                alert("공제 신청이 정상적으로 처리 되었습니다!");
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

    fetch("/api/current_events")
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
                option.value = item.EVENT_CD;
                option.textContent = item.DISPLAY_TEXT;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("❌ 경조사 로딩 실패:", err);
        });


    select.addEventListener("change", () => {
        const selectedText = select.options[select.selectedIndex].text;
        const selectedValue = select.value;

        if (selectedValue) {
            display.innerHTML = ` - 선택된 경조사 : <strong>${selectedText}</strong><br> - 경조사 코드 : <code>${selectedValue}</code>`;
        } else {
            display.innerHTML = "";
        }
    });

});

function refreshEventDropdown() {
    fetch("/api/current_events")
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById("eventSelect"); // 드롭다운 ID에 맞게 수정
            dropdown.innerHTML = ""; // 기존 옵션 제거

            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.EVENT_CD;
                option.textContent = item.DISPLAY_TEXT;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error("❌ 이벤트 리스트 갱신 실패:", error));
}