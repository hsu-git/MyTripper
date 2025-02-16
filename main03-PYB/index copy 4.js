import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://xngpdlhdrzcdcwnpinot.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ3BkbGhkcnpjZGN3bnBpbm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjM1NzMsImV4cCI6MjA1NTE5OTU3M30._BKCgacI_A-_vx-dN_eijau7Mo2ZFub3Dr0sFxnO4ks";
const supabase = createClient(supabaseUrl, supabaseKey);
let imageUrlToSave = null;
let mbtiToSave = null;
let mainTitleToSave = null;
let subTitleToSave = null;
let contentTextToSave = null;
let GEMINI_API_KEY_JH; // API 키 변수 선언 (fetchApiKeys() 에서 값 할당)
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL_NAME = "gemini-pro";
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti");
  const itemResult = urlParams.get("item");
  const locationResult = urlParams.get("location");
  if (mbtiResult && itemResult && locationResult) {
    const prompt = generatePrompt(mbtiResult, itemResult, locationResult);
    fetchApiKeys() // :흰색_확인_표시: fetchApiKeys() 함수 호출하여 API 키 먼저 가져오기
      .then(() => callAI(prompt)) // API 키 가져오기 성공 후 callAI() 호출
      .then((result) => {
        displayAIResult(result);
      })
      .catch((error) => {
        console.error("AI 결과 표시 오류:", error);
        alert("AI 결과를 표시하는 데 실패했습니다.");
        displayImage("default_image.jpg");
      });
  }
  // 저장하기 버튼 이벤트 리스너 추가
  document.getElementById("save-button").addEventListener("click", function () {
    if (
      imageUrlToSave &&
      mbtiToSave &&
      mainTitleToSave &&
      subTitleToSave &&
      contentTextToSave
    ) {
      saveImageUrlToDatabase(
        imageUrlToSave,
        mbtiToSave,
        mainTitleToSave,
        subTitleToSave,
        contentTextToSave
      );
    } else {
      alert("저장할 데이터가 없습니다.");
    }
  });
  // 추가로 질문하기 버튼 이벤트 리스너 추가
  document
    .getElementById("search-button")
    .addEventListener("click", async function () {
      const question = document.getElementById("search-input").value;
      if (!question) {
        alert("입력값이 없습니다.");
        return;
      }
      try {
        showLoading();
        const result = await callAI(question);
        displaySearchResult(result);
      } catch (error) {
        console.error("AI 연결 오류:", error);
        alert("AI와 연결이 끊어졌습니다.");
      } finally {
        hideLoading();
      }
    });
});
function generatePrompt(mbti, item, location) {
  return `당신은 ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 최고의 장소와 함께 즐길 거리를 추천하는 전문가입니다. 다음 질문에 대해 상세하고 구체적으로 답변해주세요.
        질문: ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 구체적인 위치와 함께 즐길만한 것을 추천해주세요.
        1. 30자 이내 요약
        2. 추천에 대한 상세 내용 및 위치 (웹사이트, 주소, 운영 시간 등 포함).
        3. ${location}에서 ${item}을(를) 더욱 특별하게 즐길 수 있는 방법 (경험, 팁, 관련 활동 등). 단, 추천하는 활동은 반드시 실제로 존재하는 것이어야 하며, 구체적인 정보를 제공해야 합니다. 만약 추천하는 활동이 존재하지 않는 경우, 유사한 대안을 제시해주세요.
        4. 추천 장소의 이미지를 data URL 형식으로 제공해주세요.`;
}
async function fetchApiKeys() {
  try {
    const response = await fetch("http://localhost:3000/api/keys"); // 서버의 API 엔드포인트 호출
    if (!response.ok) {
      throw new Error(
        `API 키 요청 실패: ${response.status} ${response.statusText}`
      );
    }
    const keys = await response.json();
    GEMINI_API_KEY_JH = keys.GEMINI_API_KEY; // :흰색_확인_표시: GEMINI_API_KEY_JH 에 API 키 할당
    console.log("API 키:", { GEMINI_API_KEY_JH: GEMINI_API_KEY_JH }); // API 키 로깅 (디버깅 용)
    if (!GEMINI_API_KEY_JH) {
      throw new Error("GEMINI_API_KEY가 응답에 없습니다.");
    }
    return GEMINI_API_KEY_JH;
  } catch (error) {
    console.error("API 키 가져오기 오류:", error);
    alert("API 키를 가져오는 중 오류가 발생했습니다.");
    return null;
  }
}
async function callAI(prompt) {
  try {
    const apiKey = GEMINI_API_KEY_JH; // :흰색_확인_표시: 전역 변수 GEMINI_API_KEY_JH 사용 (fetchApiKeys()에서 가져옴)
    if (!apiKey) {
      throw new Error("API 키가 없습니다.");
    }
    const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent`; // :흰색_확인_표시: Gemini API URL 직접 구성 (/call-gemini 엔드포인트 제거)
    const response = await fetch(url, {
      method: "POST", // :흰색_확인_표시: POST 요청 유지
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // :흰색_확인_표시: API 키를 x-goog-api-key 헤더에 포함 (!!!)
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
      // :흰색_확인_표시: 응답 구조 변경에 따른 결과 추출 방식 수정
      throw new Error("Gemini API 응답 오류: 결과 형식이 올바르지 않습니다.");
    }
    const resultText = data.candidates[0].content.parts[0].text; // :흰색_확인_표시: 텍스트 결과 추출
    return { result: resultText }; // :흰색_확인_표시: 결과 객체 래핑 ({ result: ... })
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    alert("AI와 연결이 끊어졌습니다.");
    return null;
  }
}
async function uploadImageToSupabase(imageDataUrl, imageName) {
  const blob = await fetch(imageDataUrl).then((r) => r.blob());
  const { data, error } = await supabase.storage
    .from("USERS_IMAGE")
    .upload(imageName, blob);
  if (error) {
    console.error("이미지 업로드 실패:", error);
    return null;
  }
  const imageUrl = `<span class="math-inline">\{supabaseUrl\}/storage/v1/object/public/USERS\_IMAGE/</span>{imageName}`;
  return imageUrl;
}
async function saveImageUrlToDatabase(
  imageUrl,
  mbti,
  mainTitle,
  subTitle,
  contentText
) {
  const { error } = await supabase
    .from("TravelPlan")
    .update({
      image_url: imageUrl,
      main_title: mainTitle,
      sub_title: subTitle,
      content_text: contentText,
    })
    .eq("plan_mbti", mbti);
  if (error) {
    console.error("이미지 URL 저장 실패:", error);
  }
}
function displayImage(imageUrl) {
  const imageElement = document.querySelector(".image-area img");
  if (imageUrl) {
    imageElement.src = imageUrl;
  } else {
    imageElement.src = "default_image.jpg";
    imageElement.alt = "이미지를 불러올 수 없습니다.";
  }
}
async function displayAIResult(result) {
  if (result && result.result) {
    const parts = result.result.split("\n\n**3. "); // :흰색_확인_표시: 수정: split 기준 변경 (\n3.  -> \n\n**3. )
    const [summaryDetails, imageDataUrl] = parts; // :흰색_확인_표시: 수정: parts 배열 구조분해 할당으로 변경
    if (summaryDetails) {
      // :흰색_확인_표시: summaryDetails 가 있을 때만 split 시도
      const [summary, details] = summaryDetails.split("\n\n**2. "); // :흰색_확인_표시: 수정: split 기준 변경 (\n2. -> \n\n**2. )
      if (summary && details) {
        // :흰색_확인_표시: summary 와 details 가 모두 있을 때만 화면 표시 시도
        const imageName = `${Date.now()}.jpg`;
        const imageUrl = await uploadImageToSupabase(imageDataUrl, imageName);
        if (imageUrl) {
          const urlParams = new URLSearchParams(window.location.search);
          const mbtiResult = urlParams.get("mbti");
          const itemResult = urlParams.get("item");
          const locationResult = urlParams.get("location"); // 전역 변수에 저장
          imageUrlToSave = imageUrl;
          mbtiToSave = mbtiResult;
          mainTitleToSave = itemResult;
          subTitleToSave = summary.replace("**1. 30자 요약**\n\n", ""); // :흰색_확인_표시: 수정: summary 추출 및 "1. " 제거 방식 변경
          contentTextToSave = details.replace(
            "**2. 추천에 대한 상세 내용 및 위치**\n\n",
            ""
          ); // :흰색_확인_표시: 수정: details 추출 및 "2. " 제거 방식 변경 // 화면에 표시
          document.querySelector(".mainTitle h1").textContent = itemResult; // :흰색_확인_표시: 수정: .title-area -> .mainTitle
          document.querySelector(".subTitle h2").textContent = subTitleToSave; // :흰색_확인_표시: 수정: .details -> .subTitle
          document.querySelector(".subTitle .region p").textContent =
            contentTextToSave; // :흰색_확인_표시: 수정: .details -> .subTitle
          displayImage(imageUrl);
        }
      } else {
        console.error("summary 또는 details 추출 실패"); // :흰색_확인_표시: [추가] summary 또는 details 추출 실패 로그
        displayImage("default_image.jpg");
      }
    } else {
      console.error("parts 분리 실패"); // :흰색_확인_표시: [추가] parts 분리 실패 로그
      displayImage("default_image.jpg");
    }
  } else {
    console.error("AI 결과가 올바르지 않습니다:", result);
    alert("AI 결과를 표시하는 데 실패했습니다.");
    displayImage("default_image.jpg");
  }
}
async function displaySearchResult(result) {
  const searchResultDiv = document.getElementById("search-result");
  if (result && result.result) {
    // 일반 텍스트 처리 (줄 바꿈 및 공백 유지)
    searchResultDiv.innerHTML = `<pre style="white-space: pre-wrap;">${result.result}</pre>`;
  } else {
    searchResultDiv.innerHTML = "<p>결과가 없습니다.</p>";
  }
}
function showLoading() {
  document.getElementById("loading").style.display = "block";
}
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}
