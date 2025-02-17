import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://xngpdlhdrzcdcwnpinot.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ3BkbGhkcnpjZGN3bnBpbm90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTYyMzU3MywiZXhwIjoyMDU1MTk5NTczfQ.ek5F4tMu89l9N_4XJo8DaVrsbpsJaVow0At2huXtXNs";
const supabase = createClient(supabaseUrl, supabaseKey);

let imageUrlToSave = null;
let mbtiToSave = null;
let mainTitleToSave = null;
let subTitleToSave = null;
let contentTextToSave = null;
let GEMINI_API_KEY_YB; // Gemini API 키 변수
let GROQ_API_KEY; // Groq API 키 변수
let TOGETHER_API_KEY_JH; // Together AI API 키 변수

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL_NAME = "gemini-1.5-flash";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"; // Groq API 엔드포인트 (✅ 재확인 완료)
const GROQ_LLAMA_MODEL = "llama3-70b-8192"; // Groq Llama 모델 이름 (✅ 사용자 설정: llama3-70b-8192)
const TOGETHER_BASE_URL = "https://api.together.xyz"; // Together AI API Base URL (✅ TOGETHER_BASE_URL 변수 선언, 오류 수정!)
const FLUX_MODEL = "black-forest-labs/FLUX.1-schnell-Free"; // Flux 모델 이름 (✅ 사용자 설정: black-forest-labs/FLUX.1-schnell-Free, 오류 수정!)

document.addEventListener("DOMContentLoaded", function () {
  // ... (기존 DOMContentLoaded 이벤트 리스너 코드와 동일) ...
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti");
  const itemResult = urlParams.get("item");
  const locationResult = urlParams.get("location");

  if (mbtiResult && itemResult && locationResult) {
    const textPrompt = generatePrompt(mbtiResult, itemResult, locationResult); // 텍스트 프롬프트 생성

    fetchApiKeys() // API 키 먼저 가져오기
      .then((keys) => {
        GEMINI_API_KEY_YB = keys.GEMINI_API_KEY_YB;
        GROQ_API_KEY = keys.GROQ_API_KEY;
        TOGETHER_API_KEY_JH = keys.TOGETHER_API_KEY_JH; // Together AI API 키 할당
        return generateImageAndDisplay(
          textPrompt,
          mbtiResult,
          itemResult,
          locationResult
        ); // 이미지 생성 및 표시 함수 호출
      })
      .catch((error) => {
        console.error("API 키 또는 이미지 생성 오류:", error);
        alert("API 키를 가져오거나 이미지를 생성하는 데 실패했습니다.");
        displayImage("default_image.jpg");
      });
  }

  // ... (기존 저장하기, 추가 질문하기 버튼 이벤트 리스너 코드와 동일) ...
});

