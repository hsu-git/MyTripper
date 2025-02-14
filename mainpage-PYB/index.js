document.addEventListener("DOMContentLoaded", function () {
  const mbtiOptions = document.querySelectorAll(".mbti-option");
  const resultButton = document.getElementById("resultButton");
  const promptDisplay = document.getElementById("promptDisplay"); // promptDisplay 요소 가져오기

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
        return category.querySelector(".mbti-option.active") !== null;
      });

      // 결과보기 버튼 활성화/비활성화
      resultButton.disabled = !allActive;
    });
  });

  resultButton.addEventListener("click", () => {
    const selectedOptions = [];
    const categories = ["focus", "recognize", "judge", "act"];

    categories.forEach((category) => {
      const selectedButton = document.querySelector(
        `.mbti-category:has(p:contains("${
          category.charAt(0).toUpperCase() + category.slice(1)
        }")) .btn-group .mbti-option.active`
      );
      if (selectedButton) {
        selectedOptions.push(selectedButton.textContent);
      }
    });

    if (selectedOptions.length === 4) {
      const prompt = `당신의 MBTI는 ${selectedOptions[0]}, ${selectedOptions[1]}, ${selectedOptions[2]}, ${selectedOptions[3]}입니다. 이 MBTI에 맞는 여행지를 추천해주세요.`;
      displayPrompt(prompt);
    } else {
      alert("MBTI 옵션을 모두 선택해주세요.");
    }
  });

  function displayPrompt(prompt) {
    promptDisplay.textContent = prompt; // promptDisplay에 prompt 내용 표시
  }

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
});
