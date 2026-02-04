
class Datepicker {
    // Initializes the datepicker cell editor
    init(params) {
        this.params = params;
        this.eInput = document.createElement("input");
        this.eInput.classList.add("datepicker-input");
        this.eInput.value = params.value ? format(new Date(params.value), "yyyy-MM-dd") : "";
        $(this.eInput).datepicker({
            dateFormat: "yy-mm-dd",
            onClose: () => this.params.api.stopEditing()
        });
        this.eInput.focus();
    }

    // Gets the value from the input element
    getValue() {
        return this.eInput.value;
    }

    // Gets the GUI for the editor
    getGui() {
        return this.eInput;
    }

    // After GUI attached to the DOM
    afterGuiAttached() {
        this.eInput.focus();
        this.eInput.select();
    }

    // If cell editor should be used
    isPopup() {
        return false;
    }
}

// ag-Grid 컬럼 정의
const columnDefs = [
    {
        minWidth: 50,
        width: 10,
        headerCheckboxSelection: true,
        checkboxSelection: true
    },
    { headerName: "경조사번호"
        , headerClass: ["centered", "header-custom"]
        , field: "EVENT_CD"
        , editable: false // 비활성
        , width: 200 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "경조사명"
        , headerClass: "centered"
        , field: "EVENT_NM"
        , editable: true
        , width: 220 // 고정 너비
    },
    { headerName: "경조일자"
        , headerClass: "centered"
        , field: "EVENT_YMD"
        , editable: true
        , width: 220 // 고정 너비
    },
    { headerName: "부서"
        , headerClass: "centered"
        , field: "DEPTNAME"
        , editable: true
    },
    { headerName: "직위"
        , headerClass: "centered"
        , field: "UMJPNAME"
        , editable: true
        , cellStyle: { textAlign: "center"} // 가운데 정렬
    },
    { headerName: "사원번호"
        , headerClass: "centered"
        , field: "EMPID"
        , editable: true
        , width: 220 // 고정 너비
        , cellStyle: { textAlign: "center"} // 가운데 정렬
    },
    { headerName: "사원명"
        , headerClass: "centered"
        , field: "EMPNAME"
        , editable: true
        , cellStyle: { textAlign: "center"} // 가운데 정렬
    },
    { headerName: "등록일"
        , headerClass: "centered"
        , field: "REGDATE"
        , editable: false
        , width: 220 // 고정 너비
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "조사시작일"
        , headerClass: "centered"
        , field: "ING_START_YMD"
        , editable: true
        , width: 220 // 고정 너비
    },
    { headerName: "조사종료일"
        , headerClass: "centered"
        , field: "ING_END_YMD"
        , editable: true
        , width: 220 // 고정 너비
    },
    {
        headerName: "상태",
        headerClass: "centered",
        field: "ING_FLAG",
        editable: false,
        cellStyle: params => {
            let color = "black"; // 기본값
            if (params.value === "대기") {
                color = "gray";
            } else if (params.value === "진행중") {
                color = "green";
            } else if (params.value === "종료") {
                color = "red";
            }
            return {
                textAlign: "center",
                backgroundColor: "#f0f0f0",
                color: color,
                fontWeight: "bold"
            };
        }
    }
];

