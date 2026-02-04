let backupEmpCode = null;

// 숫자, 날짜, 텍스트 컬럼 컨트롤
document.addEventListener("DOMContentLoaded", function () {
    const dateInputs = document.querySelectorAll(".date-input");
    const textInputs = document.querySelectorAll(".text-input");
    const numberInputs = document.querySelectorAll(".number-input");
    const currentYear = new Date().getFullYear();
    const originalValues = {};
    const rows = document.querySelectorAll("#data-grid tbody tr");

    rows.forEach(row => {
        row.addEventListener("click", () => {
            // 이전 선택된 행을 제거
            rows.forEach(r => r.classList.remove("selected"));
            // 현재 선택된 행에 클래스 추가
            row.classList.add("selected");
        });
    });


    [
        "amt_base",
        "amt_sum",
        "amt_all",
        "amt_plus"

    ].forEach(id => {
        document.getElementById(id).readOnly = true;
    });

    document.getElementById("amt_std").value = 0;
    document.getElementById("amt_base").value = 0.0;
    document.getElementById("amt_overtime").value = 0.0;
    document.getElementById("amt_sum").value = 0.0;
    document.getElementById("amt_plus").value = 0.0;
    document.getElementById("amt_all").value = 0.0;
    document.getElementById("amt_car").value = 0;
    document.getElementById("amt_research").value = 0;
    document.getElementById("amt_job").value = 0;
    document.getElementById("amt_baby").value = 0;
    document.getElementById("amt_etc").value = 0;


    /* -------------------------------------------
   2) 숫자 표시용 (정수 + 천단위 콤마)
    ------------------------------------------- */
    function formatNumber(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        // 숫자만 추출 (소수점 제거)
        const cleaned = String(value).replace(/[^0-9-]/g, "").trim();

        if (cleaned === "" || cleaned === "-") {
            return cleaned;
        }

        // 정수 변환
        const intValue = parseInt(cleaned, 10);

        // 천단위 콤마 적용
        return intValue.toLocaleString("ko-KR");
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

    // 날짜 컨트롤
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

    function removeDateFormatting(value) {
        return value.replace(/-/g, "");
    }

    function applyDateFormat() {
        dateInputs.forEach(input => {
            input.value = formatDate(input.value);
        });
    }

    dateInputs.forEach(input => {
        let originalValue = input.value;

        input.addEventListener("focus", function (e) {
            console.log("Focus event triggered");
            originalValue = input.value;
            input.value = removeDateFormatting(input.value);

            // 전체 내용 선택
            setTimeout(() => {
                input.select();
            }, 0);
        });

        input.addEventListener("blur", function (e) {
            console.log("Blur event triggered");
            input.value = formatDate(input.value);
        });

        input.addEventListener("input", function (e) {
            console.log("Input event triggered");
            const value = input.value;
            if (/[^0-9]/.test(value)) { // 숫자가 아닌 값이 입력되면 경고 메시지 표시
                alert("숫자형태의 날짜를 입력해 주세요.");
                input.value = removeDateFormatting(originalValue); // 원래 값으로 되돌림
            } else {
                originalValue = value;
                input.value = value;
            }
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
});

// 폼 로드 될때
document.addEventListener("DOMContentLoaded", () => {
    function formatDateToYMD(date) {
        return date.toISOString().slice(0, 10); // '2026-01-05' 형태
    }

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
        setupDatePicker("#employee_birth");
        setupDatePicker("#job_from_date");
        setupDatePicker("#job_to_date");
        setupDatePicker("#contract_date");

        // 기본값을 오늘 날짜로 설정
        $("#contract_date").datepicker("setDate", new Date());
        $("#job_from_date").datepicker("setDate", new Date());
        // 오늘로부터 364일 뒤 날짜
        const toDate = new Date();
        toDate.setDate(toDate.getDate() + 364);
        $("#job_to_date").datepicker("setDate", toDate);
    });

    // job_from_date 선택 시 이벤트
    $("#job_from_date").datepicker({
        dateFormat: "yy-mm-dd", // YYYY-MM-DD 형태
        onSelect: function (selectedDate) {
            const fromDate = $(this).datepicker("getDate");
            const toDate = new Date(fromDate);
            toDate.setDate(toDate.getDate() + 364);
            $("#job_to_date").datepicker("setDate", toDate);
        }
    });

    $("#job_to_date").datepicker({
        dateFormat: "yy-mm-dd" // YYYY-MM-DD 형태
    });

    // 초기값 설정
    const initFromDate = new Date();
    const initToDate = new Date();
    initToDate.setDate(initToDate.getDate() + 364);

    $("#job_from_date").datepicker("setDate", initFromDate);
    $("#job_to_date").datepicker("setDate", initToDate);


    /* -------------------------------------------
   2) 숫자 표시용 (정수 + 천단위 콤마)
    ------------------------------------------- */
    function formatNumber(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        const cleaned = String(value).replace(/[^0-9.-]/g, "").trim();

        // "." 단독 허용
        if (cleaned === ".") {
            return ".";
        }

        const parts = cleaned.split(".");

        // 정수 부분 콤마
        const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (parts.length === 1) {
            return intPart;
        }

        const decimalPart = parts[1];
        return intPart + "." + decimalPart;
    }

    /* -------------------------------------------
    6) 합계 및 연봉 계산 (float 기반)
    ------------------------------------------- */
    function calculateTotalAndAnnualSalary() {

        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;
        const ceil100 = v => Math.ceil(v / 100) * 100;

        const std_wk_hour = toNum(document.getElementById("std_wk_hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot_wk_hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot_wk_hour").value);

        const amt_std = ceil100(toNum(document.getElementById("amt_std").value));
        const amt_car = ceil100(toNum(document.getElementById("amt_car").value));
        const amt_research = ceil100(toNum(document.getElementById("amt_research").value));
        const amt_job = ceil100(toNum(document.getElementById("amt_job").value));
        const amt_baby = ceil100(toNum(document.getElementById("amt_baby").value));
        const amt_etc = ceil100(toNum(document.getElementById("amt_etc").value));

        const amt_base = ceil100(toNum(document.getElementById("amt_base").value));
        const amt_overtime = ceil100(toNum(document.getElementById("amt_overtime").value));

        const totalETC = amt_car + amt_research + amt_job + amt_baby + amt_etc;

        // 1차 TOTAL: STD + ETC
        let totalAmount = amt_std + totalETC;
        totalAmount = ceil100(totalAmount);

        // 연봉 계산
        const totalAmount12 = ceil100(totalAmount * 12);
        const totalAmount13 = ceil100(totalAmount * 13);

        document.getElementById("amt_sum").value = totalAmount;
        document.getElementById("amt_all").value = totalAmount12;
        document.getElementById("amt_plus").value = totalAmount13;

        // BASE, OVERTIME 계산
        const amt_base2 = ceil100(((totalAmount - totalETC) * std_wk_hour) / tot_wk_hour);
        const amt_overtime2 = ceil100(((totalAmount - totalETC) * ot_wk_hour) / tot_wk_hour);

        document.getElementById("amt_base").value = amt_base2;
        document.getElementById("amt_overtime").value = amt_overtime2;

        // 2차 TOTAL: BASE + OVERTIME + ETC
        let totalAmountFinal2 = amt_base2 + amt_overtime2 + totalETC;
        totalAmountFinal2 = ceil100(totalAmountFinal2);

        const totalAmountFinal12 = ceil100(totalAmountFinal2 * 12);
        const totalAmountFinal13 = ceil100(totalAmountFinal2 * 13);

        // 최종 TOTAL 반영
        document.getElementById("amt_sum").value = totalAmountFinal2;
        document.getElementById("amt_all").value = totalAmountFinal12;
        document.getElementById("amt_plus").value = totalAmountFinal13;

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

    // 세부내역 저장
    document.getElementById("save-signatures").addEventListener("click", function (event) {
        event.preventDefault();

        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;

        // 화면에서 읽어도 되는 값들 (문자/날짜)
        const empcode = document.getElementById("emp_code").value;
        const empname = document.getElementById("emp_name").value;
        const empspot = document.getElementById("emp_spot").value;
        const empdept = document.getElementById("emp_dept").value;
        const empaddr = document.getElementById("emp_addr").value;
        const empbirth = document.getElementById("emp_birth").value;
        const empregino = document.getElementById("emp_regi_no").value;
        const empmobile = document.getElementById("emp_mobile").value;
        const jobfromdate = document.getElementById("job_from_date").value;
        const jobtodate = document.getElementById("job_to_date").value;
        const jobtype = document.getElementById("job_type").value;
        const empemail = document.getElementById("emp_email").value;
        const emp_jo = document.getElementById("emp_jo").value;

        const flag = document.getElementById("flag").value;
        const workstartflag = document.getElementById("work_start_flag").value;
        const payflag = document.getElementById("pay_flag").value;

        const contractdate = document.getElementById("contract_date").value;
        const contractyear = document.getElementById("contract_year").value;


        // 숫자값은 화면에서 읽지 않고 realValues 기준으로 저장
        const safe = v => (isNaN(v) || v === undefined || v === null ? 0 : v);

        const std_wk_hour = toNum(document.getElementById("std_wk_hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot_wk_hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot_wk_hour").value);


        const amt_std = toNum(document.getElementById("amt_std").value);
        const amt_base = toNum(document.getElementById("amt_base").value);
        const amt_overtime = toNum(document.getElementById("amt_overtime").value);
        const amt_car = toNum(document.getElementById("amt_car").value);
        const amt_research = toNum(document.getElementById("amt_research").value);
        const amt_job = toNum(document.getElementById("amt_job").value);
        const amt_baby = toNum(document.getElementById("amt_baby").value);
        const amt_etc = toNum(document.getElementById("amt_etc").value);

        const amt_sum = toNum(document.getElementById("amt_sum").value);
        const amt_all = toNum(document.getElementById("amt_all").value);
        const amt_plus = toNum(document.getElementById("amt_plus").value);

        const transaction_flag = "N";

        // 서버로 보낼 데이터
        const contractData = {
            emp_code: empcode,
            emp_name: empname,
            emp_spot: empspot,
            emp_dept: empdept,
            emp_addr: empaddr,
            emp_birth: empbirth,
            emp_regi_no: empregino,
            emp_mobile: empmobile,
            emp_email: empemail,
            emp_jo: emp_jo,
            flag: flag,
            work_start_flag: workstartflag,
            transaction_flag: transaction_flag,
            pay_flag: payflag,
            job_from_date: jobfromdate,
            job_to_date: jobtodate,
            job_type: jobtype,

            std_wk_hour: std_wk_hour,
            ot_wk_hour: ot_wk_hour,
            tot_wk_hour: tot_wk_hour,

            // 숫자값은 realValues 기준
            amt_std: amt_std,
            amt_plus: amt_plus,
            amt_all: amt_all,
            amt_base: amt_base,
            amt_overtime: amt_overtime,
            amt_car: amt_car,
            amt_research: amt_research,
            amt_job: amt_job,
            amt_baby: amt_baby,
            amt_etc: amt_etc,
            amt_sum: amt_sum,

            contract_date: contractdate,
            contract_year: contractyear
        };

        console.log("===== 저장 직전 값 확인 =====");

        console.log("amt_base num:", amt_base);
        console.log("amt_overtime num:", toNum(document.getElementById("amt_overtime").value));
        console.log("amt_sum num:", toNum(amt_sum));

        console.log("contractData:", contractData);

        // 서버 전송
        fetch("/submit_new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contractData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response Data:", data);

                if (data.error) {
                    alert("세부 내역 저장 중 에러가 발생했습니다: " + data.error);
                } else {
                    alert("세부 내역 저장이 완료되었습니다!");

                    backupEmpCode = empcode;
                }
            })
            .catch(error => {
                console.error("세부 내역 저장 중 에러가 발생했습니다:", error);
                alert("세부 내역 저장 중 에러가 발생했습니다.");
            });
    });

    // 현재 연도를 기준으로 ±10년 범위의 연도를 리스트박스에 추가
    const currentYear = new Date().getFullYear();
    const yearSelect1 = document.getElementById("contract_year");
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
        const year = document.getElementById("contract_year").value;
        const employeeCode = document.getElementById("emp_code").value;
        const deptflag = document.getElementById("dept_flag").value;

        //saveSignatures();

        if (deptflag === "1") {
            window.open(`/contract?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        } else {
            window.open(`/contract2?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        }
    }

    // 성명 입력 여부 확인 후 팝업 열기 함수
    function checkAndOpenContractPopup() {
        const employeecode = document.getElementById("emp_code").value;
        console.log("checkAndOpenContractPopup 함수 호출됨"); // 함수 호출 여부 확인을 위한 로그
        if (employeecode) {
            openContractPopup();
        } else {
            alert("데이터를 확인하세요.");
        }
    }

    function handleAllClear() {
        if (!confirm("초기화 하시겠습니까? Y/N")) {
            return;
        }

        // 모든 텍스트 입력, 비밀번호 입력, 숫자 입력, 이메일 초기화
        $("input[type=text], input[type=password], input[type=number], input[type=email]").val("");

        // 체크박스와 라디오 버튼 해제
        $("input[type=checkbox], input[type=radio]").prop("checked", false);

        // select 박스 초기화
        $("select").prop("selectedIndex", 0);

        // textarea 초기화
        $("textarea").val("");

        // datepicker 초기화 후 원하는 기본값 셋팅
        $("#contract_date").datepicker("setDate", new Date());
        $("#job_from_date").datepicker("setDate", new Date());

        const toDate = new Date();
        toDate.setDate(toDate.getDate() + 364);
        $("#job_to_date").datepicker("setDate", toDate);

        // 현재 연도 가져오기
        const currentYear = new Date().getFullYear();

        // contract_year 요소에 값 셋팅
        document.getElementById("contract_year").value = currentYear;
    }

    // 생성 함수(일괄, 조건별)
    function createContract() {
        const contractYear = document.getElementById("contract_year").value;
        const empName = document.getElementById("query_name").value;

        const data = {
            contract_year: contractYear,
            emp_name: empName
        };

        fetch("/new_create_contract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    alert(`Error: ${result.error}`);
                } else if (result.data) {
                    console.log("조회된 데이터:", result.data);

                    // 첫 번째 행 기준으로 화면에 셋팅
                    const row = result.data[0];
                    document.getElementById("pay_flag").value = row.emp_jo;
                    document.getElementById("emp_code").value = row.emp_code;
                    document.getElementById("emp_name").value = row.emp_name;
                    document.getElementById("emp_spot").value = row.emp_spot;
                    document.getElementById("job_type").value = row.emp_dept;
                    document.getElementById("emp_dept").value = row.emp_dept;
                    document.getElementById("emp_mobile").value = row.emp_mobile;
                    document.getElementById("emp_birth").value = row.emp_birth;
                    document.getElementById("emp_regi_no").value = row.emp_regi_no;
                    document.getElementById("emp_addr").value = row.emp_addr;
                    document.getElementById("emp_email").value = row.emp_email;
                    document.getElementById("std_wk_hour").value = row.std_wk_hour;
                    document.getElementById("ot_wk_hour").value = row.ot_wk_hour;
                    document.getElementById("tot_wk_hour").value = row.tot_wk_hour;
                    document.getElementById("flag").value = row.flag;
                    document.getElementById("emp_jo").value = row.emp_jo;
                    document.getElementById("work_start_flag").value = row.work_start_flag;
                    document.getElementById("pay_flag").value = row.pay_flag;
                    $("#job_from_date").datepicker("setDate", row.job_from_date);
                    $("#job_to_date").datepicker("setDate", row.job_to_date);
                } else {
                    alert(result.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while creating the contract.");
            });
    }


    // 각 입력 필드에 이벤트 리스너 추가
    document.getElementById("amt_std").addEventListener("input", calculateTotalAndAnnualSalary);
    //document.getElementById('amt_overtime').addEventListener('input', calculateTotalAndAnnualSalary);
    document.getElementById("amt_car").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt_research").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt_job").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt_baby").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt_etc").addEventListener("input", calculateTotalAndAnnualSalary);

    // 초기화 버튼 이벤트 리스너
    document.getElementById("emp_clear_btn").addEventListener("click", handleAllClear);


    // 버튼 클릭 이벤트 리스너
    document.getElementById("emp_search_btn").addEventListener("click", function () {
        createContract();
    });

    // "연봉근로계약서 보기" 버튼에 이벤트 리스너 추가
    document.getElementById("viewContractButton").addEventListener("click", checkAndOpenContractPopup);
});