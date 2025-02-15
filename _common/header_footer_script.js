function loadComponent(id, file) {
  fetch(file)
      .then((response) => response.text())
      .then((data) => (document.getElementById(id).innerHTML = data))
      .then(() => { // header 로드 후 실행되는 콜백 함수 추가
          updateHeaderBasedOnLoginStatus(); // 헤더 업데이트 함수 호출
      });
}

function updateHeaderBasedOnLoginStatus() {
  const token = localStorage.getItem('token');
  const signinItem = document.getElementById('signin-item');
  const registerItem = document.getElementById('register-item');
  const logoutItem = document.getElementById('logout-item');

  if (token) { // JWT 토큰이 존재하면 (로그인 상태)
      signinItem.style.display = 'none'; // "Sign in" 버튼 숨김
      registerItem.style.display = 'none'; // "Register" 버튼 숨김
      logoutItem.style.display = 'block'; // "Logout" 버튼 표시
  } else { // JWT 토큰이 없으면 (로그아웃 상태)
      signinItem.style.display = 'block'; // "Sign in" 버튼 표시
      registerItem.style.display = 'block'; // "Register" 버튼 표시
      logoutItem.style.display = 'none'; // "Logout" 버튼 숨김
  }
}

function logout() {
  localStorage.removeItem('token'); // localStorage에서 JWT 토큰 제거
  updateHeaderBasedOnLoginStatus(); // 헤더 업데이트
  alert("로그아웃 되었습니다.");
  window.location.href = "../mainpage-PYB/index.html"; // 메인 페이지로 이동 (원하는 페이지로 변경 가능)

  // (선택 사항) 서버에 로그아웃 요청을 보낼 수도 있습니다.
  // fetch("http://localhost:3000/logout", { method: "POST" });
}


// 헤더와 푸터 로드
loadComponent("header", "../_common/header.html");
loadComponent("footer", "../_common/footer.html");