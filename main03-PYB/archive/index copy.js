document.addEventListener("DOMContentLoaded", function () {
  // URL 파라미터에서 MBTI 결과 추출
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti");
  const itemResult = urlParams.get("item");
  const locationResult = urlParams.get("location");

  // 결과 표시 및 AI 호출
  if (mbtiResult && itemResult && locationResult) {
    // title-area h1에 결과 조합
    const titleArea = document.querySelector(".title-area h1");
    titleArea.textContent = `${locationResult} ${itemResult}`;

    // 프롬프트 생성
    const prompt = generatePrompt(mbtiResult, itemResult, locationResult);

    // AI 호출 및 결과 처리
    callAI(prompt).then((result) => {
      // 결과 처리 함수 호출
      displayAIResult(result);
    });
  }
});

function generatePrompt(mbti, item, location) {
  return `당신은 ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 최고의 장소와 함께 즐길 거리를 추천하는 전문가입니다. 다음 질문에 대해 상세하고 구체적으로 답변해주세요.
    질문: ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 구체적인 위치와 함께 즐길만한 것을 추천해주세요.
    1. 30자 이내 요약
    2. 추천 상세 내용 및 위치, 같이 즐길만한 것들.
    3. 추천 장소의 이미지 URL`;
}

async function callAI(prompt) {
  const apiKey = process.env.API_KEY; // .env 파일에서 API 키 로드
  const response = await fetch("YOUR_AI_API_ENDPOINT", {
    // 실제 AI API 엔드포인트로 대체
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data; // AI 응답 객체 전체 반환
}

function displayAIResult(result) {
  // AI 결과 파싱 (요약, 상세 내용, 이미지 URL 분리)
  const parts = result.result.split("\n3. ");
  const [summary, details] = parts[0].split("\n2. ");
  const imageUrl = parts[1];

  // 상세 정보 영역에 결과 표시
  document.querySelector(".details h2").textContent = summary.replace(
    "1. ",
    ""
  );
  document.querySelector(".details .region p").textContent = details;

  // 이미지 표시
  const imageElement = document.querySelector(".image-area img");
  if (imageUrl) {
    imageElement.src = imageUrl;
  } else {
    imageElement.src = "default_image.jpg"; // 기본 이미지 설정
    imageElement.alt = "이미지를 불러올 수 없습니다.";
  }
}