const columnDefs2 = [
    {
        minWidth: 50,
        width: 10,
        headerCheckboxSelection: true,
        checkboxSelection: true
    },
    { headerName: "경조사번호"
        , headerClass: ["centered", "header-custom"]
        , field: "EVENT_CD"
        , editable: false
        , width: 120 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "순번"
        , headerClass: "centered"
        , field: "SEQ"
        , editable: false
        , width: 85 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "사원명"
        , headerClass: ["centered", "header-custom2"]
        , field: "EMPNAME"
        , editable: false
        , width: 100 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "사원번호"
        , headerClass: ["centered", "header-custom2"]
        , field: "EMPID"
        , editable: false
        , width: 110 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "부서"
        , headerClass: ["centered", "header-custom2"]
        , field: "DEPTNAME"
        , editable: false
        , width: 120 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { backgroundColor: "#f0f0f0" }
    },
    { headerName: "공제금액"
        , headerClass: ["centered", "header-custom2"]
        , field: "DEDUCTION_AMT"
        , editable: false
        , width: 120 // 고정 너비
        // 가운데, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "직위"
        , headerClass: "centered"
        , field: "UMJPNAME"
        , editable: false
        , width: 90 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    { headerName: "주민번호"
        , headerClass: "centered"
        , field: "RESIDID"
        , editable: false
        , width: 110 // 고정 너비
        // 가운데 정렬, 색상 회색
        , cellStyle: { textAlign: "center", backgroundColor: "#f0f0f0" }
    },
    {
        headerName: "공제여부",
        field: "DEDUCTION_YN",
        editable: false,
        width: 150,

        // 셀 값이 변경되었을 때 실행 : 공제여부값이 변경될때 update 처리를 하려고 함 .. 미진행 사항임
        // 하기 이벤트가 정상적으로 타고, 업데이트 처리문(exec sp)도 구성해야됨
        onCellValueChanged: params => {
            alert("공제여부가 변경되었습니다");
        },

        // 라디오 버튼 UI 렌더링
        cellRenderer: params => {
            return `
            <label style="color: gray;">
                <input type="radio" name="deduction_${params.node.id}" value="Y" ${params.value === "Y" ? "checked" : ""}>예
            </label>
            <label style="color: gray;">
                <input type="radio" name="deduction_${params.node.id}" value="N" ${params.value === "N" ? "checked" : ""}>아니오
            </label>
        `;
        },

        // 배경을 회색으로 변경
        cellStyle: {
            backgroundColor: "#f0f0f0", // 연한 회색
            color: "gray" // 텍스트 색상도 회색으로 변경
        },

        // 값 가져오기
        valueGetter: params => params.data.DEDUCTION_YN,
        // 값 설정하기
        valueSetter: params => {
            params.data.DEDUCTION_YN = params.newValue;
            return true;
        }
    }
];

// 초기 데이터 설정
const rowData = [];

// 설정 옵션: 중요, 위에 정의한 것들이 여기서 통합됨에 주목
const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    defaultColDef: {
        minWidth: 10,
        resizable: true,
        editable: true,
        headerClass: "centered"
    },
    rowSelection: "multiple",
    editType: "fullRow",
    suppressRowClickSelection: true,
    suppressHorizontalScoll: false,
    enableRangeSelection: true, // 범위 선택 허용
    enableFillHandle: true, // 채우기 핸들 활성화
    suppressCopySingleCellRanges: false, // 단일 셀 범위 복사 허용
    clipboardPasteMode: "range", // 범위 붙여넣기 모드 설정
    onCellClicked: params => {
        console.log("cell was clicked", params);
    },

    //리스트 그리드 클릭 이벤트(더블클릭 : onCellDoubleClicked)
    onCellClicked: function (params) {
        if (params.colDef.field === "EVENT_CD") {
            // alert("Doubleclicked TEST"); // 테스트 메세지박스(임시)
            // params.value 또는 params.data.EVENT_CD로 경조사번호를 가져옵니다.
            const eventCd = params.value;
            if (!eventCd) {
                alert("경조사번호가 없습니다.");
                return;
            }
            //alert("경조사번호: " + eventCd);
            loadGrid2Data(eventCd);
        }
    },

    onCellValueChanged: params => {
        console.log("cell value changed", params);
    },
    onGridReady: function (event) {
        event.api.sizeColumnsToFit();
    },
    onGridSizeChanged: function (event) {
        event.api.sizeColumnsToFit();
    },
    onPasteStart:function (params){
        //console.log('Callback onPasteStart:', params);
    },
    onPasteEnd:function (params){
        //console.log('Callback onPasteEnd:', params);
    },
    processCellFromClipboard:function (params){
        return params.value;
    },
    processCellFromClipboard:function (params){
        return params.value;
    },
    processDataFromClipboard:function (params){
        const data = params.data;
        return data;
    }
};

