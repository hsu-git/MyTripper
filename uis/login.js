// 로그인 폼을 가져와 이벤트 리스너 추가
document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    // 입력 필드에서 사용자 정보 가져오기
    const user_id = document.getElementById("user_id").value;
    const password = document.getElementById("password").value;

    try {
      // 로그인 요청을 백엔드로 보냄
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }), // JSON 형식으로 데이터 전송
      });

      const result = await response.json(); // 응답을 JSON으로 변환

      if (response.ok) {
        alert("로그인 성공! 아이디:, " + result.data.name); // 성공 메시지 표시
        // JWT를 localStorage에 저장
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user_id", result.data.user_id);

        // 이전 페이지 URL 확인
        const 이전_페이지_URL = document.referrer;
        const 회원가입_페이지_URL = "signup.html"; // ⚠️ 회원가입 페이지 파일명 (실제 파일명으로 수정!)
        const 비밀번호_재설정_페이지_URL = "find_password.html"; // ⚠️ 비밀번호 재설정 페이지 파일명 (실제 파일명으로 수정!)

        // 이전 페이지 URL 콘솔에 출력 (디버깅용, 필요시 주석 해제)
        // console.log("이전 페이지 URL (document.referrer):", 이전_페이지_URL); // 🟢 document.referrer 값 콘솔에 출력 (확인용)


        // 이전 페이지가 회원가입 페이지 또는 비밀번호 재설정 페이지인지 확인하여 조건부 리디렉션
        if (
          이전_페이지_URL &&
          (이전_페이지_URL.endsWith(회원가입_페이지_URL) ||
            이전_페이지_URL.endsWith(비밀번호_재설정_페이지_URL))
        ) {
          // 이전 페이지가 회원가입 페이지 또는 비밀번호 재설정 페이지인 경우 메인 페이지로 이동
          window.location.href = "../main01-PYB/index.html"; // ⚠️ 메인 페이지 경로 (실제 경로로 수정!)
        } else {
          // 이전 페이지가 회원가입 페이지나 비밀번호 재설정 페이지가 아닌 경우 기존 로직 적용
          if (이전_페이지_URL) {
            window.location.href = 이전_페이지_URL;
          } else {
            // 이전 페이지 URL이 없는 경우 기본 페이지로 이동
            window.location.href = "../main01-PYB/index.html"; // ⚠️ 메인 페이지 경로 (실제 경로로 수정!)
          }
        }
      } else {
        alert("로그인 실패: " + result.message); // 오류 메시지 표시
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error); // 콘솔에 오류 출력
      alert("로그인 중 문제가 발생했습니다.");
    }
  });