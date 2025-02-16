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

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mbtiResult = urlParams.get("mbti");
  const itemResult = urlParams.get("item");
  const locationResult = urlParams.get("location");

  if (mbtiResult && itemResult && locationResult) {
    const prompt = generatePrompt(mbtiResult, itemResult, locationResult);

    callAI(prompt).then((result) => {
      displayAIResult(result);
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
    2. 추천 상세 내용 및 위치, 같이 즐길만한 것들.
    3. 추천 장소의 이미지를 data URL 형식으로 제공해주세요.`;
}

async function callAI(prompt) {
  const apiKey = process.env.API_KEY;
  const response = await fetch("YOUR_AI_API_ENDPOINT", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data;
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

  const imageUrl = `${supabaseUrl}/storage/v1/object/public/USERS_IMAGE/${imageName}`;
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
  const parts = result.result.split("\n3. ");
  const [summary, details] = parts[0].split("\n2. ");
  const imageDataUrl = parts[1];

  if (imageDataUrl) {
    const imageName = `${Date.now()}.jpg`;
    const imageUrl = await uploadImageToSupabase(imageDataUrl, imageName);

    if (imageUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const mbtiResult = urlParams.get("mbti");
      const itemResult = urlParams.get("item");
      const locationResult = urlParams.get("location");

      // 전역 변수에 저장
      imageUrlToSave = imageUrl;
      mbtiToSave = mbtiResult;
      mainTitleToSave = itemResult;
      subTitleToSave = summary.replace("1. ", "");
      contentTextToSave = details;

      // 화면에 표시
      document.querySelector(".title-area h1").textContent = itemResult;
      document.querySelector(".details h2").textContent = summary.replace(
        "1. ",
        ""
      );
      document.querySelector(".details .region p").textContent = details;
      displayImage(imageUrl);
    }
  } else {
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
