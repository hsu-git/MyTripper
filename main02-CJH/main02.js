// API 키 및 함수 정의 (기존과 동일)
const TOGETHER_API_KEY = localStorage.getItem("TOGETHER_API_KEY");
const GROQ_API_KEY = localStorage.getItem("GROQ_API_KEY");
const GEMINI_API_KEY = localStorage.getItem("GEMINI_API_KEY");
const UNSPLASH_API_KEY = localStorage.getItem("UNSPLASH_API_KEY"); // Access Key 값

const TOGETHER_BASE_URL = "https://api.together.xyz";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const TURBO_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
const GROQ_LLAMA_MODEL = "llama3-70b-8192";
const FLUX_MODEL = "black-forest-labs/FLUX.1-schnell-Free";
const MIXTRAL_MODEL = "mixtral-8x7b-32768";
const DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";

const callGemini = async (prompt) => {
  // prompt 파라미터만 받도록 단순화
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  const modelName = "gemini-pro"; // 모델 이름 직접 지정 (gemini-pro - 더 안정적인 모델 사용)
  const action = "generateContent"; // 액션 이름 직접 지정 (generateContent)
  const url = `${baseUrl}/${modelName}:${action}`; // URL 구성 (API 키 제외)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY, // ✅ API 키 헤더에 포함
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }], // 최소한의 contents 구조
    }),
  });
  if (!response.ok) {
    const message = `Gemini API 요청 실패: ${response.status} ${response.statusText}`;
    console.error(message);
    throw new Error(message);
  }
  return await response.json();
};

async function callAI({
  // 더 이상 텍스트 생성에 직접 사용하지 않지만, 이미지 생성을 위해 남겨둠
  url,
  model,
  text,
  textForImage,
  apiKey,
  jsonMode = false,
  max_tokens,
}) {
  const payload = {
    model,
  };
  if (max_tokens) {
    payload.max_tokens = max_tokens;
  }
  if (text) {
    payload.messages = [
      {
        role: "user",
        content: text,
      },
    ];
  }
  if (textForImage) {
    payload.prompt = textForImage;
  }
  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  } // axios 대신 fetch API 사용

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    // 에러 처리: 응답이 실패인 경우 (HTTP 상태 코드 2xx 외)
    const message = `API 요청 실패: ${response.status} ${response.statusText}`;
    console.error(message);
    throw new Error(message);
  }
  return await response.json(); // JSON 형태로 파싱하여 반환
}

// 배열 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
  return array;
}

async function searchImages(query) {
  // ✅ 이미지 검색 함수 (Unsplash API 호출)
  const apiUrl = `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_API_KEY}`; // ✅ Unsplash API 검색 URL (query, API Key 포함)

  try {
    const response = await fetch(apiUrl); // ✅ Unsplash API 호출 (fetch API 사용)
    if (!response.ok) {
      // API 요청 실패 처리 (HTTP 에러 코드)
      const message = `Unsplash API 요청 실패: ${response.status} ${response.statusText}`;
      console.error(message);
      throw new Error(message); // 오류 발생 시, catch 블록으로 에러 전달
    }
    const data = await response.json(); // ✅ API 응답 JSON 파싱
    console.log("Unsplash API 응답:", data); // API 응답 데이터 확인 (개발 편의를 위해 콘솔에 출력) // ✅ 3. 이미지 URL 추출 (Unsplash API 응답에서 이미지 URL 추출)

    const imageUrls = data.results.map((result) => result.urls.regular); // ✅ Unsplash API 응답 구조에 맞춰 이미지 URL 추출 (urls.regular 사용)
    console.log("추출된 이미지 URLs:", imageUrls); // 이미지 URLs 확인 (개발 편의를 위해 콘솔에 출력)
    return imageUrls; // 이미지 URL 배열 반환
  } catch (error) {
    console.error("Unsplash API 요청 중 오류 발생:", error);
    return ["이미지 없음"]; // API 요청 실패 시, "이미지 없음" 배열 반환 (오류 처리)
  }
}

