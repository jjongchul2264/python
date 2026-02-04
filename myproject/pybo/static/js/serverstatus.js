google.charts.load("current", {"packages":["corechart"]});
google.charts.setOnLoadCallback(initialize);

const cpuCharts = [];
const memoryCharts = [];
let currentServerStatuses = []; // 최신 서버 상태를 저장하는 배열

function initialize() {
    drawCharts();
    startAutoRefresh();
}

function fetchData() {
    console.log("Fetching server stats..."); // 요청 시작 로그 추가

    // AJAX 요청을 사용하여 서버 상태 데이터를 가져옵니다
    fetch("/serverstatus?format=json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data); // 로그 추가
            currentServerStatuses = data; // 최신 서버 상태 저장
            updateCharts(data);
        })
        .catch(error => console.error("Error fetching server status data:", error));
}

function drawCharts() {
    const serverStatuses = JSON.parse(document.getElementById("server-statuses").textContent); // 서버 상태 데이터 가져오기
    currentServerStatuses = serverStatuses; // 최신 서버 상태 저장
    serverStatuses.forEach(function (server, index) {
        // CPU 사용량 데이터에서 숫자만 추출
        const cpuUsage = parseFloat(server.cpu_usage.match(/\d+/)[0]);

        const cpuData = google.visualization.arrayToDataTable([
            ["서버", "CPU 사용량"],
            ["남은 CPU", 100 - cpuUsage],
            ["사용량", cpuUsage]
        ]);

        const cpuOptions = {
            title: "CPU",
            pieHole: 0.4,
            legend: "none", // 레전드 숨기기
            slices: {
                0: { color: "#3366cc" }, // 남은 CPU 색상 (파란색)
                1: { color: "#e0440e" } // 사용량 색상 (빨간색)
            },
            backgroundColor: "white", // 차트 배경색 설정
            chartArea: {
                backgroundColor: "white"
            }
        };

        const cpuChart = new google.visualization.PieChart(document.getElementById("cpuchart-" + index));
        cpuChart.draw(cpuData, cpuOptions);
        cpuCharts[index] = { chart: cpuChart, data: cpuData, options: cpuOptions };

        // 메모리 사용량 데이터에서 숫자만 추출
        const memoryUsage = parseFloat(server.memory_usage.match(/\d+/)[0]);
        const memoryData = google.visualization.arrayToDataTable([
            ["서버", "메모리 사용량"],
            ["남은 메모리", 100 - memoryUsage],
            ["사용량", memoryUsage]
        ]);

        const memoryOptions = {
            title: "Memory",
            pieHole: 0.4,
            legend: "none", // 레전드 숨기기
            slices: {
                0: { color: "#3366cc" }, // 남은 메모리 색상 (파란색)
                1: { color: "#e0440e" } // 사용량 색상 (빨간색)
            },
            backgroundColor: "white", // 차트 배경색 설정
            chartArea: {
                backgroundColor: "white"
            }
        };

        const memoryChart = new google.visualization.PieChart(document.getElementById("memorychart-" + index));
        memoryChart.draw(memoryData, memoryOptions);
        memoryCharts[index] = { chart: memoryChart, data: memoryData, options: memoryOptions };

        const usedPercentage = memoryUsage;

        // 메모리 사용량에 따라 배경 깜빡이기 및 팝업 표시
        const chartGroupContainer = document.getElementById("chart-group-" + index);
        const memoryContainer = document.getElementById("memorychart-" + index);

        if (usedPercentage > 70) {
            chartGroupContainer.classList.add("blinking-background-red");
            chartGroupContainer.classList.remove("blinking-background-yellow");
        } else if (usedPercentage > 50) {
            chartGroupContainer.classList.add("blinking-background-yellow");
            memoryContainer.classList.add("blinking-background-yellow");
            chartGroupContainer.classList.remove("blinking-background-red");
            memoryContainer.classList.remove("blinking-background-red");
        } else {
            chartGroupContainer.classList.remove("blinking-background-yellow", "blinking-background-red");
        }

        // 차트 그룹 더블클릭 이벤트 추가
        document.getElementById("chart-group-" + index).addEventListener("dblclick", function (event) {
            showDetails(index, chartGroupContainer); // 인덱스를 기반으로 호출하고 클릭한 차트 그룹 컨테이너를 전달
        });
    });

    adjustParentIframeHeight(); // 초기화 후 바로 `iframe` 크기 조정
}

