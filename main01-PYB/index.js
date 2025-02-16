const mbtiOptions = document.querySelectorAll(".mbti-option");
const resultButton = document.getElementById("resultButton");
const loginRequiredButton = document.getElementById("loginRequiredButton");

// 초기 상태: 결과보기 버튼 비활성화
resultButton.disabled = true;

mbtiOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const btnGroup = option.parentElement;
    const activeBtn = btnGroup.querySelector(".mbti-option.active");

    if (activeBtn) {
      activeBtn.classList.remove("active");
    }

    option.classList.add("active");

    // 모든 mbti-category가 활성화되었는지 확인
    const allActive = Array.from(
      document.querySelectorAll(".mbti-category")
    ).every((category) => {
      return category.querySelector(".mbti-option.active") !== null; // null 값 확인 추가
    });

    // 결과보기 버튼 활성화/비활성화
    resultButton.disabled = !allActive;

    // 추가: 모든 MBTI 옵션이 선택되었을 때만 결과보기 버튼 활성화
    if (document.querySelectorAll(".mbti-option.active").length === 4) {
      resultButton.disabled = false;
    } else {
      resultButton.disabled = true;
    }
  });
});

// 팝업 기능 구현
const popups = document.querySelectorAll(".popup");

popups.forEach((popup) => {
  const popuptext = popup.querySelector(".popuptext");
  const popupBox = popup.querySelector(".popup-box"); // 팝업 박스 요소 선택

  popup.addEventListener("mouseover", () => {
    popuptext.style.visibility = "visible";
    popuptext.style.opacity = 1;
  });

  popup.addEventListener("mouseout", () => {
    popuptext.style.visibility = "hidden";
    popuptext.style.opacity = 0;
  });
});

resultButton.addEventListener("click", (event) => {
  event.preventDefault(); // 웹페이지 이동 막기

  let mbtiResult = "";

  // 4가지 카테고리별 선택된 옵션의 알파벳 추출
  const categories = document.querySelectorAll(".mbti-category");
  categories.forEach((category) => {
    const activeOption = category.querySelector(".mbti-option.active");
    if (activeOption) {
      const mbtiChar = activeOption.textContent.slice(0, 1); // 마지막 괄호 안 알파벳 추출
      mbtiResult += mbtiChar;
    }
  });

  // MBTI 결과값 (예: "ESTJ")
  console.log("MBTI 결과값:", mbtiResult);

  // URL 파라미터에 mbti 값을 포함하여 targetUrl 생성
  const targetUrl = `../main02-CJH/index.html?mbti=${mbtiResult}`;

  console.log("Target URL:", targetUrl); // targetUrl 확인

  window.location.href = targetUrl;
});

function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => (document.getElementById(id).innerHTML = data))
    .then(() => {
      // header 로드 후 실행되는 콜백 함수 추가
      updateHeaderBasedOnLoginStatus(); // 헤더 업데이트 함수 호출
      updateResultButtonVisibility(); // 결과보기 버튼 업데이트 함수 호출
    });
}

function updateHeaderBasedOnLoginStatus() {
  const token = localStorage.getItem("token");
  const signinItem = document.getElementById("signin-item");
  const registerItem = document.getElementById("register-item");
  const logoutItem = document.getElementById("logout-item");
  const myPageItem = document.getElementById("mypage-item");

  if (token) {
    // JWT 토큰이 존재하면 (로그인 상태)
    signinItem.style.display = "none"; // "Sign in" 버튼 숨김
    registerItem.style.display = "none"; // "Register" 버튼 숨김
    logoutItem.style.display = "block"; // "Logout" 버튼 표시
    myPageItem.style.display = "block"; // "My Page" 버튼 표시
  } else {
    // JWT 토큰이 없으면 (로그아웃 상태)
    signinItem.style.display = "block"; // "Sign in" 버튼 표시
    registerItem.style.display = "block"; // "Register" 버튼 표시
    logoutItem.style.display = "none"; // "Logout" 버튼 숨김
    myPageItem.style.display = "none"; // "My Page" 버튼 숨김
  }
}

function updateResultButtonVisibility() {
  const token = localStorage.getItem("token");
  if (token) {
    // 로그인 상태: 결과보기 버튼 표시, 로그인 필요 버튼 숨김
    resultButton.style.display = "block";
    loginRequiredButton.style.display = "none";
  } else {
    // 로그아웃 상태: 결과보기 버튼 숨김, 로그인 필요 버튼 표시
    resultButton.style.display = "none";
    loginRequiredButton.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("token"); // localStorage에서 JWT 토큰 제거
  localStorage.removeItem("user_id");
  updateHeaderBasedOnLoginStatus(); // 헤더 업데이트
  updateResultButtonVisibility(); // 결과보기 버튼 업데이트
  alert("로그아웃 되었습니다.");
  window.location.href = "/MyTripper/main01-PYB/index.html"; // 메인 페이지로 이동 (원하는 페이지로 변경 가능)

  // (선택 사항) 서버에 로그아웃 요청을 보낼 수도 있습니다.
  // fetch("http://localhost:3000/logout", { method: "POST" });
}

// 헤더와 푸터 로드
loadComponent("header", "../_common/header.html");
loadComponent("footer", "../_common/footer.html");

// "로그인이 필요합니다" 버튼 클릭 이벤트 핸들러 추가
loginRequiredButton.addEventListener("click", () => {
  window.location.href = "../uis/login.html";
});