// ✅ 수정: callAI 함수를 범용 API 호출 함수로 변경 (요청 body 파라미터 분리)
async function callAI({ url, apiKey, model, text }) {
  try {
    if (!apiKey) {
      throw new Error(`API 키가 없습니다. URL: ${url}, Model: ${model}`);
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-goog-api-key": apiKey, // Gemini API key header (Gemini 호환성 유지)
    };

    let bodyPayload = {
      model: model,
      messages: [{ content: text, role: "user" }],
    };

    // ✅ 조건부 body 파라미터 설정 (API URL 에 따라 분리)
    if (url.includes(GEMINI_BASE_URL)) {
      // Gemini API 호출인 경우
      bodyPayload.contents = [{ parts: [{ text: text }] }]; // Gemini API 용 contents 파라미터 추가
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      throw new Error(
        `API 요청 실패: ${response.status} ${response.statusText} - ${url}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API 호출 오류:", error);
    alert("AI와 연결이 끊어졌습니다.");
    return null;
  }
}

async function generateImageAndDisplay(
  textPrompt,
  mbtiResult,
  itemResult,
  locationResult
) {
  try {
    showLoading();

    // 1. Groq API 호출하여 이미지 생성 프롬프트 얻기 (llama3-70b-8192 모델 사용)
    console.log("generateImageAndDisplay 함수 내 GROQ_API_KEY:", GROQ_API_KEY);
    const imagePrompt = await callAI({
      url: GROQ_URL,
      apiKey: GROQ_API_KEY,
      model: GROQ_LLAMA_MODEL, // ✅ GROQ_LLAMA_MODEL 변수 사용 (llama3-70b-8192)
      text: `${textPrompt}에 해당하는 MBTI에 어울리는 AI 이미지 생성을 위한 200자 이내의 영어 프롬프트를 작성해줘`,
    }).then((res) => {
      console.log("Groq API 응답:", res);
      return res.choices[0].message.content;
    });

    // 2. Together AI API 호출하여 이미지 생성 (FLUX.1-schnell-Free 모델 사용)
    const imageResponse = await callAI({
      url: `${TOGETHER_BASE_URL}/v1/images/generations`, // Together AI 이미지 생성 API 엔드포인트 (✅ 재확인 필요)
      apiKey: TOGETHER_API_KEY_JH,
      model: FLUX_MODEL, // ✅ FLUX_MODEL 변수 사용 (black-forest-labs/FLUX.1-schnell-Free)
      text: imagePrompt, // Groq 에서 생성한 이미지 프롬프트 사용
    });

    if (!imageResponse || !imageResponse.data || !imageResponse.data[0].url) {
      throw new Error(
        "Together AI API 응답 오류: 이미지 URL을 찾을 수 없습니다."
      );
    }
    const imageUrl = imageResponse.data[0].url;

    // 3. AI 결과 표시 (텍스트 결과는 Gemini API 사용, 이미지 URL은 Together AI 사용)
    const geminiResult = await callGeminiAI(textPrompt);
    displayAIResult(geminiResult, imageUrl); // displayAIResult 에 imageUrl 전달
  } catch (error) {
    console.error("이미지 생성 및 표시 오류:", error);
    alert("이미지를 생성하고 표시하는 데 실패했습니다.");
    displayImage("default_image.jpg"); // 에러 발생 시 기본 이미지 표시
  } finally {
    hideLoading();
  }
}

// ✅ Gemini API 호출을 위한 별도 함수 (기존 callAI 로직 활용)
async function callGeminiAI(prompt) {
  try {
    const apiKey = GEMINI_API_KEY_YB; // Gemini API 키 사용
    if (!apiKey) {
      throw new Error("Gemini API 키가 없습니다.");
    }

    const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // Gemini API key header 사용
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

    const data = await response.json();
    if (
      !data ||
      !data.candidates ||
      !data.candidates[0].content.parts[0].text
    ) {
      throw new Error("Gemini API 응답 오류: 결과 형식이 올바르지 않습니다.");
    }
    const resultText = data.candidates[0].content.parts[0].text;
    return { result: resultText };
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    alert("AI와 연결이 끊어졌습니다.");
    return null;
  }
}

async function uploadImageToSupabase(imageDataUrl, imageName) {
  try {
    console.log("이미지 URL:", imageDataUrl); // ✅ 이미지 URL 콘솔에 직접 로그 (URL 유효성 확인)
    const proxyImageUrl = `https://nifty-curly-map.glitch.me/api/proxy-image?imageUrl=${encodeURIComponent(
      imageDataUrl
    )}`;
    const response = await fetch(proxyImageUrl); // ✅ 프록시 API 엔드포인트로 fetch 요청 (CORS 우회)
    if (!response.ok) {
      // 응답 상태 코드 체크 추가
      console.error(
        "이미지 다운로드 실패:",
        response.status,
        response.statusText
      );
      return null; // 다운로드 실패 시 null 반환
    }
    const blob = await response.blob(); // blob() 메서드 직접 사용
    const { data, error } = await supabase.storage
      .from("USERS_IMAGE")
      .upload(imageName, blob, { cacheControl: "3600", upsert: false }); // 캐시 설정 및 upsert 옵션 유지

    if (error) {
      console.error("이미지 업로드 실패:", error);
      return null;
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/USERS_IMAGE/${imageName}`;
    return imageUrl; // 이미지 URL 반환
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error); // 더 자세한 오류 메시지
    return null; // 오류 발생 시 null 반환
  }
}