// HTML form element에 submit 이벤트 리스너 추가 (HTML 파일 <script> 태그 안에 넣거나, 별도 js 파일로 분리하여 HTML에 연결)
document.addEventListener("DOMContentLoaded", function () {
  const mbtiForm = document.getElementById("MBTI");
  const briefingForm = document.getElementById("briefing"); // 더 이상 briefingForm 은 사용하지 않지만, 일단 코드는 남겨둠
  const resultImageElement = document.getElementById("resultImage"); // 이미지 요소도 변수로 선언
  const mbtiDescriptionElement = document.getElementById("mbtiDescription"); // ✅ MBTI 설명 영역 요소 선택 // ✅ 카드 요소 및 이미지/내용 요소 선택

  const cardElements = document.querySelectorAll(".result-item"); // ✅ 카드 div 요소들
  const cardImageElements = document.querySelectorAll(".card-image"); // ✅ 카드 이미지 요소들
  const cardContentElements = document.querySelectorAll(".card-text"); // ✅ 카드 내용 요소들

  mbtiForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const text = mbtiForm.querySelector('input[type="text"]').value;

    try {
      // 2-1. 이미지를 생성하는 프롬프트 (기존 코드와 동일)
      const prompt = await callAI({
        url: GROQ_URL,
        apiKey: GROQ_API_KEY,
        model: GROQ_LLAMA_MODEL,
        text: `${text}에 해당하는 MBTI에 어울리는 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
      }).then((res) => res.choices[0].message.content);

      // 2-2. 그거에서 프롬프트만 JSON으로 추출 (기존 코드와 동일)
      const promptJSON = await callAI({
        url: GROQ_URL,
        apiKey: GROQ_API_KEY,
        model: MIXTRAL_MODEL,
        text: `${prompt}에서 AI 이미지 생성을 위해 작성된 200자 이내의 영어 프롬프트를 JSON Object로 prompt라는 key로 JSON string으로 ouput해줘`,
        jsonMode: true,
      }).then((res) => JSON.parse(res.choices[0].message.content).prompt);

      // 2-3. 그걸로 이미지를 생성 (기존 코드와 동일)
      const image = await callAI({
        url: `${TOGETHER_BASE_URL}/v1/images/generations`,
        apiKey: TOGETHER_API_KEY,
        model: FLUX_MODEL,
        text: promptJSON,
      }).then((res) => res.data[0].url);

      // 3-1. Gemini 모델로 MBTI 설명을 생성 (callGemini 사용, 프롬프트 변경!)
      const mbtiDescriptionPrompt = await callGemini(
        `**[한국어로 MBTI 유형 설명]**\n\n${text} MBTI 유형에 대해 30자 이내로 한국어로 설명해줘` // ✅ 한국어 MBTI 설명 요청
      ).then((res) => res.candidates[0].content.parts[0].text);

      // 3-2. Gemini 모델로 추천 음식을 생성 (callGemini 사용, 프롬프트 변경!)
      const foodRecommendationPrompt = await callGemini(
        `**[한국어 음식 추천]**\n\n${text} MBTI 유형에 어울리는 한국 음식 1가지를 20자 이내로 추천해줘` // ✅ 한국어 음식 추천 요청
      ).then((res) => res.candidates[0].content.parts[0].text);

      // 3-3, 3-4. Gemini 모델로 추천 액티비티 2가지 각각 생성 (callGemini 2번 호출, 프롬프트 변경!)
      const activityRecommendationPrompt1 = await callGemini(
        `**[한국어 여행 액티비티 추천 1]**\n\n${text} MBTI 유형에 어울리는 액티비티 1가지를 20자 이내로 한국어로 추천해줘` // ✅ 한국어 액티비티 추천 1 요청
      ).then((res) => res.candidates[0].content.parts[0].text);

      const activityRecommendationPrompt2 = await callGemini(
        `**[한국어 여행 액티비티 추천 2]**\n\n${text} MBTI 유형에 어울리는 액티비티 1가지를 20자 이내로 한국어로 추천해줘` // ✅ 한국어 액티비티 추천 2 요청
      ).then((res) => res.candidates[0].content.parts[0].text);

      // ✅ 3-5, 3-6, 3-7. 각 추천 결과 텍스트 기반으로 이미지 URL 검색 (searchImages 함수 3번 호출)
      const foodImageURLs = await searchImages(
        `${foodRecommendationPrompt.trim()} 음식 이미지`
      ); // 음식 이미지 검색
      const activityImageURLs1 = await searchImages(
        `${activityRecommendationPrompt1.trim()} 액티비티 이미지`
      ); // 액티비티 1 이미지 검색
      const activityImageURLs2 = await searchImages(
        `${activityRecommendationPrompt2.trim()} 액티비티 이미지`
      ); // 액티비티 2 이미지 검색

      // 4. 결과를 HTML 에 출력
      resultImageElement.src = image; // 메인 이미지: 기존 생성형 이미지 그대로 출력 (변경 없음)
      mbtiDescriptionElement.textContent = mbtiDescriptionPrompt.trim(); // MBTI 설명 출력 (기존과 동일) // ✅ 결과 텍스트-이미지 URL 쌍 배열 (카드 내용으로 사용될 텍스트 및 이미지 URL)

      const resultItems = [
        // ✅ resultTexts -> resultItems 로 변경
        { text: foodRecommendationPrompt.trim(), image: foodImageURLs[0] }, // ✅ 음식 추천 결과 (텍스트, Google Search 이미지 URL - 첫 번째 결과 사용)
        {
          text: activityRecommendationPrompt1.trim(),
          image: activityImageURLs1[0],
        }, // ✅ 액티비티 추천 1 결과 (텍스트, Google Search 이미지 URL - 첫 번째 결과 사용)
        {
          text: activityRecommendationPrompt2.trim(),
          image: activityImageURLs2[0],
        }, // ✅ 액티비티 추천 2 결과 (텍스트, Google Search 이미지 URL - 첫 번째 결과 사용)
      ]; // ✅ 텍스트-이미지 URL 쌍 배열 셔플 (✅ 중요: 카드 내용 및 이미지 URL 도 랜덤하게 섞음)

      const shuffledItems = shuffleArray([...resultItems]); // ✅ shuffledTexts -> shuffledItems 로 변경 // ✅ 셔플된 텍스트, 이미지 URL 을 카드에 순서대로 적용 (✅ 중요: 카드 내용, 이미지 모두 랜덤하게 출력)

      for (let i = 0; i < cardElements.length; i++) {
        cardImageElements[i].src = shuffledItems[i].image || "이미지 없음"; // 셔플된 이미지 URL 적용 (✅ Google Search 이미지 URL 적용, URL 없으면 "이미지 없음" 대체)
        cardContentElements[i].textContent = shuffledItems[i].text; // 셔플된 텍스트 설명 적용 (✅ 텍스트 설명 적용)
      }
    } catch (error) {
      console.error("오류 발생:", error); // ✅ 오류 발생 시, 3개 영역에 모두 오류 메시지 출력 (cardContentElements 배열 사용)
      cardContentElements.forEach((element) => {
        element.textContent = "API 요청 중 오류가 발생했습니다.";
      });
    }
  });
});
