const mbtiOptions = document.querySelectorAll(".mbti-option");
const resultButton = document.getElementById("resultButton");

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