async function saveImageUrlToDatabase(
  imageUrl,
  mbti,
  mainTitle,
  subTitle,
  contentText
) {
  console.log("saveImageUrlToDatabase 파라미터 (삽입):", {
    // ✅ 로그 메시지 변경 (삽입)
    imageUrl,
    mbti,
    mainTitle,
    subTitle,
    contentText,
  });
  console.log("✅ insert 직전 mbti 값:", mbti); // ✅ 로그 메시지 변경 (insert 직전)
  const { data, error } = await supabase.from("travelplan").insert([
    // ✅ update() 대신 insert() 메서드 사용, 배열 형태로 데이터 전달
    {
      plan_mbti: mbti, // ✅ plan_mbti 컬럼 포함 (삽입 시 필요)
      image_url: imageUrl,
      main_title: mainTitle,
      sub_title: subTitle,
      content_text: contentText, // time_test 컬럼은 defaultvalue: now() 에 의해 자동 설정됩니다. // serial_number 컬럼은 auto-increment (자동 증가) 설정에 의해 자동 생성됩니다.
    },
  ]); // .eq("plan_mbti", mbti); // ✅ insert() 에는 eq() 조건 불필요, 제거
  if (error) {
    console.error("❌ travelplan 테이블 데이터 삽입 실패:", error); // ✅ 오류 메시지 변경 (삽입 실패)
    alert("❌ travelplan 테이블 정보 저장 실패: " + error.message); // ✅ 알림 메시지 변경 (삽입 실패) // 또는 더 눈에 띄는 콘솔 로그 사용: // console.error("🔥🔥🔥 travelplan 테이블 삽입 실패:", error);
  } else {
    console.log("✅ travelplan 테이블 삽입 성공!"); // ✅ 성공 로그 메시지 변경 (삽입 성공)
    console.log("✅ 삽입된 데이터:", data); // ✅ 삽입된 데이터 로그 추가 (디버깅 용이)
  }
}

// ✅ 수정: displayImage 함수는 이제 이미지 URL을 인자로 받아서 처리
function displayImage(imageUrl) {
  const imageElement = document.querySelector(".image-area img");
  if (imageUrl) {
    imageElement.src = imageUrl; // 이미지 URL을 src 속성에 할당 (Data URL 또는 일반 URL)
  } else {
    imageElement.src = "default_image.jpg";
    imageElement.alt = "이미지를 불러올 수 없습니다.";
  }
}

// ✅ 수정: displayAIResult 함수에서 imageUrl 파라미터 추가 및 이미지 표시 방식 변경

