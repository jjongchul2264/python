
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
    { headerName: "ERP 등록 여부"
        , headerClass: ["centered", "header-custom"]
        , field: "ErpRegist"
        , editable: true
    },
    { headerName: "날짜"
        , headerClass: "centered"
        , field: "PoDate"
        , editable: true
    },

    { headerName: "No."
        , headerClass: "centered"
        , field: "PONo"
        , editable: false
    },
    { headerName: "약칭"
        , headerClass: "centered"
        , field: "ProjectAcronyms"
        , editable: true
    },
    { headerName: "사업명"
        , headerClass: "centered"
        , field: "ProjectName"
        , editable: true
    },
    { headerName: "장비명"
        , headerClass: "centered"
        , field: "EquipName"
        , editable: true
    },
    { headerName: "개발R 양산M"
        , headerClass: "centered"
        , field: "ProejctType"
        , editable: true
    },
    { headerName: "금액(USD)"
        , headerClass: "centered"
        , field: "AmountUSD"
        , editable: true
        , cellClass: "right-aligned"
        , valueFormatter: params => {
            if (params.value != null) {
                return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return params.value;
        }
    },
    { headerName: "환율"
        , headerClass: "centered"
        , field: "ExchangeRate"
        , editable: true
        , cellClass: "right-aligned"
        , valueFormatter: params => {
            if (params.value != null) {
                return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return params.value;
        }
    },
    { headerName: "금액(KRW)"
        , headerClass: "centered"
        , field: "AmountKRW"
        , editable: true
        , cellClass: "right-aligned"
        , valueFormatter: params => {
            if (params.value != null) {
                return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return params.value;
        }
    },
    { headerName: "발주업체"
        , headerClass: "centered"
        , field: "OrderCompany"
        , editable: true
    },
    { headerName: "구매담당자"
        , headerClass: "centered"
        , field: "POEmp"
        , editable: true
    },
    { headerName: "요청자"
        , headerClass: "centered"
        , field: "ReqEmp"
        , editable: true
    },
    { headerName: "납품예정일"
        , headerClass: "centered"
        , field: "EDeliveryDate"
        , editable: true
    },
    { headerName: "납품일"
        , headerClass: ["centered", "header-custom"]
        , field: "DeliveryDate"
        , editable: true
    },
    { headerName: "COC(검사성적서)"
        , headerClass: "centered"
        , field: "COC"
        , editable: true
    },
    { headerName: "비고"
        , headerClass: "centered"
        , field: "Remark"
        , editable: true
    },
    { headerName: "생성일시"
        , headerClass: "centered"
        , field: "CreateDate"
        , editable: false
    },
    { headerName: "변경일시"
        , headerClass: "centered"
        , field: "UpdateDate"
        , editable: false
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

    const resetGridButton = document.getElementById("resetGridButton");
    const addRowButton = document.getElementById("addRowButton");
    const saveDataButton = document.getElementById("saveDataButton");
    const deleteRowButton = document.getElementById("deleteRowButton");
    const loadDataButton = document.getElementById("loadDataButton");

    if (!addRowButton || !saveDataButton || !deleteRowButton || !loadDataButton || !resetGridButton) {
        alert("버튼 요소를 찾을 수 없습니다. ID를 확인하세요.");
        console.error("버튼 요소를 찾을 수 없습니다.");
        return;
    }

    let gridApi;
    const gridDiv = document.querySelector("#myGrid");
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    gridOptions.api = gridApi; // gridOptions.api 설정
    //gridOptions.columnApi = gridApi.getColumnApi(); // columnApi 설정

    // 그리드가 초기화될 때 컬럼 정보 출력
    gridOptions.onGridReady = function (params) {
        const allColumns = params.columnApi.getAllColumns();
        allColumns.forEach(column => {
            console.log("Column: ", column.getColDef().headerName);
        });
    };

    // 현재 날짜와 해당 월의 1일을 구하는 함수
    function setDefaultDates() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
        const firstDayOfMonth = `${currentYear}-${currentMonth}-01`;
        const today = currentDate.toISOString().split("T")[0]; // 현재 날짜를 'YYYY-MM-DD' 형식으로 변환

        startDate.value = firstDayOfMonth;
        endDate.value = today;
    }

    // 기본 날짜 설정
    setDefaultDates();


    // 전체 행 삭제 버튼 이벤트 리스너
    resetGridButton.addEventListener("click", function () {
        if (confirm("그리드를 초기화 하시겠습니까?")) {
            const rowData = [];
            gridOptions.api.forEachNode(function (node) {
                rowData.push(node.data);
            });
            gridOptions.api.applyTransaction({ remove: rowData });
        }
    });

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
            fetch("/api/polist", {
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
                        const projectName = document.getElementById("projectName").value;
                        const poEmp = document.getElementById("poEmp").value;
                        const reqEmp = document.getElementById("reqEmp").value;
                        const erpRegist = document.querySelector('input[name="erpRegist"]:checked').value;

                        loadData(startDate, endDate, projectName, poEmp, reqEmp, erpRegist);
                    } else {
                        alert("데이터 저장에 실패했습니다.");
                    }
                })
                .catch(error => {
                    alert("데이터 저장 중 오류가 발생했습니다.");
                    console.error("데이터 저장 중 오류가 발생했습니다.", error);
                });
        }
    });

    // 행 추가 버튼 이벤트 리스너
    addRowButton.addEventListener("click", function () {
        if (confirm("행 추가 처리를 하시겠습니까?")) {
            console.log("Add row button clicked");
            const newRow = {};
            gridOptions.api.applyTransaction({ add: [newRow], addIndex: 0 });
        }
    });

    /*
    // 행 추가 버튼 이벤트 리스너
    addRowButton.addEventListener("click", function() {
        if (confirm("행 추가 처리를 하시겠습니까?")) {
            const newRow = {
                ErpRegist: '',
                PoDate: '',
                PONo: '',
                ProjectAcronyms: '',
                ProjectName: '',
                EquipName: '',
                ProejctType: '',
                AmountUSD: 0,
                ExchangeRate: 0,
                AmountKRW: 0,
                OrderCompany: '',
                POEmp: '',
                ReqEmp: '',
                EDeliveryDate: '',
                DeliveryDate: '',
                COC: '',
                Remark: ''
            };
            const res = gridOptions.api.applyTransaction({ add: [newRow], addIndex: 0 });
            if (res.add.length > 0) {
                const addedRowIndex = res.add[0].rowIndex;
                gridOptions.api.startEditingCell({
                    rowIndex: addedRowIndex,
                    colKey: 'ErpRegist'
                });
            }
        }
    });
    */


    // 행 삭제 버튼 이벤트 리스너
    deleteRowButton.addEventListener("click", function () {
        return;
        /*if (confirm("행 삭제 처리를 하시겠습니까?")) {
            const selectedRows = gridOptions.api.getSelectedRows();
            if (selectedRows.length < 1) {
                alert('선택된 항목이 없습니다.');
                return;
            }
            gridOptions.api.applyTransaction({ remove: selectedRows });
        }*/
    });

    // 조회 버튼 이벤트 리스너
    loadDataButton.addEventListener("click", function () {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const projectName = document.getElementById("projectName").value;
        const poEmp = document.getElementById("poEmp").value;
        const reqEmp = document.getElementById("reqEmp").value;
        const erpRegist = document.querySelector('input[name="erpRegist"]:checked').value;

        if (confirm("데이터를 조회하시겠습니까?")) {
            if (startDate && endDate) {
                loadData(startDate, endDate, projectName, poEmp, reqEmp, erpRegist);
            } else {
                alert("시작일자와 종료일자를 입력해 주세요.");
            }
        }
    });

    // 조회 함수
    function loadData(startDate, endDate, projectName, poEmp, reqEmp, erpRegist) {
        fetch(`/api/polist?startDate=${startDate}&endDate=${endDate}&projectName=${projectName}&poEmp=${poEmp}&reqEmp=${reqEmp}&erpRegist=${erpRegist}`)
            .then(response => response.json())
            .then(data => {
                gridApi.setGridOption("rowData", data);
                // 15초마다 데이터 조회 함수 실행
                setInterval(checkForUpdates, 15000);
            })
            .catch(error => {
                alert("데이터 로드 중 오류가 발생했습니다.");
                console.error("데이터 로드 중 오류가 발생했습니다.", error);
            });
    }

    // 데이터 비교 함수
    function compareData(gridData, serverData) {
        return JSON.stringify(gridData) !== JSON.stringify(serverData);
    }

    // 데이터 주기적 조회 함수
    function checkForUpdates() {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const projectName = document.getElementById("projectName").value;
        const poEmp = document.getElementById("poEmp").value;
        const reqEmp = document.getElementById("reqEmp").value;
        const erpRegist = document.querySelector('input[name="erpRegist"]:checked').value;

        fetch(`/api/polist?startDate=${startDate}&endDate=${endDate}&projectName=${projectName}&poEmp=${poEmp}&reqEmp=${reqEmp}&erpRegist=${erpRegist}`)
            .then(response => response.json())
            .then(serverData => {
                const gridData = [];
                gridOptions.api.forEachNode(function (node) {
                    gridData.push(node.data);
                });

                if (compareData(gridData, serverData)) {
                    if (confirm("업데이트 내역이 있습니다. 다시 조회 후 진행하시겠습니까?")) {
                        console.log("Load data button clicked");
                        gridOptions.api.setRowData(serverData);
                    }
                } else {
                    console.log("업데이트가 없습니다.");
                }
            })
            .catch(error => {
                console.error("데이터 조회 중 오류가 발생했습니다.", error);
            });
    }
});
