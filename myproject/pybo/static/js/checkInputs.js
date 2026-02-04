function checkInputs() {
    // Retrieve input values
    const mac_owner = document.getElementById("user_name").value;
    const mac_start = document.getElementById("mac_start").value;
    const mac_cnt = document.getElementById("create_cnt").value;
    const mac_project = document.getElementById("create_comment").value;

    // Check if all fields are filled
    if (!mac_owner || !mac_cnt || !mac_project) {
        alert("작성자, 사용 갯수, 이용 목적을 입력해주세요.");
        return;
    } else {
        // create 페이지로 이동하면서 user_name 값을 쿼리 파라미터로 전달
        window.location.href = `create?user_name=${encodeURIComponent(mac_owner)}&mac_start=${encodeURIComponent(mac_start)}&create_cnt=${encodeURIComponent(mac_cnt)}&create_comment=${encodeURIComponent(mac_project)}`;
    }
}

function checkInputs2() {
    // Retrieve input values
    const out_user = document.getElementById("user").value;
    const out_desc = document.getElementById("description").value;
    const out_start = document.getElementById("starttime").value;
    const out_end = document.getElementById("endtime").value;

    // Check if all fields are filled
    if (!out_user || !out_desc || !out_start || !out_end) {
        alert("사원명, 사유, 시작일시, 종료일시를 입력하세요!!");
        return;
    }
}

