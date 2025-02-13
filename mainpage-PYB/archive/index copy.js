const mbtiOptions = document.querySelectorAll(".mbti-option");

//버튼 클릭시 선택된것을 가시적으로 표현하는 코드
mbtiOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const btnGroup = option.parentElement;
    const activeBtn = btnGroup.querySelector(".mbti-option.active");

    if (activeBtn) {
      activeBtn.classList.remove("active");
    }

    option.classList.add("active");
  });
});

// 결과보기 버튼을 눌러 다른 페이지로 이동시켜주는 기능을 구현한 코드
const resultButton = document.querySelector(".result-button");

resultButton.addEventListener("click", () => {
  // 1. 이동할 페이지 경로 설정
  const targetPath = "../review-hsu/index.html"; // 상대 경로 사용

  // 2. 페이지 이동
  window.location.href = targetPath;
});
