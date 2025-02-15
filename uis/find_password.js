const findPasswordForm = document.getElementById("find-password-form");
const passwordResetForm = document.getElementById("password-reset-form");
const setPasswordForm = document.getElementById("set-password-form");
const messageDisplay = document.getElementById("message-display");


findPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    // 입력 필드에서 아이디와 MBTI 가져오기
    const user_id = document.getElementById("user_id_find").value;
    const mbti = document.getElementById("mbti_find").value;

    try {
        // 본인 확인 요청을 백엔드로 보냄 (/reset-password-mbti API 호출)
        const response = await fetch("http://localhost:3000/reset-password-mbti", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, mbti }), // JSON 형식으로 아이디와 MBTI 전송
        });

        const result = await response.json(); // 응답을 JSON으로 변환

        if (response.ok) {
            // 본인 확인 성공
            messageDisplay.innerHTML = `<p style="color: blue;">본인 확인에 성공했습니다. 새로운 비밀번호를 설정해주세요.</p>`; // 성공 메시지 표시
            findPasswordForm.style.display = 'none'; // 본인 확인 폼 숨김
            passwordResetForm.style.display = 'block'; // 비밀번호 재설정 폼 표시 (새 비밀번호 입력 폼)
        } else {
            // 본인 확인 실패
            messageDisplay.innerHTML = `<p style="color: red;">${result.message}</p>`; // 오류 메시지 표시
        }
    } catch (error) {
        console.error("본인 확인 중 오류 발생:", error); // 콘솔에 오류 출력
        messageDisplay.innerHTML = `<p style="color: red;">본인 확인 중 문제가 발생했습니다.</p>`; // 오류 메시지 표시
    }
});


setPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    // 새 비밀번호 입력 필드에서 값 가져오기
    const user_id = document.getElementById("user_id_find").value; // 아이디는 이전 폼에서 입력받은 값 그대로 사용
    console.log("setPasswordForm submit - user_id:", user_id); // 🟢 user_id 값 콘솔에 출력 (확인용)
    const newPassword = document.getElementById("new_password").value;

    try {
        // 새 비밀번호 설정 요청을 백엔드로 보냄 (/set-new-password API 호출)
        const response = await fetch("http://localhost:3000/set-new-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, newPassword }), // JSON 형식으로 아이디와 새 비밀번호 전송
        });

        const result = await response.json(); // 응답을 JSON으로 변환

        if (response.ok) {
            // 비밀번호 재설정 성공
            messageDisplay.innerHTML = `<p style="color: blue;">비밀번호가 성공적으로 재설정되었습니다. <a href="login.html">로그인 페이지로 이동</a></p>`; // 성공 메시지 표시 및 로그인 페이지 링크
            passwordResetForm.style.display = 'none'; // 비밀번호 재설정 폼 숨김
            findPasswordForm.style.display = 'none'; // 본인 확인 폼 숨김 (혹시 display: block; 되어있을 경우를 대비)

        } else {
            // 비밀번호 재설정 실패
            messageDisplay.innerHTML = `<p style="color: red;">비밀번호 재설정 실패: ${result.message}</p>`; // 오류 메시지 표시
        }
    } catch (error) {
        console.error("비밀번호 재설정 중 오류 발생:", error); // 콘솔에 오류 출력
        messageDisplay.innerHTML = `<p style="color: red;">비밀번호 재설정 중 문제가 발생했습니다.</p>`; // 오류 메시지 표시
    }
});