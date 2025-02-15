function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => (document.getElementById(id).innerHTML = data));
}

// 헤더와 푸터 로드
loadComponent("header", "../_common/header.html");
loadComponent("footer", "../_common/footer.html");

// 로그인 상태에 따라 버튼 표시/숨기기
window.onload = () => {
  const jwtToken = localStorage.getItem("jwt_token");

  if (jwtToken) {
    // 로그인 상태일 때
    document.getElementById("sign-in-btn").style.display = "none"; // Sign in 버튼 숨기기
    document.getElementById("register-btn").style.display = "none"; // Register 버튼 숨기기
    document.getElementById("logout-btn").style.display = "inline-block"; // 로그아웃 버튼 보이기
  } else {
    // 로그인 안 됐을 때
    document.getElementById("sign-in-btn").style.display = "inline-block"; // Sign in 버튼 보이기
    document.getElementById("register-btn").style.display = "inline-block"; // Register 버튼 보이기
    document.getElementById("logout-btn").style.display = "none"; // 로그아웃 버튼 숨기기
  }
};

// 로그아웃 버튼 클릭 시 실행
document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("jwt_token"); // JWT 토큰 삭제
  alert("로그아웃 성공!");
  window.location.href = "index.html"; // 로그아웃 후 index.html로 리디렉션
});
