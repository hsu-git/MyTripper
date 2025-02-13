// 회원가입 폼을 가져와 이벤트 리스너 추가
document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지
  
    // 입력 필드에서 사용자 정보 가져오기
    const name = document.getElementById("name").value;
    const user_id = document.getElementById("user_id").value;
    const password = document.getElementById("password").value;
    const mbti = document.getElementById("mbti").value;
  
    try {
      // 회원가입 요청을 백엔드로 보냄
      const response = await fetch("http://127.0.0.1:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, user_id, password, mbti }), // JSON 형식으로 데이터 전송
      });
  
      const result = await response.json(); // 응답을 JSON으로 변환
  
      if (response.ok) {
        alert("회원가입 성공!"); // 성공 메시지 표시
        window.location.href = "login.html"; // 로그인 페이지로 이동
      } else {
        alert("회원가입 실패: " + result.error); // 오류 메시지 표시
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error); // 콘솔에 오류 출력
      alert("회원가입 중 문제가 발생했습니다.");
    }
  });
  