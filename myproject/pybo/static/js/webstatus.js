function fetchData() {
    console.log("Fetching web service statuses...");

    fetch("/webstatus?format=json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            updateStatusTable(data);
        })
        .catch(error => console.error("Error fetching web service statuses:", error));
}

function updateStatusTable(statuses) {
    const container = document.getElementById("web-service-status-container");
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>서비스</th>
                    ${statuses.map(status => `<th colspan="2">${status.name}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="bold-status">상태</td>
                    ${statuses.map(status => `
                        <td>
                            <span class="status-light ${status.status === "Up" ? "status-up" : "status-down"}"></span>
                        </td>
                        <td>${status.status}</td>
                    `).join("")}
                </tr>
            </tbody>
        </table>
    `;
    if (window.frameElement) {
        window.frameElement.style.height = document.documentElement.scrollHeight + "px";
    }
}

function startAutoRefresh() {
    setInterval(fetchData, 10000);
}

window.onload = function () {
    fetchData();
    startAutoRefresh();
};

window.onresize = function () {
    if (window.frameElement) {
        window.frameElement.style.height = document.documentElement.scrollHeight + "px";
    }
};
