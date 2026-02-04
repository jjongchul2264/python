console.log("JS 파일 로드됨");
$(document).ready(function () {
    $("#verify-btn").click(function () {
        const regi = $("#regi-input").val();
        console.log("버튼 클릭됨");
        $.ajax({
            url: "/verify_regi",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ regi: regi }),
            success: function (res) {
                if (res.success) {

                    // 성공 팝업 표시
                    $("#success-popup").show();

                    // 1.5초 후 리다이렉트
                    setTimeout(function () {
                        window.location.href = "/contract_manage";
                    }, 1500);

                } else {
                    $("#error-msg").show();
                }
            }
        });
    });
});