async function displayAIResult(result, imageUrl) {
  if (result && result.result) {
    // 1. AI 응답 로깅
    console.log("AI 응답:", result.result);
    // 특수문자 제거를 위한 정규 표현식
    const specialCharRegex = /[#*]+/g;

    let processedResult = result.result.replace(specialCharRegex, "");

    // 2. 특수문자 제거 후 텍스트 로깅
    console.log("특수문자 제거 후 텍스트:", processedResult);

    const parts = processedResult.split("\n\n**3. ");
    const [summaryDetails] = parts;

    // 3. summaryDetails 로깅
    console.log("summaryDetails:", summaryDetails);

    if (summaryDetails) {
      const regex = /\n\n2\. /; // \n\n2. 패턴을 찾는 정규 표현식
      const parts = summaryDetails.split(regex);

      if (parts.length > 1) {
        const summary = parts[0].trim();
        const details = parts[1].trim();

        // 4. 구분자 확인 (summary 및 details 로깅)
        console.log("summary:", summary);
        console.log("details:", details);

        if (summary && details) {
          const urlParams = new URLSearchParams(window.location.search);
          const mbtiResult = urlParams.get("mbti");
          const itemResult = urlParams.get("item");
          const locationResult = urlParams.get("location");

          imageUrlToSave = imageUrl; // Together AI 에서 생성된 이미지 URL 저장
          mbtiToSave = mbtiResult;
          mainTitleToSave = itemResult;
          subTitleToSave = summary.replace("**1. 30자 요약**\n\n", "");
          contentTextToSave = details.replace(
            "**2. 추천에 대한 상세 내용 및 위치**\n\n",
            ""
          );

          document.querySelector(
            ".mainTitle h1"
          ).textContent = `${itemResult}, ${locationResult}`; // 수정된 부분 반영
          document.querySelector(".subTitle h2").textContent = subTitleToSave;
          // contentTextToSave를 <pre> 태그로 감싸서 표시
          document.querySelector(
            ".subTitle .region p"
          ).innerHTML = `<pre>${contentTextToSave}</pre>`;
          displayImage(imageUrl); // Together AI 에서 생성된 이미지 URL 을 displayImage 에 전달

          // ✅ Supabase 에 이미지 URL 및 정보 저장 (추가된 코드)
          try {
            const imageName = `image_${Date.now()}.png`; // ✅ "image_" 접두사 + 타임스탬프 (가장 단순)
            const uploadedImageUrl = await uploadImageToSupabase(
              imageUrl,
              imageName
            ); // 이미지 Data URL 대신 imageUrl 전달
            if (uploadedImageUrl) {
              console.log(
                "✅ 이미지 업로드 성공, 이제 데이터베이스에 정보 저장..."
              ); // ✅ 이 줄을 추가
              await saveImageUrlToDatabase(
                uploadedImageUrl,
                mbtiResult,
                itemResult,
                subTitleToSave,
                contentTextToSave
              );
              console.log(
                "✅ 이미지 및 정보 Supabase 저장 성공:",
                uploadedImageUrl
              ); // 성공 로그
            } else {
              console.error("❌ Supabase 이미지 업로드 실패"); // 업로드 실패 로그
            }
          } catch (supabaseError) {
            console.error("❌ Supabase 저장 오류:", supabaseError); // Supabase 저장 오류 로그
            alert(
              "⚠️ Supabase 에 이미지 및 정보를 저장하는 데 실패했습니다. 하지만 AI 결과는 정상적으로 표시됩니다."
            ); // 사용자에게 알림 (경고)
          }
        } else {
          console.error("summary 또는 details 추출 실패");
          displayImage("default_image.jpg");
        }
      }
    } else {
      console.error("parts 분리 실패");
      displayImage("default_image.jpg");
    }
  } else {
    console.error("AI 결과가 올바르지 않습니다:", result);
    alert("AI 결과를 표시하는 데 실패했습니다.");
    displayImage("default_image.jpg");
  }
}

async function displaySearchResult(result) {
  // ... (기존 displaySearchResult 함수 코드와 동일) ...
  const searchResultDiv = document.getElementById("search-result");
  if (result && result.result) {
    // 일반 텍스트 처리 (줄 바꿈 및 공백 유지)
    searchResultDiv.innerHTML = `<pre style="white-space: pre-wrap;">${result.result}</pre>`;
  } else {
    searchResultDiv.innerHTML = "<p>결과가 없습니다.</p>";
  }
}

function showLoading() {
  // ... (기존 showLoading 함수 코드와 동일) ...
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  // ... (기존 hideLoading 함수 코드와 동일) ...
  document.getElementById("loading").style.display = "none";
}

function generatePrompt(mbti, item, location) {
  // ... (기존 generatePrompt 함수 코드와 동일) ...
  return `당신은 ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 최고의 장소와 함께 즐길 거리를 추천하는 전문가입니다. 다음 질문에 대해 상세하고 구체적으로 답변해주세요.
        질문: ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 구체적인 위치와 함께 즐길만한 것을 추천해주세요.
        1. 30자 이내 요약
        2. 추천에 대한 상세 내용 및 위치 (웹사이트, 주소, 운영 시간 등 포함).
        3. ${location}에서 ${item}을(를) 더욱 특별하게 즐길 수 있는 방법 (경험, 팁, 관련 활동 등). 단, 추천하는 활동은 반드시 실제로 존재하는 것이어야 하며, 구체적인 정보를 제공해야 합니다. 만약 추천하는 활동이 존재하지 않는 경우, 유사한 대안을 제시해주세요.`; // 이미지 Data URL 형식 요청 제거 (더 이상 필요 없음)
}

async function fetchApiKeys() {
  // ... (기존 fetchApiKeys 함수 코드와 동일) ...
  try {
    const response = await fetch("https://nifty-curly-map.glitch.me/api/keys"); // 서버의 API 엔드포인트 호출
    if (!response.ok) {
      throw new Error(
        `API 키 요청 실패: ${response.status} ${response.statusText}`
      );
    }
    const keys = await response.json();
    GEMINI_API_KEY_YB = keys.GEMINI_API_KEY_YB;
    GROQ_API_KEY = keys.GROQ_API_KEY;
    TOGETHER_API_KEY_JH = keys.TOGETHER_API_KEY_JH; // Together AI API 키 할당
    console.log("API 키:", {
      GEMINI_API_KEY_YB,
      GROQ_API_KEY_JH: GROQ_API_KEY,
      TOGETHER_API_KEY_JH,
    }); // API 키 로깅 (디버깅 용)
    if (!GEMINI_API_KEY_YB || !GROQ_API_KEY || !TOGETHER_API_KEY_JH) {
      throw new Error("API 키가 응답에 없습니다.");
    }
    return keys; // 키 전체 반환 (generateImageAndDisplay 에서 사용)
  } catch (error) {
    console.error("API 키 가져오기 오류:", error);
    alert("API 키를 가져오는 중 오류가 발생했습니다.");
    return null;
  }
}
