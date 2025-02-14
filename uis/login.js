// 로그인 폼 제출 이벤트 처리
document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    const userId = document.getElementById("user_id").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://127.0.0.1:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password: password }), // 로그인 데이터 전송
      });

      const result = await response.json();

      if (response.ok) {
        // 로그인 성공 시 JWT 토큰 저장
        localStorage.setItem("jwt_token", result.token); // JWT 토큰을 로컬 스토리지에 저장
        alert("로그인 성공!");
        window.location.href = "/MyTripper/_common/index.html"; // 로그인 후 메인 페이지로 이동
      } else {
        alert("로그인 실패: " + result.error);
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      alert("로그인 중 문제가 발생했습니다.");
    }
  });