function updateCharts(serverStatuses) {
    serverStatuses.forEach(function (server, index) {
        // CPU 사용량 데이터에서 숫자만 추출
        const cpuUsage = parseFloat(server.cpu_usage.match(/\d+/)[0]);

        const cpuData = google.visualization.arrayToDataTable([
            ["서버", "CPU 사용량"],
            ["남은 CPU", 100 - cpuUsage],
            ["사용량", cpuUsage]
        ]);

        console.log(`Updating CPU chart for server ${server.name}`); // 로그 추가
        cpuCharts[index].chart.draw(cpuData, cpuCharts[index].options);

        // 메모리 사용량 데이터에서 숫자만 추출
        const memoryUsage = parseFloat(server.memory_usage.match(/\d+/)[0]);
        const memoryData = google.visualization.arrayToDataTable([
            ["서버", "메모리 사용량"],
            ["남은 메모리", 100 - memoryUsage],
            ["사용량", memoryUsage]
        ]);

        console.log(`Updating Memory chart for server ${server.name}`); // 로그 추가
        memoryCharts[index].chart.draw(memoryData, memoryCharts[index].options);

        const usedPercentage = memoryUsage;

        // 메모리 사용량에 따라 배경 깜빡이기 및 팝업 표시
        const chartGroupContainer = document.getElementById("chart-group-" + index);
        const memoryContainer = document.getElementById("memorychart-" + index);

        if (usedPercentage > 70) {
            chartGroupContainer.classList.add("blinking-background-red");
            chartGroupContainer.classList.remove("blinking-background-yellow");
        } else if (usedPercentage > 50) {
            chartGroupContainer.classList.add("blinking-background-yellow");
            memoryContainer.classList.add("blinking-background-yellow");
            chartGroupContainer.classList.remove("blinking-background-red");
            memoryContainer.classList.remove("blinking-background-red");
        } else {
            chartGroupContainer.classList.remove("blinking-background-yellow", "blinking-background-red");
        }
    });

    adjustParentIframeHeight(); // 차트 업데이트 후 `iframe` 크기 조정
}

function showDetails(index, chartGroupContainer) {
    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];
    const details = document.getElementById("modal-details");
    const server = currentServerStatuses[index]; // 최신 서버 상태 데이터 가져오기

    // 서버 정보를 팝업에 채워넣기
    details.innerHTML = `
        <h2>${server.name}</h2>
        <table>
            <tr>
                <th>CPU 사용량</th>
                <th>메모리 사용량</th>
            </tr>
            <tr>
                <td>${server.cpu_usage}</td>
                <td>${server.memory_usage}</td>
            </tr>
        </table>
    `;

    // 팝업 위치를 클릭한 차트 그룹의 x, y 1 위치에 설정
    const rect = chartGroupContainer.getBoundingClientRect();
    modal.style.top = `${rect.top + window.scrollY + 1}px`; // 클릭한 차트 그룹의 y 1 위치
    modal.style.left = `${rect.left + window.scrollX + 1}px`; // 클릭한 차트 그룹의 x 1 위치
    modal.style.position = "absolute";

    modal.style.display = "block";

    // 팝업 닫기 이벤트 추가
    span.onclick = function () {
        modal.style.display = "none";
    };
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

function adjustParentIframeHeight() {
    const iframe = window.frameElement;
    if (iframe) {
        iframe.style.height = document.documentElement.scrollHeight + "px";
    }
}

function startAutoRefresh() {
    setInterval(fetchData, 10000); // 10초마다 데이터 갱신
}

window.onload = function () {
    initialize(); // 최초 로드 시 초기화
    adjustParentIframeHeight();
    resizeAllIframes(); // 모든 iframe 리사이징
};

window.onresize = function () {
    adjustParentIframeHeight();
    const modal = document.getElementById("myModal");
    modal.style.display = "none"; // 리사이즈 시 팝업 숨기기
    resizeAllIframes(); // 모든 iframe 리사이징
};

function resizeIframe(iframe) {
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
}

function resizeAllIframes() {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(function (iframe) {
        resizeIframe(iframe);
    });
}
