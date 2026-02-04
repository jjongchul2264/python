let backupEmpCode = null;
let isLoading = false;
let isSaved = false;

// 숫자, 날짜, 텍스트 컬럼 컨트롤
document.addEventListener("DOMContentLoaded", function () {
    const dateInputs = document.querySelectorAll(".date-input");
    const textInputs = document.querySelectorAll(".text-input");
    const numberInputs = document.querySelectorAll(".number-input");
    const numberInputs2 = document.querySelectorAll(".number-input2");
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
        "increase-amt",
        //'amt-plus',
        //'amt-all',
        //'amt-sum',
        //'amt-std',
        //'amt-base',
        //'amt-overtime',
        "bf-amt-plus",
        "bf-amt-all",
        "bf-amt-sum",
        "bf-amt-std",
        "bf-amt-base",
        "bf-amt-overtime",
        "bf-amt-car",
        "bf-amt-research",
        "bf-amt-job",
        "bf-amt-baby",
        "bf-amt-etc"

    ].forEach(id => {
        document.getElementById(id).readOnly = true;
    });

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

    numberInputs2.forEach(input => {
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
    const canvas = document.getElementById("signature");
    const signaturePad = new SignaturePad(canvas);

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
        setupDatePicker("#employee-birth");
        setupDatePicker("#job-from-date");
        setupDatePicker("#job-to-date");
        setupDatePicker("#contract-date");
        setupDatePicker("#create-date");

        // create-date 기본값을 오늘 날짜로 설정
        $("#create-date").datepicker("setDate", new Date());
    });


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
        //if (isLoading || isSaved) return;   // 조회 중이거나 저장 후면 계산 금지


        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;
        const ceil100 = v => Math.ceil(v / 100) * 100;

        const std_wk_hour = toNum(document.getElementById("std-wk-hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot-wk-hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot-wk-hour").value);

        const amt_std = ceil100(toNum(document.getElementById("amt-std").value));
        const amt_car = ceil100(toNum(document.getElementById("amt-car").value));
        const amt_research = ceil100(toNum(document.getElementById("amt-research").value));
        const amt_job = ceil100(toNum(document.getElementById("amt-job").value));
        const amt_baby = ceil100(toNum(document.getElementById("amt-baby").value));
        const amt_etc = ceil100(toNum(document.getElementById("amt-etc").value));

        const amt_base = ceil100(toNum(document.getElementById("amt-base").value));
        const amt_overtime = ceil100(toNum(document.getElementById("amt-overtime").value));

        const totalETC = amt_car + amt_research + amt_job + amt_baby + amt_etc;

        // 1차 TOTAL: STD + ETC
        let totalAmount = amt_std + totalETC;
        totalAmount = ceil100(totalAmount);

        // 연봉 계산
        const totalAmount12 = ceil100(totalAmount * 12);
        const totalAmount13 = ceil100(totalAmount * 13);

        document.getElementById("amt-sum").value = totalAmount;
        document.getElementById("amt-all").value = totalAmount12;
        document.getElementById("amt-plus").value = totalAmount13;

        // BASE, OVERTIME 계산
        const amt_base2 = ceil100(((totalAmount - totalETC) * std_wk_hour) / tot_wk_hour);
        const amt_overtime2 = ceil100(((totalAmount - totalETC) * ot_wk_hour) / tot_wk_hour);

        document.getElementById("amt-base").value = amt_base2;
        document.getElementById("amt-overtime").value = amt_overtime2;

        // 2차 TOTAL: BASE + OVERTIME + ETC
        let totalAmountFinal2 = amt_base2 + amt_overtime2 + totalETC;
        totalAmountFinal2 = ceil100(totalAmountFinal2);

        const totalAmountFinal12 = ceil100(totalAmountFinal2 * 12);
        const totalAmountFinal13 = ceil100(totalAmountFinal2 * 13);

        // 최종 TOTAL 반영
        document.getElementById("amt-sum").value = totalAmountFinal2;
        document.getElementById("amt-all").value = totalAmountFinal12;
        document.getElementById("amt-plus").value = totalAmountFinal13;

    }

    function calculateTotalAndAnnualSalary2() {
        if (isLoading || isSaved) {
            return;
        } // 조회 중이거나 저장 후면 계산 금지

        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;
        const ceil100 = v => Math.ceil(v / 100) * 100;

        const std_wk_hour = toNum(document.getElementById("std-wk-hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot-wk-hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot-wk-hour").value);

        const amt_std = ceil100(toNum(document.getElementById("bf-amt-std").value));
        const amt_base = ceil100(toNum(document.getElementById("bf-amt-base").value));
        const amt_overtime = ceil100(toNum(document.getElementById("bf-amt-overtime").value));
        const amt_car = ceil100(toNum(document.getElementById("bf-amt-car").value));
        const amt_research = ceil100(toNum(document.getElementById("bf-amt-research").value));
        const amt_job = ceil100(toNum(document.getElementById("bf-amt-job").value));
        const amt_baby = ceil100(toNum(document.getElementById("bf-amt-baby").value));
        const amt_etc = ceil100(toNum(document.getElementById("bf-amt-etc").value));

        const amt_sum = ceil100(toNum(document.getElementById("bf-amt-sum").value));

        const increase_amt = toNum(document.getElementById("increase-amt").value);


        const totalETC =
            amt_car +
            amt_research +
            amt_job +
            amt_baby +
            amt_etc;

        let totalAmount = amt_sum;

        if (increase_amt > 0) {
            totalAmount += ceil100(increase_amt / 13);
        }

        // SQL CEILING처럼 100원 단위 올림
        totalAmount = ceil100(totalAmount);

        const totalAmount12 = ceil100(totalAmount * 12);
        const totalAmount13 = ceil100(totalAmount * 13);

        document.getElementById("amt-sum").value = toNum(totalAmount);
        document.getElementById("amt-all").value = toNum(totalAmount12);
        document.getElementById("amt-plus").value = toNum(totalAmount13);

        document.getElementById("amt-std").value = ceil100(totalAmount - totalETC);
        document.getElementById("amt-base").value = ceil100(((totalAmount - totalETC) * std_wk_hour) / tot_wk_hour);
        document.getElementById("amt-overtime").value = ceil100(((totalAmount - totalETC) * ot_wk_hour) / tot_wk_hour);
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

    // 세부내역 저장 함수 호출용
    function saveSignatures(event) {
        if (event) {
            event.preventDefault();
        }

        // 배포 여부 확인
        const contractFlag = document.getElementById("contract-flag").checked;

        if (contractFlag) {
            alert("이미 배포된 내역입니다. 저장할 수 없습니다.");
            const empcode = document.getElementById("employee-code").value;

            // 배포가 완료된 경우 사원번호를 백업 변수에 저장
            backupEmpCode = empcode;

            // 조회를 위한 함수 호출
            fetchDataAndSelectRow(backupEmpCode);
            return;
        }

        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;

        // 화면에서 읽어도 되는 값들 (문자/날짜)
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

        const contractdate = document.getElementById("contract-date").value;
        const contractyear = document.getElementById("contract-year").value;

        const contract_flag = "E";

        // 서명 데이터
        const signatureDataURL = signaturePad.toDataURL();

        // 숫자값은 화면에서 읽지 않고 realValues 기준으로 저장
        const safe = v => (isNaN(v) || v === undefined || v === null ? 0 : v);

        const std_wk_hour = toNum(document.getElementById("std-wk-hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot-wk-hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot-wk-hour").value);


        const amt_std = toNum(document.getElementById("amt-std").value);
        const amt_base = toNum(document.getElementById("amt-base").value);
        const amt_overtime = toNum(document.getElementById("amt-overtime").value);
        const amt_car = toNum(document.getElementById("amt-car").value);
        const amt_research = toNum(document.getElementById("amt-research").value);
        const amt_job = toNum(document.getElementById("amt-job").value);
        const amt_baby = toNum(document.getElementById("amt-baby").value);
        const amt_etc = toNum(document.getElementById("amt-etc").value);

        const increase_amt = toNum(document.getElementById("increase-amt").value);

        const amt_sum = toNum(document.getElementById("amt-sum").value);
        const amt_all = toNum(document.getElementById("amt-all").value);
        const amt_plus = toNum(document.getElementById("amt-plus").value);


        // 서버로 보낼 데이터
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
            increase_amt: increase_amt,

            contract_date: contractdate,
            contract_year: contractyear,
            contract_flag: contract_flag
        };

        // 서버 전송
        fetch("/submit", {
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
                    alert("처리 중 에러가 발생했습니다: " + data.error);
                } else {
                //alert('처리가 완료되었습니다!');

                    backupEmpCode = empcode;

                    // 조회를 위한 함수 호출
                    fetchDataAndSelectRow(backupEmpCode);
                }
            })
            .catch(error => {
                console.error("처리 중 에러가 발생했습니다:", error);
                alert("처리 중 에러가 발생했습니다.");
            });
    }

    // 세부내역 저장
    document.getElementById("save-signatures").addEventListener("click", function (event) {
        event.preventDefault();

        // 배포 여부 확인
        const contractFlag = document.getElementById("contract-flag").checked;

        if (contractFlag) {
            alert("이미 배포된 내역입니다. 저장할 수 없습니다.");
            const empcode = document.getElementById("employee-code").value;

            // 배포가 완료된 경우 사원번호를 백업 변수에 저장
            backupEmpCode = empcode;

            // 조회를 위한 함수 호출
            fetchDataAndSelectRow(backupEmpCode);
            return;
        }
        isSaved = true;
        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;

        // 화면에서 읽어도 되는 값들 (문자/날짜)
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

        const contractdate = document.getElementById("contract-date").value;
        const contractyear = document.getElementById("contract-year").value;

        const contract_flag = "E";

        // 서명 데이터
        const signatureDataURL = signaturePad.toDataURL();

        // 숫자값은 화면에서 읽지 않고 realValues 기준으로 저장
        const safe = v => (isNaN(v) || v === undefined || v === null ? 0 : v);

        const std_wk_hour = toNum(document.getElementById("std-wk-hour").value);
        const ot_wk_hour = toNum(document.getElementById("ot-wk-hour").value);
        const tot_wk_hour = toNum(document.getElementById("tot-wk-hour").value);


        const amt_std = toNum(document.getElementById("amt-std").value);
        const amt_base = toNum(document.getElementById("amt-base").value);
        const amt_overtime = toNum(document.getElementById("amt-overtime").value);
        const amt_car = toNum(document.getElementById("amt-car").value);
        const amt_research = toNum(document.getElementById("amt-research").value);
        const amt_job = toNum(document.getElementById("amt-job").value);
        const amt_baby = toNum(document.getElementById("amt-baby").value);
        const amt_etc = toNum(document.getElementById("amt-etc").value);

        const increase_amt = toNum(document.getElementById("increase-amt").value);

        const amt_sum = toNum(document.getElementById("amt-sum").value);
        const amt_all = toNum(document.getElementById("amt-all").value);
        const amt_plus = toNum(document.getElementById("amt-plus").value);


        // 서버로 보낼 데이터
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
            increase_amt: increase_amt,

            contract_date: contractdate,
            contract_year: contractyear,
            contract_flag: contract_flag
        };

        console.log("===== 저장 직전 값 확인 =====");

        console.log("amt_base num:", amt_base);
        console.log("amt_overtime num:", toNum(document.getElementById("amt-overtime").value));
        console.log("amt_sum num:", toNum(amt_sum));

        console.log("contractData:", contractData);

        // 서버 전송
        fetch("/submit", {
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
                    isSaved = false;
                } else {
                    alert("세부 내역 저장이 완료되었습니다!");

                    backupEmpCode = empcode;

                    // 조회를 위한 함수 호출
                    fetchDataAndSelectRow(backupEmpCode);

                    isSaved = false;
                }
            })
            .catch(error => {
                console.error("세부 내역 저장 중 에러가 발생했습니다:", error);
                alert("세부 내역 저장 중 에러가 발생했습니다.");
                isSaved = false;
            });
    });

    // 현재 연도를 기준으로 ±10년 범위의 연도를 리스트박스에 추가
    const currentYear = new Date().getFullYear();
    const yearSelect1 = document.getElementById("query-year");
    const yearSelect2 = document.getElementById("query-year2");
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

        // 두 번째 리스트박스에 옵션 추가
        const option2 = document.createElement("option");
        option2.value = year;
        option2.textContent = year;
        if (year === currentYear) {
            option2.selected = true; // 현재 연도를 기본값으로 설정
        }
        yearSelect2.appendChild(option2);
    }

    // 폼 초기화 및 서명 패드 지우기
    function resetForm() {
        document.getElementById("contract-form").reset();
        //signaturePad.clear();
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

        document.getElementById("increase-amt-manual").value = "";
        // create-date 기본값을 오늘 날짜로 설정
        $("#create-date").datepicker("setDate", new Date());
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

        resetAll();
    });

    // 생성 화면 초기화
    document.getElementById("all-clear2-btn").addEventListener("click", () => {
        // 특정 요소 초기화
        document.getElementById("query-code2").value = ""; // 사번 초기화
        document.getElementById("query-dept2").value = ""; // 부서 초기화
        document.getElementById("query-name2").value = ""; // 성명 초기화
        // 연도 초기화 후 기본값으로 설정
        yearSelect2.value = currentYear;
    });

    // 조회하고 조회 리스트에서 해당 사번 행 선택하는 함수
    function fetchDataAndSelectRow(empCode) {
        // 이미 정의된 조회 이벤트를 호출
        // 조회를 위한 함수 호출
        isLoading = true;
        document.getElementById("view-signatures-btn").click();
        isLoading = false;
    }

    // 데이터 조회
    document.getElementById("view-signatures-btn").addEventListener("click", () => {
        isLoading = true;

        const queryYear = document.getElementById("query-year").value;
        const queryDept = document.getElementById("query-dept").value;
        const queryName = document.getElementById("query-name").value;
        const radioStatus = document.querySelector('input[name="distribution-status"]:checked').value;
        const empStatus = document.querySelector('input[name="empconfirm-status"]:checked').value;
        const manageStatus = document.querySelector('input[name="manageconfirm-status"]:checked').value;
        const empregino = "N";

        if (!queryYear.trim()) {
            alert("연도를 입력해 주세요.");
            return;
        }
        fetch(`/api/get_signatures1?year=${encodeURIComponent(queryYear)}&dept=${encodeURIComponent(queryDept)}&name=${encodeURIComponent(queryName)}&status=${encodeURIComponent(radioStatus)}&empstatus=${encodeURIComponent(empStatus)}&managestatus=${encodeURIComponent(manageStatus)}&empregino=${encodeURIComponent(empregino)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                    isLoading = false;
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
                    const manageConfirmCell = document.createElement("td");
                    const empregino = document.createElement("td");
                    const transflag = document.createElement("td");

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
                    transflag.textContent = signature.trans_flag;

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
                    //signaturePad.clear();
                    //signaturePad.fromDataURL(`data:image/png;base64,${signaturePad.emp_sign}`);

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
                    row.appendChild(transflag);

                    tbody.appendChild(row);

                    // 행 클릭 이벤트 추가
                    row.addEventListener("click", () => {
                        // 모든 행에서 선택 클래스 제거
                        document.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
                        // 클릭한 행에 선택 클래스 추가
                        row.classList.add("selected");

                        const selectedSignature = data.signatures[row.dataset.index];
                        document.getElementById("dept-flag").value = selectedSignature.dept_flag;
                        document.getElementById("work-start-flag").value = selectedSignature.work_start_flag;
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
                        document.getElementById("pay-flag").value = selectedSignature.pay_flag;

                        document.getElementById("std-wk-hour").value = selectedSignature.std_wk_hour;
                        document.getElementById("ot-wk-hour").value = selectedSignature.ot_wk_hour;
                        document.getElementById("tot-wk-hour").value = selectedSignature.tot_wk_hour;

                        document.getElementById("increase-amt").value = formatNumber(selectedSignature.increase_amt);

                        document.getElementById("amt-std").value = formatNumber(selectedSignature.amt_std);
                        document.getElementById("amt-base").value = formatNumber(selectedSignature.amt_base);
                        document.getElementById("amt-overtime").value = formatNumber(selectedSignature.amt_overtime);
                        document.getElementById("amt-car").value = formatNumber(selectedSignature.amt_car);
                        document.getElementById("amt-research").value = formatNumber(selectedSignature.amt_research);
                        document.getElementById("amt-job").value = formatNumber(selectedSignature.amt_job);
                        document.getElementById("amt-baby").value = formatNumber(selectedSignature.amt_baby);
                        document.getElementById("amt-etc").value = formatNumber(selectedSignature.amt_etc);

                        document.getElementById("bf-amt-std").value = formatNumber(selectedSignature.bf_amt_std);
                        document.getElementById("bf-amt-base").value = formatNumber(selectedSignature.bf_amt_base);
                        document.getElementById("bf-amt-overtime").value = formatNumber(selectedSignature.bf_amt_overtime);
                        document.getElementById("bf-amt-car").value = formatNumber(selectedSignature.bf_amt_car);
                        document.getElementById("bf-amt-research").value = formatNumber(selectedSignature.bf_amt_research);
                        document.getElementById("bf-amt-job").value = formatNumber(selectedSignature.bf_amt_job);
                        document.getElementById("bf-amt-baby").value = formatNumber(selectedSignature.bf_amt_baby);
                        document.getElementById("bf-amt-etc").value = formatNumber(selectedSignature.bf_amt_etc);

                        // 합계금액 계산 및 표시
                        const totalAmount = selectedSignature.amt_base + selectedSignature.amt_overtime + selectedSignature.amt_car + selectedSignature.amt_research + selectedSignature.amt_job + selectedSignature.amt_baby + selectedSignature.amt_etc;
                        document.getElementById("amt-sum").value = formatNumber(totalAmount);
                        document.getElementById("amt-all").value = formatNumber(totalAmount * 12);
                        document.getElementById("amt-plus").value = formatNumber(totalAmount * 13);

                        // 합계금액 계산 및 표시2
                        const bftotalAmount = selectedSignature.bf_amt_base + selectedSignature.bf_amt_overtime + selectedSignature.bf_amt_car + selectedSignature.bf_amt_research + selectedSignature.bf_amt_job + selectedSignature.bf_amt_baby + selectedSignature.bf_amt_etc;
                        document.getElementById("bf-amt-sum").value = formatNumber(bftotalAmount);
                        document.getElementById("bf-amt-all").value = formatNumber(bftotalAmount * 12);
                        document.getElementById("bf-amt-plus").value = formatNumber(bftotalAmount * 13);

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

                        // 백업된 사원번호와 일치하는 행을 자동으로 선택
                        if (signature.emp_code === backupEmpCode) {
                            //loadSignatureValues(signature);
                            row.click();
                            isLoading = false;
                        }
                    });
                    // 첫 번째 행 자동 클릭
                    if (index === 0) {
                        //loadSignatureValues(signature);
                        row.click();
                        isLoading = false;
                    }
                });
            })
            .catch(error => {
                console.error("저장된 내역 조회 중 에러가 발생했습니다:", error);
                alert("저장된 내역 조회 중 에러가 발생했습니다. 자세한 오류: " + error.message);
                isLoading = false;
            });

    });

    // 팝업 열기 함수 (연봉계약서 보기)
    function openContractPopup() {
        const year = document.getElementById("contract-year").value;
        const employeeCode = document.getElementById("employee-code").value;
        const deptflag = document.getElementById("dept-flag").value;

        //saveSignatures();

        if (deptflag === "1") {
            window.open(`/contract?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        } else {
            window.open(`/contract2?code=${employeeCode}&year=${year}`, "contractPopup", "width=794,height=1123");
        }
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


    // 수동 증가 처리
    function handleManualIncrease() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');


        if (selectedRows.length === 0) {
            alert("수동 증가 처리할 항목을 선택해 주세요.");
            return;
        }

        // 수동 증가 처리 확인 메시지 박스
        if (!confirm("수동 증가 처리 하시겠습니까? Y/N")) {
            return;
        }

        const toNum = v => Number(String(v).replace(/,/g, "").trim()) || 0;
        const increase_amt_manual = toNum(document.getElementById("increase-amt-manual").value);

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
                    contract_flag: "E",
                    increase_amt_manual: increase_amt_manual
                });
            }
        });

        // 이미 배포된 항목이 있는 경우 알림
        if (alreadyDistributedSeqs.length > 0) {
            alert(`다음 항목들이 이미 배포되어있어 처리가 중단됩니다.: ${alreadyDistributedSeqs.join(", ")} 번행`);
            return;
        }

        // 서버로 데이터 전송
        fetch("/salary_increase", {
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
                        console.error(`수동 증가 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건이 수동 증가 완료 되었습니다.`);
                    document.getElementById("increase-amt-manual").value = "";
                    // create-date 기본값을 오늘 날짜로 설정
                    $("#create-date").datepicker("setDate", new Date());
                } else {
                    alert("수동 증가 처리 중 에러가 발생했습니다.");
                }

                // 수동 증가 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("수동 증가 처리 중 에러가 발생했습니다:", error);
                alert("수동 증가 처리 중 에러가 발생했습니다.");
            });
    }

    // 호봉증가처리
    function handleSalaryIncrease() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("호봉 증가 처리할 항목을 선택해 주세요.");
            return;
        }

        // 호봉 증가 처리 확인 메시지 박스
        if (!confirm("호봉 증가 처리 하시겠습니까? Y/N")) {
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
                    contract_flag: "H",
                    increase_amt_manual: 0
                });
            }
        });

        // 이미 배포된 항목이 있는 경우 알림
        if (alreadyDistributedSeqs.length > 0) {
            alert(`다음 항목들이 이미 배포되어있어 처리가 중단됩니다.: ${alreadyDistributedSeqs.join(", ")} 번행`);
            return;
        }

        // 서버로 데이터 전송
        fetch("/salary_increase", {
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
                        console.error(`호봉 증가 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건이 호봉 증가 완료 되었습니다.`);
                    document.getElementById("increase-amt-manual").value = "";
                    // create-date 기본값을 오늘 날짜로 설정
                    $("#create-date").datepicker("setDate", new Date());
                } else {
                    alert("호봉 증가 처리 중 에러가 발생했습니다.");
                }

                // 호봉 증가 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("호봉 증가 처리 중 에러가 발생했습니다:", error);
                alert("호봉 증가 처리 중 에러가 발생했습니다.");
            });
    }

    // 진급처리
    function handlePromotion() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("진급 처리할 항목을 선택해 주세요.");
            return;
        }

        // 진급 처리 확인 메시지 박스
        if (!confirm("진급 처리 하시겠습니까? Y/N")) {
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
                    contract_flag: "J",
                    increase_amt_manual: 0
                });
            }
        });

        // 이미 배포된 항목이 있는 경우 알림
        if (alreadyDistributedSeqs.length > 0) {
            alert(`다음 항목들이 이미 배포되어있어 처리가 중단됩니다.: ${alreadyDistributedSeqs.join(", ")} 번행`);
            return;
        }

        // 서버로 데이터 전송
        fetch("/salary_increase", {
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
                        console.error(`진급 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건이 진급 처리 완료 되었습니다.`);
                    document.getElementById("increase-amt-manual").value = "";
                    // create-date 기본값을 오늘 날짜로 설정
                    $("#create-date").datepicker("setDate", new Date());
                } else {
                    alert("진급 처리 중 에러가 발생했습니다.");
                }

                // 배포가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("진급 처리 중 에러가 발생했습니다:", error);
                alert("진급 처리 중 에러가 발생했습니다.");
            });
    }

    // 작성일자 일괄 변경 처리 함수
    function handleCreateDateUpdate() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');
        const createdate = document.getElementById("create-date").value;

        if (selectedRows.length === 0) {
            alert("작성일자 변경 처리할 항목을 선택해 주세요.");
            return;
        }

        // 작성일자 변경 처리 확인 메시지 박스
        if (!confirm("작성일자 변경 처리 하시겠습니까? Y/N")) {
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
                    create_date: createdate
                });
            }
        });

        // 이미 배포된 항목이 있는 경우 알림
        if (alreadyDistributedSeqs.length > 0) {
            alert(`다음 항목들이 이미 배포되어있어 처리가 중단됩니다.: ${alreadyDistributedSeqs.join(", ")} 번행`);
            return;
        }


        // 서버로 데이터 전송 (관리자 확정 처리)
        fetch("/update_date", {
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
                        console.error(`작성일자 변경 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 작성일자 변경 처리가 완료되었습니다.`);
                } else {
                    alert("작성일자 변경 처리 중 에러가 발생했습니다.");
                }

                // 작성일자 변경 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("작성일자 변경 처리 중 에러가 발생했습니다:", error);
                alert("작성일자 변경 처리 중 에러가 발생했습니다.1");
            });
    };


    // 배포 처리 함수
    function handleDistribution() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("배포할 항목을 선택해 주세요.");
            return;
        }

        // 배포 처리 확인 메시지 박스
        if (!confirm("배포 처리 하시겠습니까? Y/N")) {
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
                        console.error(`배포 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건이 배포 완료 되었습니다.`);
                } else {
                    alert("배포 처리 중 에러가 발생했습니다.");
                }

                // 배포가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("배포 처리 중 에러가 발생했습니다:", error);
                alert("배포 처리 중 에러가 발생했습니다.1");
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

        // 배포 취소 확인 메시지 박스
        if (!confirm("배포 취소 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 취소 로직 실행 중단
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
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    contract_flag: "N"
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
                        console.error(`배포 취소 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 배포 취소 처리가 완료되었습니다.`);
                } else {
                    alert("배포 취소 처리 중 에러가 발생했습니다.");
                }

                // 배포 취소가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("배포 취소 처리 중 에러가 발생했습니다:", error);
                alert("배포 취소 처리 중 에러가 발생했습니다.");
            });
    }

    // 사용자 확정 처리 함수
    function handleEmpConfirm() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("사용자 확정 처리할 항목을 선택해 주세요.");
            return;
        }

        // 사용자 확정 처리 확인 메시지 박스
        if (!confirm("사용자 확정 처리 하시겠습니까? Y/N")) {
            return;
        }

        // 사용자 확정된 항목 검사
        const alreadyDistributedSeq = [];
        const alreadyEmpConfirmSeqs = [];
        const alreadyAdminConfirmSeqs = [];
        const empCodes = [];
        selectedRows.forEach(row => {
            const distributionStatusCheckbox = row.closest("tr").querySelector('td:nth-child(8) input[type="checkbox"]'); //배포
            const distributionStatus = distributionStatusCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

            const empconfirmCheckbox = row.closest("tr").querySelector('td:nth-child(9) input[type="checkbox"]');
            const empconfirmStatus = empconfirmCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

            const adminconfirmCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]');
            const adminconfirmStatus = adminconfirmCheckbox.checked ? "Y" : "N"; // 체크 여부에 따라 값 설정

            if (distributionStatus === "N") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                alreadyDistributedSeq.push(seq);
            } else if (empconfirmStatus === "Y") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                alreadyEmpConfirmSeqs.push(seq);
            } else if (adminconfirmStatus === "Y") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                alreadyAdminConfirmSeqs.push(seq);
            } else {
                empCodes.push({
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    emp_confirm: "Y"
                });
            }
        });

        // 배포 안된 경우 알림
        if (alreadyDistributedSeq.length > 0) {
            alert(`배포 안된 항목이 있어 처리가 중단됩니다.: ${alreadyDistributedSeq.join(", ")} 번행`);
            return;
        }

        // 사용자 확정이 된 경우 알림
        if (alreadyEmpConfirmSeqs.length > 0) {
            alert(`사용자 확정 처리된 항목이 있어 처리가 중단됩니다.: ${alreadyEmpConfirmSeqs.join(", ")} 번행`);
            return;
        }

        // 관리자 확정이 된 경우 알림
        if (alreadyAdminConfirmSeqs.length > 0) {
            alert(`관리자 확정 처리된 항목이 있어 처리가 중단됩니다.: ${alreadyAdminConfirmSeqs.join(", ")} 번행`);
            return;
        }

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 팝업으로 데이터 확인
        //alert(JSON.stringify(empCodes, null, 2));

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

                // 사용자 관리자 확정 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
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

        if (selectedRows.length === 0) {
            alert("사용자 확정 취소할 항목을 선택해 주세요.");
            return;
        }

        // 사용자 확정 취소 확인 메시지 박스
        if (!confirm("사용자 확정 취소 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 취소 로직 실행 중단
        }

        // 이미 확정된 항목 검사 및 배포 여부 확인
        const notConfirmedSeqs = [];
        const AdminConfirmedSeqs = [];
        const empCodes = [];
        selectedRows.forEach(row => {
            const empConfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(9) input[type="checkbox"]'); // 사용자 확정 상태 체크박스
            const empConfirmStatus = empConfirmStatusCheckbox.checked ? "Y" : "N";

            const AdminConfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]'); // 관리자 확정 상태 체크박스
            const AdminConfirmStatus = AdminConfirmStatusCheckbox.checked ? "Y" : "N";

            if (empConfirmStatus === "N") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                notConfirmedSeqs.push(seq);
            } else if (AdminConfirmStatus === "Y") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                AdminConfirmedSeqs.push(seq);
            } else {
                empCodes.push({
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    emp_confirm: "N"
                });
            }
        });

        // 사용자 확정이 된 항목이 있는 경우 알림
        if (AdminConfirmedSeqs.length > 0) {
            alert(`사용자 확정 상태로 배포 취소가 불가합니다: ${AdminConfirmedSeqs.join(", ")} 번행`);
            return;
        }

        // 확정되지 않은 항목이 있는 경우 알림
        if (notConfirmedSeqs.length > 0) {
            alert(`다음 항목들은 확정되지 않아 취소할 수 없습니다: ${notConfirmedSeqs.join(", ")} 번행`);
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
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("사용자 확정 취소 처리 중 에러가 발생했습니다:", error);
                alert("사용자 확정 취소 처리 중 에러가 발생했습니다.");
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

        // 관리자 확정 처리 확인 메시지 박스
        if (!confirm("관리자 확정 처리 하시겠습니까? Y/N")) {
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
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    admin_confirm: "Y"
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

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송 (관리자 확정 처리)
        fetch("/submit4", {
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
                        console.error(`관리자 확정 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 관리자 확정 처리가 완료되었습니다.`);
                } else {
                    alert("관리자 확정 처리 중 에러가 발생했습니다.");
                }

                // 관리자 확정 처리가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("관리자 확정 처리 중 에러가 발생했습니다:", error);
                alert("관리자 확정 처리 중 에러가 발생했습니다.1");
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

        // 관리자 확정 취소 확인 메시지 박스
        if (!confirm("관리자 확정 취소 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 취소 로직 실행 중단
        }

        // 이미 확정된 항목 검사 및 배포 여부 확인
        const notConfirmedSeqs = [];
        const empCodes = [];
        selectedRows.forEach(row => {
            const AdminConfirmStatusCheckbox = row.closest("tr").querySelector('td:nth-child(10) input[type="checkbox"]'); // 관리자 확정 상태 체크박스

            const AdminConfirmStatus = AdminConfirmStatusCheckbox.checked ? "Y" : "N";

            if (AdminConfirmStatus === "N") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)
                notConfirmedSeqs.push(seq);
            } else {
                empCodes.push({
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    admin_confirm: "N"
                });
            }
        });

        // 확정되지 않은 항목이 있는 경우 알림
        if (notConfirmedSeqs.length > 0) {
            alert(`다음 항목들은 확정되지 않아 취소할 수 없습니다: ${notConfirmedSeqs.join(", ")} 번행`);
            return;
        }

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송
        fetch("/submit4", {
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
                        console.error(`관리자 확정 취소 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 관리자 확정 취소 처리가 완료되었습니다.`);
                } else {
                    alert("관리자 확정 취소 처리 중 에러가 발생했습니다.");
                }

                // 관리자 확정 취소가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("관리자 확정 취소 처리 중 에러가 발생했습니다:", error);
                alert("관리자 확정 취소 처리 중 에러가 발생했습니다.");
            });
    }

    // 전체 취소 처리 함수
    function handleAllCancel() {
        // 선택된 항목 확인
        const selectedRows = document.querySelectorAll('input[type="checkbox"].select-row:checked');

        if (selectedRows.length === 0) {
            alert("전체 취소할 항목을 선택해 주세요.");
            return;
        }

        // 전체 취소 확인 메시지 박스
        if (!confirm("전체 취소 하시겠습니까? Y/N")) {
            return; // 'No' 선택 시 취소 로직 실행 중단
        }

        const empCodes = [];
        selectedRows.forEach(row => {
            const selectCheckbox = row.closest("tr").querySelector('td:nth-child(1) input[type="checkbox"]');
            const selectStatus = selectCheckbox.checked ? "Y" : "N";

            if (selectStatus === "N") {
                const seq = row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(); // 순번 열 값 (2번째 열)

            } else {
                empCodes.push({
                    emp_code: row.closest("tr").querySelector("td:nth-child(6)").textContent.trim(), // 사번 열의 값을 가져옴 (6번째 열)
                    seq: row.closest("tr").querySelector("td:nth-child(2)").textContent.trim(), // 순번 열 값 (2번째 열)
                    contract_year: row.closest("tr").querySelector("td:nth-child(3)").textContent.trim(), // 연도 열 값 (3번째 열)
                    cancel_flag: "N"
                });
            }
        });

        console.log("Sending data to server:", empCodes); // 디버깅용 콘솔 로그

        // 서버로 데이터 전송
        fetch("/allCancel", {
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
                        console.error(`전체 취소 처리 중 에러가 발생했습니다 (순번 ${result.seq}): ` + result.error);
                    } else {
                        processedCount++;
                    }
                });

                // 모든 항목이 처리된 후 메시지 표시
                if (processedCount > 0) {
                    alert(`${processedCount}건의 전체 취소 처리가 완료되었습니다.`);
                } else {
                    alert("전체 취소 처리 중 에러가 발생했습니다.");
                }

                // 전체 취소가 완료된 경우 조회를 위한 함수 호출
                const empCodesList = empCodes.map(emp => emp.emp_code);
                fetchDataAndSelectRow(empCodesList);
            })
            .catch(error => {
                console.error("전체 취소 처리 중 에러가 발생했습니다:", error);
                alert("전체 취소 처리 중 에러가 발생했습니다.");
            });
    }

    // 생성 함수(일괄, 조건별)
    function createContract(contractFlag) {
        const contractYear = document.getElementById("query-year2").value;
        const empName = document.getElementById("query-name2").value;
        const deptName = document.getElementById("query-dept2").value;

        const data = {
            contract_flag: contractFlag,
            contract_year: contractYear,
            emp_name: empName,
            dept_name: deptName
        };

        fetch("/create_contract", {
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
                } else {
                    alert(result.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while creating the contract.");
            });
    }

    //호봉증가, 진급처리, 수동증가 버튼 이벤트 리스너
    document.getElementById("emp-SalaryIncrease-btn").addEventListener("click", handleSalaryIncrease);
    document.getElementById("emp-promotion-btn").addEventListener("click", handlePromotion);
    document.getElementById("increase-amt-manual-btn").addEventListener("click", handleManualIncrease);

    // 전체 취소 버튼 이벤트 리스너
    document.getElementById("all-cancel-btn").addEventListener("click", handleAllCancel);

    // 배포 버튼 클릭 이벤트 리스너
    document.getElementById("contract-distribution-btn").addEventListener("click", handleDistribution);
    document.getElementById("distribution-cancel-btn").addEventListener("click", handleDistributionCancel);

    // 사용자 확인 버튼 클릭 이벤트 리스너
    document.getElementById("emp-confirm-btn").addEventListener("click", handleEmpConfirm);
    document.getElementById("emp-cancel-btn").addEventListener("click", handleEmpConfirmCancel);

    // 관리자 확인 버튼 클릭 이벤트 리스너
    document.getElementById("admin-confirm-btn").addEventListener("click", handleAdminConfirm);
    document.getElementById("admin-cancel-btn").addEventListener("click", handleAdminConfirmCancel);

    // 작성일자 일괄 변경 버튼 클릭 이벤트 리스너
    document.getElementById("create-date-update-btn").addEventListener("click", handleCreateDateUpdate);

    // 일괄 생성 버튼 클릭 이벤트 리스너
    document.getElementById("all-create-btn").addEventListener("click", function () {
        createContract("0");
    });

    // 조건별 생성 버튼 클릭 이벤트 리스너
    document.getElementById("div-create-btn").addEventListener("click", function () {
        createContract("1");
    });

    // 각 입력 필드에 이벤트 리스너 추가
    //document.getElementById('amt-base').addEventListener('input', calculateTotalAndAnnualSalary);
    //document.getElementById('amt-overtime').addEventListener('input', calculateTotalAndAnnualSalary);
    document.getElementById("amt-car").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-research").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-job").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-baby").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-etc").addEventListener("input", calculateTotalAndAnnualSalary);
    document.getElementById("amt-std").addEventListener("input", calculateTotalAndAnnualSalary);

    //증가액 입력 필드에 이벤트 리스너 추가
    //document.getElementById('increase-amt').addEventListener('input', calculateTotalAndAnnualSalary2);

    // "연봉근로계약서 보기" 버튼에 이벤트 리스너 추가
    document.getElementById("viewContractButton").addEventListener("click", checkAndOpenContractPopup);

});