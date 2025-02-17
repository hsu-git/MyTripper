// main02.js (수정 후)

// API 키 (localStorage에서 불러오기) -> .env 에서 불러오도록 수정, 이제 localStorage 사용 안함
let TOGETHER_API_KEY_JH;
let TOGETHER_API_KEY_WG;
let TOGETHER_API_KEY_HS;
let TOGETHER_API_KEY_IS;
let GROQ_API_KEY_JH;
let GEMINI_API_KEY_JH;

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

// AI API 호출 함수 (이미지 생성에 사용) (수정)
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
  } // ✅ API 응답 내용(텍스트)을 먼저 읽어서 변수에 저장 (단 한번만 호출)

  const responseText = await response.text();

  try {
    // ✅ 저장된 responseText 변수를 JSON.parse() 로 파싱
    const responseJson = JSON.parse(responseText);
    return responseJson;
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    throw error;
  }
}

// 배열 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  console.log("전달받은 MBTI 값:", mbtiResult);

  const resultImageElement = document.getElementById("resultImage");
  const mbtiDescriptionElement = document.getElementById("mbtiDescription");

  const cardElements = document.querySelectorAll(".result-item");
  const cardImageElements = document.querySelectorAll(".card-image");
  const cardContentElements = document.querySelectorAll(".card-text"); // ✅ 9개 버튼 요소 선택 (각 카드별로 3개씩)

  const locationButtonElements = document.querySelectorAll(".item-button");

  // ✅ 표시/숨김 제어할 요소들을 변수에 저장
  const imageDescriptionArea = document.querySelector(
    ".mbti-description-section .image-description-area"
  );
  const result2H3 = document.querySelector(".result2 h3"); // ✅ result2H3 정의
  const resultCards = document.querySelector(".result-cards"); // ✅ resultCards 정의

  loadingContainer.style.display = "flex"; // ✅ 로딩 시작 시 컨테이너 표시

  try {
    // ✅ 서버 API 엔드포인트 호출하여 API 키 가져오기
    const keysResponse = await fetch(
      "https://nifty-curly-map.glitch.me/api/keys"
    ); // ✅ 수정: 절대 경로 이후 수정 필요!!!!!! // const keysResponse = await fetch("/api/keys"); // 서버의 API 엔드포인트 호출 (예: /api/keys)
    if (!keysResponse.ok) {
      throw new Error(
        `API 키를 불러오는데 실패했습니다: ${keysResponse.status} ${keysResponse.statusText}`
      );
    }
    const keys = await keysResponse.json();

    TOGETHER_API_KEY_JH = keys.TOGETHER_API_KEY_JH;
    TOGETHER_API_KEY_WG = keys.TOGETHER_API_KEY_WG;
    TOGETHER_API_KEY_HS = keys.TOGETHER_API_KEY_HS;
    TOGETHER_API_KEY_IS = keys.TOGETHER_API_KEY_IS;
    GROQ_API_KEY_JH = keys.GROQ_API_KEY;
    GEMINI_API_KEY_JH = keys.GEMINI_API_KEY_JH;

    // console.log("API 키:", {
    //   TOGETHER_API_KEY_JH: TOGETHER_API_KEY_JH,
    //   TOGETHER_API_KEY_WG: TOGETHER_API_KEY_WG,
    //   TOGETHER_API_KEY_HS: TOGETHER_API_KEY_HS,
    //   TOGETHER_API_KEY_IS: TOGETHER_API_KEY_IS,
    //   GROQ_API_KEY: GROQ_API_KEY_JH,
    //   GEMINI_API_KEY_JH: GEMINI_API_KEY_JH,
    // });

    const text = mbtiResult; // ✅ URL 파라미터에서 받은 MBTI 값을 text 변수에 할당 // 이미지, MBTI 설명, 추천 음식/액티비티 생성
    const imagePrompt = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH, // ✅ .env 에서 불러온 GROQ_API_KEY 사용
      model: GROQ_LLAMA_MODEL,
      text: `${text}에 해당하는 MBTI에 어울리는 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const image = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY_JH, // ✅ .env 에서 불러온 TOGETHER_API_KEY 사용
      model: FLUX_MODEL,
      text: imagePrompt, // ✅ promptJSON 대신 imagePrompt 를 바로 사용
    }).then((res) => res.data[0].url);

    const mbtiDescriptionPrompt = await callGemini(
      // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
      `**[한국어로 MBTI 유형 설명]**\n\n${text} MBTI 유형에 대해 50자 이내로 한국어로 설명해줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const koreanCelebrityPrompt = await callGemini(
      `**[${text} 한국 연예인 이름]**\n\n  ${text}인 한국 연예인 3명을 이름만 알려줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const animeCharacterPrompt = await callGemini(
      `**[${text} 애니 캐릭터 이름]**\n\n${text}인 애니메이션 캐릭터 3명을 이름만 알려줘`
    ).then((res) => res.candidates[0].content.parts[0].text);

    const mbtiKeywordsPrompt = await callGemini(
      `**[MBTI 관련 키워드 추천]**\n\n${text} MBTI 유형을 **대표하는 키워드** 3개를 10자 이내로 추천해줘`
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
      `**[한국어 여행 액티비티 추천 2]**\n\n${text} MBTI 유형에게 어울리는 **여행 추천 액티비티** 1가지를 이름만 추천해줘. 예를 들어, 번지점프,수영 처럼 **여행 장소에서 할 수 있는 액티비티** 형태로 추천해줘. **단, 이전에 추천한 액티비티와 다른 것**으로 추천해줘`
    ).then((res) => res.candidates[0].content.parts[0].text); // ✅ Unsplash API 대신 FLUX 모델을 사용하여 이미지 생성 (음식)

    const foodImagePrompt = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH,
      model: GROQ_LLAMA_MODEL,
      text: `${foodRecommendationPrompt.trim()} 음식 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const foodImageURLs = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY_WG,
      model: FLUX_MODEL,
      text: foodImagePrompt, // ✅ foodPromptJSON 대신 foodImagePrompt 를 바로 사용
    }).then((res) => [res.data[0].url]); // 배열 형태로 반환 (기존 코드와 통일) // ✅ Unsplash API 대신 FLUX 모델을 사용하여 이미지 생성 (액티비티 1)

    const activityImagePrompt1 = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH,
      model: GROQ_LLAMA_MODEL,
      text: `${activityRecommendationPrompt1.trim()} 액티비티 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const activityImageURLs1 = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY_HS,
      model: FLUX_MODEL,
      text: activityImagePrompt1, // ✅ activityPromptJSON1 대신 activityImagePrompt1 를 바로 사용
    }).then((res) => [res.data[0].url]); // 배열 형태로 반환 (기존 코드와 통일) // ✅ Unsplash API 대신 FLUX 모델을 사용하여 이미지 생성 (액티비티 2)

    const activityImagePrompt2 = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY_JH,
      model: GROQ_LLAMA_MODEL,
      text: `${activityRecommendationPrompt2.trim()} 액티비티 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => res.choices[0].message.content);

    const activityImageURLs2 = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`,
      apiKey: TOGETHER_API_KEY_IS,
      model: FLUX_MODEL,
      text: activityImagePrompt2, // ✅ activityPromptJSON2 대신 activityImagePrompt2 를 바로 사용
    }).then((res) => [res.data[0].url]); // 배열 형태로 반환 (기존 코드와 통일)

    resultImageElement.src = image;
    mbtiDescriptionElement.innerHTML = `<span>${mbtiDescriptionPrompt.trim()}</span>`; // ✅ innerHTML 로 변경, <span> 태그로 감싸기

    // ✅ mbtiDescriptionElement 에 추가 정보 appendChild 로 추가 (재수정)
    const koreanCelebrityElement = document.createElement("p");
    koreanCelebrityElement.innerHTML = `<strong>${mbtiResult}와 유사한 한국 연예인</strong><br> ${koreanCelebrityPrompt
      .trim()
      .replace(/, /g, "<br>")}`; // ✅ <br> 태그 유지, 문자열 템플릿 `` 백틱 사용 명확화
    mbtiDescriptionElement.appendChild(koreanCelebrityElement);

    const animeCharacterElement = document.createElement("p");
    animeCharacterElement.innerHTML = `<strong>${mbtiResult}와 유사한 캐릭터</strong><br> ${animeCharacterPrompt
      .trim()
      .replace(/, /g, "<br>")}`; // ✅ <br> 태그 유지, 문자열 템플릿 `` 백틱 사용 명확화
    mbtiDescriptionElement.appendChild(animeCharacterElement);

    const mbtiKeywordsElement = document.createElement("p");
    mbtiKeywordsElement.innerHTML = `<strong>${mbtiResult} 키워드</strong><br> ${mbtiKeywordsPrompt
      .trim()
      .replace(/, /g, "<br>")}`; // ✅ <br> 태그 유지, 문자열 템플릿 `` 백틱 사용 명확화
    mbtiDescriptionElement.appendChild(mbtiKeywordsElement);

    // ✅ "결과 3개를 나열해드릴게요" 텍스트 추가 (기존 코드 유지)
    const 안내Element = document.createElement("p");
    안내Element.textContent = `\n이제 AI 가 추천한 결과를 확인해 볼까요?`;
    mbtiDescriptionElement.appendChild(안내Element);

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
    } // ✅ 각 추천 아이템별로 3개의 지역 추천 생성 (총 3번 API 호출)

    const locationRecommendations = []; // 추천 지역 저장 배열

    for (let i = 0; i < shuffledItems.length; i++) {
      // shuffledItems 순회 (3번)
      const itemText = shuffledItems[i].text;

      try {
        // ✅ Gemini API 에 3개의 지역 추천 요청 (한 번의 API 호출로 3개 추천 받기)
        const locationPrompt = await callGemini(
          // ✅ callGemini 는 이미 GEMINI_API_KEY 사용
          `**[한국어 여행 지역 추천 3곳]**\n\n${text} MBTI 유형에게 ${itemText}을(를) 즐기기 좋은 한국 여행 지역 3곳을 추천해줘. 사람들이 많이 찾는 인기 명소 위주로 각 지역은 15자 이내로 추천해줘. 추천 지역은 **평문으로 작성하고 쉼표로 구분**해서 줘`
        );
        console.log("locationPrompt:", locationPrompt);
        const locationText =
          locationPrompt.candidates[0].content.parts[0].text.trim(); // console.log("locationText:", locationText); // // locationText 로그  // // locationText 로그 // ✅ 쉼표로 구분된 지역 텍스트를 배열로 분할
        const locations = splitLocations(locationText); // ✅ 정규 표현식 기반 분할 함수 사용  // console.log("locations:", locations); // locations 배열 로그  // ✅ 분할된 지역들을 locationRecommendations 배열에 추가
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
    ); // 배열 길이 로그 // ✅ 버튼 텍스트 업데이트 (각 카드별로 3개씩)
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
    locationButtonElements.forEach((button, index) => {
      button.addEventListener("click", function () {
        // ✅ 클릭된 버튼의 텍스트 내용
        const locationText = this.textContent;
        console.log("선택된 지역:", locationText); // ✅ 현재 버튼이 속한 카드 요소 찾기

        const cardIndex = Math.floor(index / 3);
        const selectedCardContentElement = cardContentElements[cardIndex];
        const itemText = selectedCardContentElement.textContent;
        console.log("선택된 아이템:", itemText); // ✅ main03-PYB/index.html로 전달할 URL 생성

        const targetUrl = `../main03-PYB/index.html?mbti=${mbtiResult}&location=${locationText}&item=${itemText}`; // ✅ main03-PYB/index.html로 페이지 이동

        window.location.href = targetUrl;
      });
    });
  } catch (error) {
    console.error("오류 발생:", error);
    cardContentElements.forEach((element) => {
      element.textContent = "API 요청 중 오류가 발생했습니다.";
    });
    locationButtonElements.forEach((element) => {
      element.textContent = "지역 추천 실패";
    });
    resultImageElement.src = "이미지 없음"; // 메인 이미지 오류 시 "이미지 없음" 표시
  } finally {
    loadingContainer.style.display = "none"; // ✅ 로딩 완료 (성공/실패) 후 컨테이너 숨김

    // ✅ 로딩 완료 후 이미지-설명 영역, h3, result-cards  보이기
    if (imageDescriptionArea) {
      // ✅ imageDescriptionArea null 체크 추가 (안전하게 스타일 변경)
      imageDescriptionArea.style.display = "flex";
    }
    result2H3.style.display = "block"; // ✅ result2H3 (제목 요소) 로 수정 (정상)
    resultCards.style.display = "grid";
  }
});
