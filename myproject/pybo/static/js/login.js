// 페이지 로드 시 저장된 값 불러오기
document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const saveUsernameCheckbox = document.getElementById("saveUsername");
    const savePasswordCheckbox = document.getElementById("savePassword");

    // 저장된 아이디 불러오기
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedUsername) {
        usernameInput.value = savedUsername;
        saveUsernameCheckbox.checked = true;
    }

    if (savedPassword) {
        passwordInput.value = atob(savedPassword); // Base64 디코딩
        savePasswordCheckbox.checked = true;
    }

    // 폼 제출 시 저장 처리
    document.querySelector("form").addEventListener("submit", function () {
        // 아이디 저장
        if (saveUsernameCheckbox.checked) {
            localStorage.setItem("savedUsername", usernameInput.value);
        } else {
            localStorage.removeItem("savedUsername");
        }

        // 비밀번호 저장
        if (savePasswordCheckbox.checked) {
            localStorage.setItem("savedPassword", btoa(passwordInput.value)); // Base64 인코딩
        } else {
            localStorage.removeItem("savedPassword");
        }
    });
});