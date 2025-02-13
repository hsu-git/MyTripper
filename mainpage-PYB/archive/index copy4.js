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

resultButton.addEventListener("click", () => {
  // 결과보기 버튼 클릭 시 동작 (기존 코드 유지)
  // 1. 이동할 페이지 경로 설정
  const targetPath = "../trrc-PYB/index.html"; // 상대 경로 사용

  // 2. 페이지 이동
  window.location.href = targetPath;
});
