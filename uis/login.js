// 로그인 폼을 가져와 이벤트 리스너 추가
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // 기본 폼 제출 동작 방지

  // 입력 필드에서 사용자 정보 가져오기
  const user_id = document.getElementById("user_id").value;
  const password = document.getElementById("password").value;

  try {
    // 로그인 요청을 백엔드로 보냄
    const response = await fetch("https://nifty-curly-map.glitch.me/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, password }), // JSON 형식으로 데이터 전송
    });

    const result = await response.json(); // 응답을 JSON으로 변환

    if (response.ok) {
      alert("로그인 성공! Welcome, " + result.data.name); // 성공 메시지 표시
      // 로그인 후 페이지 이동 (예: 메인 페이지)
      window.location.href = "My_Tripper/_common/index.html";
    } else {
      alert("로그인 실패: " + result.message); // 오류 메시지 표시
    }
  } catch (error) {
    console.error("로그인 중 오류 발생:", error); // 콘솔에 오류 출력
    alert("로그인 중 문제가 발생했습니다.");
  }
});