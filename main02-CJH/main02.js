// API 키 (localStorage에서 불러오기)
const TOGETHER_API_KEY = localStorage.getItem("TOGETHER_API_KEY");
const GROQ_API_KEY = localStorage.getItem("GROQ_API_KEY");
const GEMINI_API_KEY = localStorage.getItem("GEMINI_API_KEY");
const UNSPLASH_API_KEY = localStorage.getItem("UNSPLASH_API_KEY");

// API 기본 URL
const TOGETHER_BASE_URL = "https://api.together.xyz";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// 모델 이름
const TURBO_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
const GROQ_LLAMA_MODEL = "llama3-70b-8192";
const FLUX_MODEL = "black-forest-labs/FLUX.1-schnell-Free";
const MIXTRAL_MODEL = "mixtral-8x7b-32768";
const DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";
const GEMINI_MODEL_NAME = "gemini-pro"; // Gemini 모델 이름

// Gemini API 호출 함수 (최소 파라미터)
const callGemini = async (prompt) => {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Gemini API 요청 실패: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

// AI API 호출 함수 (이미지 생성에 사용)
async function callAI({ url, model, text, apiKey }) {
  const payload = { model, messages: [{ role: "user", content: text }] };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// 배열 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 이미지 검색 함수 (Unsplash API 호출)
async function searchImages(query) {
  const apiUrl = `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Unsplash API 요청 실패: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const imageUrls = data.results.map((result) => result.urls.regular);
    return imageUrls;
  } catch (error) {
    console.error("Unsplash API 요청 중 오류 발생:", error);
    return ["이미지 없음"];
  }
}
// ✅ 정규 표현식 기반 분할 함수
function splitLocations(locationText) {
  if (!locationText) {
    return []; // 빈 문자열 또는 nullish 값인 경우 빈 배열 반환
  }
  return locationText
    .split(/[\n,]+/) // 줄바꿈 또는 쉼표로 분할
    .map((location) => location.replace(/^[\s*.\-]+|[\s*.\-]+$/g, "").trim()) // 각 지역 이름에서 앞뒤 공백, *, ., - 제거 및 trim
    .filter(Boolean); // 빈 문자열 제거 (filter(Boolean))
}

document.addEventListener("DOMContentLoaded", async function () {
  // ✅ URL 파라미터에서 mbtiResult 값을 가져옵니다.
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti"); // mbtiResult 값이 없는 경우 (URL 파라미터 오류 또는 직접 접근)

  if (!mbtiResult) {
    alert("MBTI 유형이 URL 파라미터로 전달되지 않았습니다."); // 또는 다른 오류 처리
    return; // MBTI 결과 생성 중단
  }

  // console.log("전달받은 MBTI 값:", mbtiResult);

  const mbtiResultElement = document.createElement("p");
  mbtiResultElement.textContent = `전달받은 MBTI 값: ${mbtiResult}`;
  document.body.appendChild(mbtiResultElement);

  const resultImageElement = document.getElementById("resultImage");
  const mbtiDescriptionElement = document.getElementById("mbtiDescription");

  const cardElements = document.querySelectorAll(".result-item");
  const cardImageElements = document.querySelectorAll(".card-image");
  const cardContentElements = document.querySelectorAll(".card-text");

  // ✅ 9개 버튼 요소 선택 (각 카드별로 3개씩)
  const locationButtonElements = document.querySelectorAll(".item-button");

  try {
    const text = mbtiResult; // ✅ URL 파라미터에서 받은 MBTI 값을 text 변수에 할당

    // 이미지, MBTI 설명, 추천 음식/액티비티 생성 (기존 코드와 동일)
    const imagePrompt = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY,
      model: GROQ_LLAMA_MODEL,
      text: `${text}에 해당하는 MBTI에 어울리는 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const promptJSON = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY,
      model: MIXTRAL_MODEL,
      text: `${imagePrompt}에서 AI 이미지 생성을 위해 작성된 200자 이내의 영어 프롬프트를 JSON Object로 prompt라는 key로 JSON string으로 ouput해줘`,
      jsonMode: true,
    }).then((res) => JSON.parse(res.choices[0].message.content).prompt);

    const image = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY,
      model: FLUX_MODEL,
      text: promptJSON,
    }).then((res) => res.data[0].url);

    const mbtiDescriptionPrompt = await callGemini(
      `**[한국어로 MBTI 유형 설명]**\n\n${text} MBTI 유형에 대해 40자 이내로 한국어로 설명해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const foodRecommendationPrompt = await callGemini(
      `**[한국어 음식 추천]**\n\n${text} MBTI 유형에 어울리는 한국 음식 1가지를 이름만 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const activityRecommendationPrompt1 = await callGemini(
      `**[한국어 여행 액티비티 추천 1]**\n\n${text} MBTI 유형에게 어울리는 **여행 추천 액티비티** 1가지를 이름만 추천해줘. 예를 들어,번지점프,수영 처럼 **여행 장소에서 할 수 있는 액티비티** 형태로 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const activityRecommendationPrompt2 = await callGemini(
      `**[한국어 여행 액티비티 추천 1]**\n\n${text} MBTI 유형에게 어울리는 **여행 추천 액티비티** 1가지를 이름만 추천해줘. 예를 들어, 번지점프,수영 처럼 **여행 장소에서 할 수 있는 액티비티** 형태로 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const foodImageURLs = await searchImages(
      `${foodRecommendationPrompt.trim()} 음식 이미지`
    );
    const activityImageURLs1 = await searchImages(
      `${activityRecommendationPrompt1.trim()} 액티비티 이미지`
    );
    const activityImageURLs2 = await searchImages(
      `${activityRecommendationPrompt2.trim()} 액티비티 이미지`
    );

    resultImageElement.src = image;
    mbtiDescriptionElement.textContent = mbtiDescriptionPrompt.trim();

    const resultItems = [
      { text: foodRecommendationPrompt.trim(), image: foodImageURLs[0] },
      {
        text: activityRecommendationPrompt1.trim(),
        image: activityImageURLs1[0],
      },
      {
        text: activityRecommendationPrompt2.trim(),
        image: activityImageURLs2[0],
      },
    ];
    const shuffledItems = shuffleArray([...resultItems]);

    for (let i = 0; i < cardElements.length; i++) {
      cardImageElements[i].src = shuffledItems[i].image || "이미지 없음";
      cardContentElements[i].textContent = shuffledItems[i].text;
    }

    // ✅ 각 추천 아이템별로 3개의 지역 추천 생성 (총 3번 API 호출)
    const locationRecommendations = []; // 추천 지역 저장 배열

    for (let i = 0; i < shuffledItems.length; i++) {
      // shuffledItems 순회 (3번)
      const itemText = shuffledItems[i].text;

      try {
        // ✅ Gemini API 에 3개의 지역 추천 요청 (한 번의 API 호출로 3개 추천 받기)
        const locationPrompt = await callGemini(
          `**[한국어 여행 지역 추천 3곳]**\n\n${text} MBTI 유형에게 ${itemText}을(를) 즐기기 좋은 한국 여행 지역 3곳을 추천해줘. 사람들이 많이 찾는 인기 명소 위주로 각 지역은 15자 이내로 추천해줘. 추천 지역은 **평문으로 작성하고 쉼표로 구분**해서 줘`
        );
        console.log("locationPrompt:", locationPrompt);
        const locationText =
          locationPrompt.candidates[0].content.parts[0].text.trim();
        // console.log("locationText:", locationText);
        // // locationText 로그

        // ✅ 쉼표로 구분된 지역 텍스트를 배열로 분할
        const locations = splitLocations(locationText);
        // ✅ 정규 표현식 기반 분할 함수 사용
        // console.log("locations:", locations); // locations 배열 로그

        // ✅ 분할된 지역들을 locationRecommendations 배열에 추가
        locationRecommendations.push(...locations);
      } catch (error) {
        console.error("Gemini API 호출 오류:", error);
        locationRecommendations.push(
          "지역 추천 실패",
          "지역 추천 실패",
          "지역 추천 실패" // 3개 버튼 모두 "지역 추천 실패" 표시
        );
      }
    }

    console.log(
      "locationRecommendations.length:",
      locationRecommendations.length
    ); // 배열 길이 로그

    // ✅ 버튼 텍스트 업데이트 (각 카드별로 3개씩)
    for (let i = 0; i < shuffledItems.length; i++) {
      // shuffledItems 순회 (3번)
      for (let j = 0; j < 3; j++) {
        // 각 카드별 3개의 버튼 순회
        const buttonIndex = i * 3 + j; // 버튼 인덱스 계산 (0, 1, 2, 3, 4, 5, 6, 7, 8)
        const recommendationIndex = i * 3 + j; // 지역 추천 결과 인덱스 계산 (0, 1, 2, 3, 4, 5, 6, 7, 8)

        locationButtonElements[buttonIndex].textContent =
          locationRecommendations[recommendationIndex] || "지역 추천 실패"; // locationRecommendations 에서 텍스트 추출
      }
    }
  } catch (error) {
    console.error("오류 발생:", error);
    cardContentElements.forEach((element) => {
      element.textContent = "API 요청 중 오류가 발생했습니다.";
    });
    locationButtonElements.forEach((element) => {
      element.textContent = "지역 추천 실패";
    });
  }
});