const gridOptions2 = {
    columnDefs: columnDefs2,
    rowData: rowData,
    defaultColDef: {
        minWidth: 10,
        resizable: true,
        editable: true,
        headerClass: "centered"
    },
    rowSelection: "multiple",
    editType: "fullRow",
    suppressRowClickSelection: true,
    suppressHorizontalScoll: false,
    enableRangeSelection: true, // 범위 선택 허용
    enableFillHandle: true, // 채우기 핸들 활성화
    suppressCopySingleCellRanges: false, // 단일 셀 범위 복사 허용
    clipboardPasteMode: "range", // 범위 붙여넣기 모드 설정
    onCellClicked: params => {
        console.log("cell was clicked", params);
    },
    onCellValueChanged: params => {
        console.log("cell value changed", params);
    },
    onGridReady: function (event) {
        event.api.sizeColumnsToFit();
    },
    onGridSizeChanged: function (event) {
        event.api.sizeColumnsToFit();
    },
    onPasteStart:function (params){
        //console.log('Callback onPasteStart:', params);
    },
    onPasteEnd:function (params){
        //console.log('Callback onPasteEnd:', params);
    },
    processCellFromClipboard:function (params){
        return params.value;
    },
    processCellFromClipboard:function (params){
        return params.value;
    },
    processDataFromClipboard:function (params){
        const data = params.data;
        return data;
    }
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const loadDataButton = document.getElementById("loadDataButton");
    const newdataButton = document.getElementById("newdataButton");
    const saveDataButton = document.getElementById("saveDataButton");
    const deleteRowButton = document.getElementById("deleteRowButton");

    let gridApi;
    const gridDiv = document.querySelector("#myGrid");
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    gridOptions.api = gridApi; // gridOptions.api 설정

    const gridDiv2 = document.querySelector("#myGrid2");
    gridApi2 = agGrid.createGrid(gridDiv2, gridOptions2);
    gridOptions2.api = gridApi2; // gridOptions.api 설정
    //gridOptions.columnApi = gridApi.getColumnApi(); // columnApi 설정

    // 그리드가 초기화될 때 컬럼 정보 출력
    gridOptions.onGridReady = function (params) {
        const allColumns = params.columnApi.getAllColumns();
        allColumns.forEach(column => {
            console.log("Column: ", column.getColDef().headerName);
        });
    };

    // 그리드가 초기화될 때 컬럼 정보 출력
    gridOptions2.onGridReady = function (params) {
        const allColumns = params.columnApi.getAllColumns();
        allColumns.forEach(column => {
            console.log("Column: ", column.getColDef().headerName);
        });
    };

    // 현재 날짜와 해당 월의 1일, 현재일, 마지막날짜를 구하는 함수
    function setDefaultDates() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
        const firstDayOfMonth = `${currentYear}-${currentMonth}-01`;
        const today = currentDate.toISOString().split("T")[0]; // 현재 날짜를 'YYYY-MM-DD' 형식으로 변환
        const lastDay = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
        const lastDayOfMonth = `${currentYear}-${currentMonth}-${lastDay.toString().padStart(2, "0")}`;

        startDate.value = firstDayOfMonth;
        endDate.value = lastDayOfMonth;
    }

    // 좌측 그리드에서 행 변경 시, 우측 그리드 자동 갱신
    gridOptions.api.addEventListener("selectionChanged", function () {
        const selectedRows = gridOptions.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const eventCd = selectedRows[0].EVENT_CD; // 첫 번째 선택된 행의 EVENT_CD 가져오기
            if (!eventCd) {
                //alert("경조사번호가 없습니다.");
                return;
            }
            //alert("경조사번호: " + eventCd);
            loadGrid2Data(eventCd);
        }
    });

    // 기본 날짜 설정
    setDefaultDates();

    // 저장 버튼 이벤트 리스너
    saveDataButton.addEventListener("click", function () {
        // 현재 활성화된 편집 모드를 종료하여 데이터를 저장할 수 있게 함
        gridOptions.api.stopEditing();

        if (confirm("데이터 저장 처리를 하시겠습니까?")) {

            const selectedRows = gridOptions.api.getSelectedRows();
            if (selectedRows.length === 0) {
                alert("선택된 항목이 없습니다.");
                return;
            }
            fetch("/api/salary_deduction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedRows)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert("데이터가 성공적으로 저장되었습니다!");
                        const startDate = document.getElementById("startDate").value;
                        const endDate = document.getElementById("endDate").value;
                        loadData(startDate, endDate);
                        //우측 그리드 초기화 (꼼수)
                        loadGrid2Data("123");
                    } else {
                        alert("데이터 저장에 실패했습니다.");
                        //우측 그리드 초기화 (꼼수)
                        loadGrid2Data("123");
                    }
                })
                .catch(error => {
                    alert("데이터 저장 중 오류가 발생했습니다.");
                    console.error("데이터 저장 중 오류가 발생했습니다.", error);
                    //우측 그리드 초기화 (꼼수)
                    loadGrid2Data("123");
                });
        }
    });

    // 신규(행 추가) 버튼 이벤트 리스너
    newdataButton.addEventListener("click", function () {
        if (confirm("신규 등록을 하시겠습니까?")) {
            console.log("Add row button clicked");
            const newRow = {};
            gridOptions.api.applyTransaction({ add: [newRow], addIndex: 0 });
            //우측 그리드 초기화 (꼼수)
            loadGrid2Data("123");
        }
    });

    // 메일 발송 버튼 이벤트 리스너
    mailButton.addEventListener("click", function () {
        // 우측 그리드(myGrid2)에서 체크된 행들 가져오기
        const selectedRows = gridOptions2.api.getSelectedRows();

        if (selectedRows.length === 0) {
            alert("메일 발송할 데이터를 선택하세요.");
            return;
        }

        // 필요한 데이터(EVENT_CD, EMPID)만 추출하여 배열 생성
        const mailData = selectedRows.map(row => ({
            event_cd: row.EVENT_CD,
            empid: row.EMPID
        }));

        if (confirm("선택된 데이터로 메일을 발송하시겠습니까?")) {
            fetch("/send_mail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ records: mailData })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("메일 발송 요청이 성공적으로 처리되었습니다.");
                    } else {
                        alert("메일 발송 중 오류가 발생했습니다: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("메일 발송 요청 중 오류:", err);
                    alert("메일 발송 요청 중 오류가 발생했습니다.");
                });
        }
    });

    // 삭제 버튼 이벤트 리스너
    deleteButton.addEventListener("click", function () {
    /*
        if (confirm("삭제 처리를 하시겠습니까?")) {
            const selectedRows = gridOptions.api.getSelectedRows();
            if (selectedRows.length < 1) {
                alert('선택된 항목이 없습니다.');
                return;
            }
            gridOptions.api.applyTransaction({ remove: selectedRows });
        }
    */
        // 현재 활성화된 편집 모드를 종료하여 데이터를 저장할 수 있게 함
        gridOptions.api.stopEditing();

        if (confirm("데이터 삭제 처리를 하시겠습니까?")) {

            const selectedRows = gridOptions.api.getSelectedRows();
            if (selectedRows.length === 0) {
                alert("선택된 항목이 없습니다.");
                return;
            }
            fetch("/api/salary_deduction", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedRows)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert("데이터가 성공적으로 삭제되었습니다!");
                        const startDate = document.getElementById("startDate").value;
                        const endDate = document.getElementById("endDate").value;
                        loadData(startDate, endDate);
                        //우측 그리드 초기화 (꼼수)
                        loadGrid2Data("123");
                    } else {
                        alert("데이터 삭제에 실패했습니다.");
                    }
                })
                .catch(error => {
                    alert("데이터 삭제 중 오류가 발생했습니다.");
                    console.error("데이터 삭제 중 오류가 발생했습니다.", error);
                });
        }

    });

    // 조회 버튼 이벤트 리스너
    loadDataButton.addEventListener("click", function () {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (confirm("데이터를 조회하시겠습니까?")) {
            if (startDate && endDate) {
                loadData(startDate, endDate);
                //우측 그리드 초기화 (꼼수)
                loadGrid2Data("123");
            } else {
                alert("시작일자와 종료일자를 입력해 주세요.");
            }
        }
    });

    // 조회 함수
    function loadData(startDate, endDate) {
        fetch(`/api/salary_deduction?startDate=${startDate}&endDate=${endDate}`)
            .then(response => response.json())
            .then(data => {
                gridApi.setGridOption("rowData", data);
            })

            .catch(error => {
                alert("데이터 로드 중 오류가 발생했습니다.");
                console.error("데이터 로드 중 오류가 발생했습니다.", error);
            });
    }

});

// grid2 데이터 로드 함수
function loadGrid2Data(eventcd) {
    fetch("/api/salary_deduction", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ event_cd: eventcd })
    })
    //alert(eventcd)
        .then(response => response.json())
        .then(data => {
            gridApi2.setGridOption("rowData", data);
            //alert(eventcd)
        })

        .catch(error => {
            alert("개인별 급여공제 데이터 로드 중 오류가 발생했습니다.");
            console.error("개인별 급여공제 데이터 로드 중 오류가 발생했습니다.", error);
        });
}