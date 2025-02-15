// main02.js (수정 후)

// API 키 (localStorage에서 불러오기) -> .env 에서 불러오도록 수정, 이제 localStorage 사용 안함
let TOGETHER_API_KEY_JH;
let GROQ_API_KEY_JH;
let GEMINI_API_KEY_JH;
let UNSPLASH_API_KEY_JH;

// API 기본 URL (기존과 동일)
const TOGETHER_BASE_URL = "https://api.together.xyz";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// 모델 이름 (기존과 동일)
const TURBO_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
const GROQ_LLAMA_MODEL = "llama3-70b-8192";
const FLUX_MODEL = "black-forest-labs/FLUX.1-schnell-Free";
const MIXTRAL_MODEL = "mixtral-8x7b-32768";
const DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";
const GEMINI_MODEL_NAME = "gemini-pro"; // Gemini 모델 이름

// Gemini API 호출 함수 (최소 파라미터) (기존과 동일)
const callGemini = async (prompt) => {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY_JH, // ✅ GEMINI_API_KEY 변수 사용 (이제 .env 에서 불러옴)
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

// AI API 호출 함수 (이미지 생성에 사용) (기존과 동일)
async function callAI({ url, model, text, apiKey }) {
  const payload = { model, messages: [{ role: "user", content: text }] };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`, // ✅ apiKey 파라미터 사용 (이제 .env 에서 불러옴)
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// 배열 셔플 함수 (Fisher-Yates 알고리즘) (기존과 동일)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 이미지 검색 함수 (Unsplash API 호출) (기존과 동일)
async function searchImages(query) {
  const apiUrl = `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_API_KEY_JH}`; // ✅ UNSPLASH_API_KEY 변수 사용 (이제 .env 에서 불러옴)
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
// ✅ 정규 표현식 기반 분할 함수 (기존과 동일)
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
  // ✅ URL 파라미터에서 mbtiResult 값을 가져옵니다. (기존과 동일)
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti"); // mbtiResult 값이 없는 경우 (URL 파라미터 오류 또는 직접 접근)

  if (!mbtiResult) {
    alert("MBTI 유형이 URL 파라미터로 전달되지 않았습니다."); // 또는 다른 오류 처리
    return; // MBTI 결과 생성 중단
  } // console.log("전달받은 MBTI 값:", mbtiResult); (기존과 동일)

  const mbtiResultElement = document.createElement("p"); // (기존과 동일)
  mbtiResultElement.textContent = `전달받은 MBTI 값: ${mbtiResult}`; // (기존과 동일)
  document.body.appendChild(mbtiResultElement); // (기존과 동일)

  const resultImageElement = document.getElementById("resultImage"); // (기존과 동일)
  const mbtiDescriptionElement = document.getElementById("mbtiDescription"); // (기존과 동일)

  const cardElements = document.querySelectorAll(".result-item"); // (기존과 동일)
  const cardImageElements = document.querySelectorAll(".card-image"); // (기존과 동일)
  const cardContentElements = document.querySelectorAll(".card-text"); // (기존과 동일) // ✅ 9개 버튼 요소 선택 (각 카드별로 3개씩) (기존과 동일)

  const locationButtonElements = document.querySelectorAll(".item-button"); // (기존과 동일)

  try {
    // ✅ 서버 API 엔드포인트 호출하여 API 키 가져오기
    const keysResponse = await fetch("http://localhost:3000/api/keys"); // ✅ 수정: 절대 경로 이후 수정 필요!!!!!!
    // const keysResponse = await fetch("/api/keys"); // 서버의 API 엔드포인트 호출 (예: /api/keys)
    if (!keysResponse.ok) {
      throw new Error(
        `API 키를 불러오는데 실패했습니다: ${keysResponse.status} ${keysResponse.statusText}`
      );
    }
    const keys = await keysResponse.json();

    TOGETHER_API_KEY_JH = keys.TOGETHER_API_KEY;
    GROQ_API_KEY_JH = keys.GROQ_API_KEY;
    GEMINI_API_KEY_JH = keys.GEMINI_API_KEY;
    UNSPLASH_API_KEY_JH = keys.UNSPLASH_API_KEY;

    console.log("API 키:", {
      TOGETHER_API_KEY: TOGETHER_API_KEY_JH,
      GROQ_API_KEY: GROQ_API_KEY_JH,
      GEMINI_API_KEY: GEMINI_API_KEY_JH,
      UNSPLASH_API_KEY: UNSPLASH_API_KEY_JH,
    });

    const text = mbtiResult; // ✅ URL 파라미터에서 받은 MBTI 값을 text 변수에 할당 (기존과 동일) // 이미지, MBTI 설명, 추천 음식/액티비티 생성 (기존 코드와 동일)

    const imagePrompt = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH, // ✅ .env 에서 불러온 GROQ_API_KEY 사용
      model: GROQ_LLAMA_MODEL,
      text: `${text}에 해당하는 MBTI에 어울리는 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const promptJSON = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH, // ✅ .env 에서 불러온 GROQ_API_KEY 사용
      model: MIXTRAL_MODEL,
      text: `${imagePrompt}에서 AI 이미지 생성을 위해 작성된 200자 이내의 영어 프롬프트를 JSON Object로 prompt라는 key로 JSON string으로 ouput해줘`,
      jsonMode: true,
    }).then((res) => JSON.parse(res.choices[0].message.content).prompt);

    const image = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY_JH, // ✅ .env 에서 불러온 TOGETHER_API_KEY 사용
      model: FLUX_MODEL,
      text: promptJSON,
    }).then((res) => res.data[0].url);

    const mbtiDescriptionPrompt = await callGemini(
      // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
      `**[한국어로 MBTI 유형 설명]**\n\n${text} MBTI 유형에 대해 40자 이내로 한국어로 설명해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const foodRecommendationPrompt = await callGemini(
      // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
      `**[한국어 음식 추천]**\n\n${text} MBTI 유형에 어울리는 한국 음식 1가지를 이름만 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const activityRecommendationPrompt1 = await callGemini(
      // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
      `**[한국어 여행 액티비티 추천 1]**\n\n${text} MBTI 유형에게 어울리는 **여행 추천 액티비티** 1가지를 이름만 추천해줘. 예를 들어,번지점프,수영 처럼 **여행 장소에서 할 수 있는 액티비티** 형태로 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const activityRecommendationPrompt2 = await callGemini(
      // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
      `**[한국어 여행 액티비티 추천 1]**\n\n${text} MBTI 유형에게 어울리는 **여행 추천 액티비티** 1가지를 이름만 추천해줘. 예를 들어, 번지점프,수영 처럼 **여행 장소에서 할 수 있는 액티비티** 형태로 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const foodImageURLs = await searchImages(
      `${foodRecommendationPrompt.trim()} 음식 이미지` // ✅ searchImages 는 이미 UNSPLASH_API_KEY 사용
    );
    const activityImageURLs1 = await searchImages(
      `${activityRecommendationPrompt1.trim()} 액티비티 이미지` // ✅ searchImages 는 이미 UNSPLASH_API_KEY 사용
    );
    const activityImageURLs2 = await searchImages(
      `${activityRecommendationPrompt2.trim()} 액티비티 이미지` // ✅ searchImages 는 이미 UNSPLASH_API_KEY 사용
    );

    resultImageElement.src = image; // (기존과 동일)
    mbtiDescriptionElement.textContent = mbtiDescriptionPrompt.trim(); // (기존과 동일)

    const resultItems = [
      // (기존과 동일)
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
    const shuffledItems = shuffleArray([...resultItems]); // (기존과 동일)

    for (let i = 0; i < cardElements.length; i++) {
      // (기존과 동일)
      cardImageElements[i].src = shuffledItems[i].image || "이미지 없음"; // (기존과 동일)
      cardContentElements[i].textContent = shuffledItems[i].text; // (기존과 동일)
    } // ✅ 각 추천 아이템별로 3개의 지역 추천 생성 (총 3번 API 호출) (기존과 동일)

    const locationRecommendations = []; // 추천 지역 저장 배열 (기존과 동일)

    for (let i = 0; i < shuffledItems.length; i++) {
      // (기존과 동일)
      // shuffledItems 순회 (3번) (기존과 동일)
      const itemText = shuffledItems[i].text; // (기존과 동일)

      try {
        // (기존과 동일)
        // ✅ Gemini API 에 3개의 지역 추천 요청 (한 번의 API 호출로 3개 추천 받기) (기존과 동일)
        const locationPrompt = await callGemini(
          // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
          `**[한국어 여행 지역 추천 3곳]**\n\n${text} MBTI 유형에게 ${itemText}을(를) 즐기기 좋은 한국 여행 지역 3곳을 추천해줘. 사람들이 많이 찾는 인기 명소 위주로 각 지역은 15자 이내로 추천해줘. 추천 지역은 **평문으로 작성하고 쉼표로 구분**해서 줘`
        );
        console.log("locationPrompt:", locationPrompt); // (기존과 동일)
        const locationText = // (기존과 동일)
          locationPrompt.candidates[0].content.parts[0].text.trim(); // (기존과 동일) // console.log("locationText:", locationText); // // locationText 로그 (기존과 동일) // // locationText 로그 (기존과 동일) // ✅ 쉼표로 구분된 지역 텍스트를 배열로 분할 (기존과 동일)
        const locations = splitLocations(locationText); // (기존과 동일) // ✅ 정규 표현식 기반 분할 함수 사용 (기존과 동일) // console.log("locations:", locations); // locations 배열 로그 (기존과 동일) // ✅ 분할된 지역들을 locationRecommendations 배열에 추가 (기존과 동일)
        locationRecommendations.push(...locations); // (기존과 동일)
      } catch (error) {
        // (기존과 동일)
        console.error("Gemini API 호출 오류:", error); // (기존과 동일)
        locationRecommendations.push(
          // (기존과 동일)
          "지역 추천 실패", // (기존과 동일)
          "지역 추천 실패", // (기존과 동일)
          "지역 추천 실패" // 3개 버튼 모두 "지역 추천 실패" 표시 (기존과 동일)
        ); // (기존과 동일)
      } // (기존과 동일)
    }

    console.log(
      // (기존과 동일)
      "locationRecommendations.length:", // (기존과 동일)
      locationRecommendations.length // (기존과 동일)
    ); // 배열 길이 로그 (기존과 동일) // ✅ 버튼 텍스트 업데이트 (각 카드별로 3개씩) (기존과 동일)

    for (let i = 0; i < shuffledItems.length; i++) {
      // (기존과 동일)
      // shuffledItems 순회 (3번) (기존과 동일)
      for (let j = 0; j < 3; j++) {
        // (기존과 동일)
        // 각 카드별 3개의 버튼 순회 (기존과 동일)
        const buttonIndex = i * 3 + j; // 버튼 인덱스 계산 (0, 1, 2, 3, 4, 5, 6, 7, 8) (기존과 동일)
        const recommendationIndex = i * 3 + j; // 지역 추천 결과 인덱스 계산 (0, 1, 2, 3, 4, 5, 6, 7, 8) (기존과 동일)

        locationButtonElements[buttonIndex].textContent = // (기존과 동일)
          locationRecommendations[recommendationIndex] || "지역 추천 실패"; // locationRecommendations 에서 텍스트 추출 (기존과 동일)
      } // (기존과 동일)
    } // (기존과 동일)
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
