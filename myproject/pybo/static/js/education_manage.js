// 폼 로드 될때
document.addEventListener("DOMContentLoaded", () => {
    // DOM 요소 캐싱
    const realFile = document.getElementById("real-file");
    const fileNameSpan = document.getElementById("file-name");
    const saveBtn = document.getElementById("btn-save");
    const newBtn = document.getElementById("btn-new");
    const eduTbody = document.querySelector("#edudataTable tbody");
    const granTbody = document.querySelector("#grandataTable tbody");
    const secondTable = document.querySelectorAll("table")[1];

    // 세션 스토리지 키
    const STORAGE_KEY = "education_manage_data";
    const QUERY_PARAMS_KEY = "education_manage_query_params";
    const SELECTED_EDU_KEY = "education_manage_selected_edu";

    // ======================
    // 유틸리티 함수
    // ======================

    // 폼 필드 초기화
    function resetForm() {
        document.getElementById("edu_no").value = "";
        document.getElementById("edu_name").value = "";
        document.getElementById("file-name").textContent = "";
        document.getElementById("real-file").value = "";
        $("#edu_date").datepicker("setDate", new Date());
        $("#edu_begin_date").val("");
        $("#edu_end_date").val("");
    }

    // 테이블 행 선택 처리
    function selectRow(tbody, row) {
        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected", "focused-row"));
        row.classList.add("selected", "focused-row");
    }

    // 체크박스 셀 생성
    function createCheckboxCell() {
        const cell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("select-row");
        cell.appendChild(checkbox);
        return cell;
    }

    // ======================
    // 헤더 더블 클릭 체크박스 토글
    // ======================
    secondTable.querySelector("thead").addEventListener("dblclick", (event) => {
        if (event.target.matches("th:nth-child(1)")) {
            const visibleRows = Array.from(secondTable.querySelector("tbody").querySelectorAll("tr"))
                .filter(row => row.style.display !== "none");
            const checkboxes = visibleRows.map(row =>
                row.querySelector("td:nth-child(1) input[type='checkbox']")
            );
            const allChecked = checkboxes.every(cb => cb && cb.checked);
            checkboxes.forEach(cb => {
                if (cb) {
                    cb.checked = !allChecked;
                }
            });
        }
    });

    // ======================
    // jQuery DatePicker 설정
    // ======================
    $(document).ready(function () {
        const datePickerConfig = {
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            closeText: "닫기",
            currentText: "오늘",
            monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
            dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
            dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
            yearRange: "-100:+0",
            beforeShow: function (input, inst) {
                inst.dpDiv.addClass("calendar-on-top");
            },
            onClose: function (dateText, inst) {
                if (dateText.length <= 7) {
                    $(this).datepicker("setDate", new Date(inst.selectedYear, inst.selectedMonth, 1));
                }
            }
        };

        // 오늘 버튼 기능 재정의
        $.datepicker._gotoToday = function (id) {
            const target = $(id);
            target.datepicker("setDate", new Date());
            this._hideDatepicker();
        };

        // 날짜 필드에 적용
        $("#from_date, #to_date, #edu_date").datepicker(datePickerConfig);

        // 기본값 설정
        $("#to_date, #edu_date").datepicker("setDate", new Date());
        $("#from_date").datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1));

        // 저장된 데이터 복원
        restoreData();
    });

    // ======================
    // 라디오 버튼 필터
    // ======================
    document.querySelectorAll('input[name="edu-grand-status"]').forEach(radio => {
        radio.addEventListener("change", (event) => {
            const value = event.target.value;
            secondTable.querySelectorAll("tbody tr").forEach(row => {
                const dateCell = row.querySelector("td:nth-child(7)");
                const dateValue = dateCell ? dateCell.textContent.trim() : "";
                const status = dateValue ? "Y" : "N";
                row.style.display = (value === "%" || status === value) ? "" : "none";
            });
        });
    });

    // ======================
    // 데이터 복원 함수
    // ======================
    function restoreData() {
        try {
            const savedData = sessionStorage.getItem(STORAGE_KEY);
            const queryParams = sessionStorage.getItem(QUERY_PARAMS_KEY);
            const selectedEduNo = sessionStorage.getItem(SELECTED_EDU_KEY);

            if (queryParams) {
                const params = JSON.parse(queryParams);
                document.getElementById("from_date").value = params.fromDate;
                document.getElementById("to_date").value = params.toDate;
            }

            if (savedData) {
                const data = JSON.parse(savedData);
                renderEduList(data);

                if (selectedEduNo) {
                    setTimeout(() => {
                        const targetRow = eduTbody.querySelector(`tr[data-edu-no="${selectedEduNo}"]`);
                        if (targetRow) {
                            selectRow(eduTbody, targetRow);
                            const savedGranData = sessionStorage.getItem(`${STORAGE_KEY}_gran_${selectedEduNo}`);
                            if (savedGranData) {
                                renderGranList(JSON.parse(savedGranData));
                            } else {
                                loadStudents(selectedEduNo);
                            }
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error("데이터 복원 중 오류:", error);
        }
    }

    // ======================
    // 교육 리스트 렌더링
    // ======================
    function renderEduList(data) {
        eduTbody.innerHTML = "";
        const rows = Array.isArray(data.rows) ? data.rows : [data.rows];

        rows.forEach((row, index) => {
            const tr = document.createElement("tr");
            tr.dataset.index = index;
            tr.dataset.eduNo = row.edu_no;

            const cells = [
                createCheckboxCell(),
                Object.assign(document.createElement("td"), { textContent: row.edu_no, className: "edu-no" }),
                Object.assign(document.createElement("td"), { textContent: row.edu_date }),
                Object.assign(document.createElement("td"), { textContent: row.edu_name }),
                Object.assign(document.createElement("td"), { textContent: row.edu_begin_date }),
                Object.assign(document.createElement("td"), { textContent: row.edu_end_date }),
                Object.assign(document.createElement("td"), { textContent: row.attach_file_name })
            ];

            // 메일 발송 체크박스
            const flagCell = document.createElement("td");
            const flagCheckbox = document.createElement("input");
            flagCheckbox.type = "checkbox";
            flagCheckbox.checked = (row.edu_email_flag === "Y");
            flagCheckbox.disabled = true;
            flagCell.appendChild(flagCheckbox);
            cells.push(flagCell);

            cells.forEach(cell => tr.appendChild(cell));
            eduTbody.appendChild(tr);
        });
    }

    // ======================
    // 수료자 리스트 렌더링
    // ======================
    function renderGranList(data) {
        granTbody.innerHTML = "";
        const rows = Array.isArray(data.rows) ? data.rows : (data.rows ? [data.rows] : []);

        if (!rows || rows.length === 0) {
            granTbody.innerHTML = `<tr><td colspan="7">수료자가 없습니다.</td></tr>`;
            return;
        }

        document.getElementById("tot_count").value = data.tot_count;
        document.getElementById("nc_count").value = data.nc_count;

        rows.forEach((row, index) => {
            const tr = document.createElement("tr");
            tr.dataset.index = index;
            tr.dataset.eduNo = row.edu_no;
            tr.dataset.eduDate = row.edu_date;

            const cells = [
                createCheckboxCell(),
                Object.assign(document.createElement("td"), { textContent: row.seq }),
                Object.assign(document.createElement("td"), { textContent: row.edu_no, className: "edu-no" }),
                Object.assign(document.createElement("td"), { textContent: row.emp_dept }),
                Object.assign(document.createElement("td"), { textContent: row.emp_code, className: "emp-code" }),
                Object.assign(document.createElement("td"), { textContent: row.emp_name }),
                Object.assign(document.createElement("td"), { textContent: row.emp_grand_date })
            ];

            cells.forEach(cell => tr.appendChild(cell));

            tr.addEventListener("click", () => selectRow(granTbody, tr));
            granTbody.appendChild(tr);

            if (index === 0) {
                tr.click();
            }
        });
    }

    // ======================
    // 테이블 크기 조절
    // ======================
    function adjustTableSize() {
        const tableContainers = document.querySelectorAll(".table-container");
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        tableContainers.forEach(container => {
            const rect = container.getBoundingClientRect();
            container.style.maxHeight = (windowHeight - rect.top - 30) + "px";
            container.style.maxWidth = (windowWidth - rect.left - 30) + "px";
        });
    }

    window.addEventListener("load", adjustTableSize);
    window.addEventListener("resize", adjustTableSize);

    // ======================
    // 교육명 입력 시 시간 자동 설정
    // ======================
    document.getElementById("edu_name").addEventListener("input", () => {
        const eduName = document.getElementById("edu_name");
        const beginInput = document.getElementById("edu_begin_date");
        const endInput = document.getElementById("edu_end_date");

        if (!eduName.value.trim()) {
            beginInput.value = "";
            endInput.value = "";
        } else {
            const now = new Date();
            const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            if (!beginInput.value) {
                beginInput.value = formatted;
            }
            if (!endInput.value) {
                endInput.value = formatted;
            }
        }
    });

    // ======================
    // 조회 버튼
    // ======================
    document.getElementById("btn-query").addEventListener("click", () => {
        const fromDate = document.getElementById("from_date").value;
        const toDate = document.getElementById("to_date").value;

        if (!fromDate || !toDate) {
            alert("조회 기간을 입력하세요.");
            return;
        }

        sessionStorage.setItem(QUERY_PARAMS_KEY, JSON.stringify({ fromDate, toDate }));

        fetch(`/docs/query?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("조회 실패");
                }
                return response.json();
            })
            .then(data => {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                renderEduList(data);
                const firstRow = eduTbody.querySelector("tr");
                if (firstRow) {
                    firstRow.click();
                }
            })
            .catch(error => {
                console.error("조회 중 오류:", error);
                alert("조회 중 오류 발생: " + error.message);
            });
    });

    // ======================
    // 교육 List 클릭
    // ======================
    eduTbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) {
            return;
        }

        selectRow(eduTbody, tr);

        const eduNo = tr.dataset.eduNo;
        if (!eduNo) {
            console.error("edu_no가 정의되지 않았습니다.", tr);
            return;
        }

        sessionStorage.setItem(SELECTED_EDU_KEY, eduNo);
        loadStudents(eduNo);
        document.querySelector('input[name="edu-grand-status"][value="%"]').checked = true;
    });

    // ======================
    // 수료자 List 조회
    // ======================
    function loadStudents(eduNo) {
        fetch(`/docs/query_gran?edu_no=${encodeURIComponent(eduNo)}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("수료자 조회 실패");
                }
                return res.json();
            })
            .then(data => {
                sessionStorage.setItem(`${STORAGE_KEY}_gran_${eduNo}`, JSON.stringify(data));
                renderGranList(data);
            })
            .catch(err => {
                alert("수료자 조회 중 오류 발생: " + err.message);
                console.error(err);
            });
    }

    // ======================
    // 신규 버튼
    // ======================
    newBtn.addEventListener("click", () => {
        const eduName = document.getElementById("edu_name").value.trim();
        const fileName = fileNameSpan.textContent.trim();

        if ((eduName || fileName) && !confirm("입력된 데이터가 있습니다. 초기화 하시겠습니까?")) {
            return;
        }
        resetForm();
    });

    // ======================
    // 파일 선택
    // ======================
    document.getElementById("custom-file-btn").addEventListener("click", () => realFile.click());

    realFile.addEventListener("change", () => {
        fileNameSpan.textContent = realFile.files.length > 0 ? realFile.files[0].name : "";
    });

    // ======================
    // 저장 버튼
    // ======================
    saveBtn.addEventListener("click", () => {
        const eduName = document.getElementById("edu_name").value.trim();

        if (!eduName) {
            alert("교육명을 입력하세요.");
            return;
        }

        if (realFile.files.length === 0) {
            alert("첨부할 파일을 먼저 선택하세요.");
            return;
        }

        const eduData = {
            edu_date: document.getElementById("edu_date").value,
            edu_name: eduName,
            edu_begin_date: document.getElementById("edu_begin_date").value,
            edu_end_date: document.getElementById("edu_end_date").value
        };

        document.getElementById("upload-modal").style.display = "flex";

        fetch("/docs/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eduData)
        })
            .then(res => res.json())
            .then(submit => {
                if (submit.error) {
                    alert("저장 실패: " + submit.error);
                    document.getElementById("upload-modal").style.display = "none";
                    return;
                }

                document.getElementById("edu_no").value = submit.edu_no;

                const formData = new FormData(document.getElementById("upload-form"));
                formData.set("edu_no", submit.edu_no);
                formData.set("edu_date", eduData.edu_date);

                return fetch("/docs/upload_doc", {
                    method: "POST",
                    body: formData
                });
            })
            .then(res => res.json())
            .then(upload => {
                document.getElementById("upload-modal").style.display = "none";

                if (upload.status === "ok") {
                    document.getElementById("attch-file-path").value = upload.file_path;
                    document.getElementById("attch-file-name").value = upload.file_name;
                    alert("저장이 완료되었습니다.");
                    document.getElementById("btn-query").click();
                } else {
                    alert("파일 업로드 실패: " + upload.error);
                }
            })
            .catch(err => {
                document.getElementById("upload-modal").style.display = "none";
                alert("서버 오류 발생");
                console.error(err);
            });
    });

    // ======================
    // 삭제 버튼
    // ======================
    document.getElementById("btn-delete").addEventListener("click", () => {
        const selectedRows = document.querySelectorAll('#edudataTable tbody input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("삭제할 교육 항목을 선택해 주세요.");
            return;
        }

        if (!confirm("선택한 교육 데이터를 삭제하시겠습니까?")) {
            return;
        }

        const selectedData = Array.from(selectedRows).map(cb => ({
            edu_no: cb.closest("tr").dataset.eduNo
        }));

        fetch("/docs/edu_delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedData })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("삭제 실패");
                }
                return res.json();
            })
            .then(result => {
                alert("삭제가 완료되었습니다.");
                selectedRows.forEach(cb => cb.closest("tr").remove());
                granTbody.innerHTML = "";
                resetForm();
                document.getElementById("btn-query").click();
            })
            .catch(err => {
                alert("삭제 중 오류 발생: " + err.message);
                console.error(err);
            });
    });

    // ======================
    // 메일 발송 (전체)
    // ======================
    function Email_All() {
        const selectedRows = document.querySelectorAll("#edudataTable tbody input.select-row:checked");

        if (selectedRows.length === 0) {
            alert("메일 발송할 교육 항목을 선택해 주세요.");
            return;
        }

        const eduNos = Array.from(selectedRows).map(cb =>
            cb.closest("tr").querySelector(".edu-no").textContent.trim()
        );

        if (!confirm(`선택된 교육번호(${eduNos.join(", ")})에 대해 메일 발송 하시겠습니까?`)) {
            return;
        }

        fetch("/docs/send_mail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ edu_no_list: eduNos, flag: "1", emp_code1: null })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("메일 발송 실패: " + data.error);
                } else {
                    alert("메일 발송 완료: " + data.message);
                    document.getElementById("btn-query").click();
                }
            })
            .catch(err => {
                alert("메일 발송 중 오류 발생: " + err.message);
                console.error(err);
            });
    }

    // ======================
    // 메일 발송 (미수료자)
    // ======================
    function Email_2() {
        const firstRow = granTbody.querySelector("tr");
        if (!firstRow) {
            alert("조회된 데이터가 없습니다.");
            return;
        }

        const selectedRows = document.querySelectorAll("#grandataTable tbody input.select-row:checked");
        if (selectedRows.length === 0) {
            alert("메일 발송할 인원을 선택해 주세요.");
            return;
        }

        const eduNo = firstRow.querySelector(".edu-no").textContent.trim();
        const empCodeList = Array.from(selectedRows).map(cb =>
            cb.closest("tr").querySelector(".emp-code").textContent.trim()
        );

        if (!confirm(`교육번호 ${eduNo}, 미수료 인원(${empCodeList.length})명에게 메일 발송 하시겠습니까?`)) {
            return;
        }

        fetch("/docs/send_mail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ edu_no_list: [eduNo], flag: "2", emp_code1: empCodeList.join(",") })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("메일 발송 실패: " + data.error);
                } else {
                    alert("메일 발송 완료: " + data.message);
                    document.getElementById("btn-query").click();
                }
            })
            .catch(err => {
                alert("메일 발송 중 오류 발생: " + err.message);
                console.error(err);
            });
    }

    // ======================
    // 대상자 삭제
    // ======================
    document.getElementById("btn-emp-del").addEventListener("click", () => {
        const selectedRows = document.querySelectorAll('#grandataTable tbody input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("삭제할 대상자를 선택해 주세요.");
            return;
        }

        if (!confirm("선택한 대상자를 삭제하시겠습니까?")) {
            return;
        }

        const selectedData = Array.from(selectedRows).map(cb => {
            const row = cb.closest("tr");
            return {
                edu_no: row.querySelector(".edu-no")?.textContent.trim(),
                emp_code: row.querySelector(".emp-code").textContent.trim()
            };
        });

        fetch("/docs/emp_delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedData })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("삭제 실패");
                }
                return res.json();
            })
            .then(result => {
                alert("삭제가 완료되었습니다.");
                document.getElementById("btn-query").click();
            })
            .catch(err => {
                alert("삭제 중 오류 발생: " + err.message);
                console.error(err);
            });
    });

    // 이벤트 리스너 등록
    document.getElementById("btn-mailing").addEventListener("click", Email_All);
    document.getElementById("btn-mailing2").addEventListener("click", Email_2);
});
