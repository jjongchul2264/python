document.addEventListener("DOMContentLoaded", function () {

    const filename = document.body.dataset.filename;
    const totalSlides = parseInt(document.body.dataset.total);

    let currentPage = 1;
    let zoomLevel = 1; // 확대 배율

    function loadPage(page) {
        const img = document.getElementById("pageImage");
        img.src = `/docs/viewer/${filename}/${page}`;
        img.style.transform = `scale(${zoomLevel})`; // 확대 유지
    }

    // 확대
    document.getElementById("zoomIn").addEventListener("click", () => {
        zoomLevel += 0.1;
        document.getElementById("pageImage").style.transform = `scale(${zoomLevel})`;
    });

    // 축소
    document.getElementById("zoomOut").addEventListener("click", () => {
        if (zoomLevel > 0.2) {
            zoomLevel -= 0.1;
            document.getElementById("pageImage").style.transform = `scale(${zoomLevel})`;
        }
    });

    // 이전 슬라이드
    document.getElementById("prev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadPage(currentPage); // zoomLevel 유지
        }
    });

    // 다음 슬라이드
    document.getElementById("next").addEventListener("click", () => {
        if (currentPage < totalSlides) {
            currentPage++;
            loadPage(currentPage); // zoomLevel 유지
        }
    });

    loadPage(currentPage);
});