const mbtiOptions = document.querySelectorAll(".mbti-option");
// 결과보기 버튼 요소 가져오기
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
    const allActive = document
      .querySelectorAll(".mbti-category")
      .every((category) => {
        return category.querySelector(".mbti-option.active");
      });

    // 결과보기 버튼 활성화/비활성화
    resultButton.disabled = !allActive;
  });
});

resultButton.addEventListener("click", () => {
  // 결과보기 버튼 클릭 시 동작 (기존 코드 유지)
  // 1. 이동할 페이지 경로 설정
  const targetPath = "../trrc-PYB/index.html"; // 상대 경로 사용

  // 2. 페이지 이동
  window.location.href = targetPath;
});
