document.addEventListener("DOMContentLoaded", function () {
  // ✅ Supabase 클라이언트 초기화 (DOMContentLoaded 리스너 최상단으로 이동)
  const supabaseUrl = "https://xngpdlhdrzcdcwnpinot.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ3BkbGhkcnpjZGN3bnBpbm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjM1NzMsImV4cCI6MjA1NTE5OTU3M30._BKCgacI_A-_vx-dN_eijau7Mo2ZFub3Dr0sFxnO4ks";
  const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

  // 1. URL 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  const mbti = urlParams.get("mbti");
  const item = urlParams.get("item");
  const location = urlParams.get("location");

  // 파라미터 유효성 검사
  if (!mbti || !item || !location) {
    displayError("URL 파라미터 (mbti, item, location)를 모두 제공해주세요.");
    return;
  }

  function generatePrompt(mbti, item, location) {
    return `당신은 ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 최고의 장소와 함께 즐길 거리를 추천하는 전문가입니다. 다음 질문에 대해 상세하고 구체적으로 답변해주세요.\
               질문: ${mbti} 유형의 사람들에게 ${location}에서 ${item}을(를) 즐길 수 있는 구체적인 위치와 함께 즐길만한 것을 추천해주세요.\
               1. 30자 이내 요약\
               2. 추천에 대한 상세 내용 및 위치 (웹사이트, 주소, 운영 시간 등 포함).\
               3. ${location}에서 ${item}을(를) 더욱 특별하게 즐길 수 있는 방법 (경험, 팁, 관련 활동 등). 단, 추천하는 활동은 반드시 실제로 존재하는 것이어야 하며, 구체적인 정보를 제공해야 합니다. 만약 추천하는 활동이 존재하지 않는 경우, 유사한 대안을 제시해주세요.\
               4. 추천 장소의 이미지를 data URL 형식으로 제공해주세요.`;
  }

  const prompt = generatePrompt(mbti, item, location);

  // 3. Gemini API 호출 및 결과 처리 (API 키 직접 사용 - 보안에 유의!)
  const geminiApiKey = "AIzaSyC6zJZJrxWQhUzRx7XDwYS2_WBxLcqNSnk"; // **본인의 Gemini API 키로 변경!**
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

  fetch(geminiApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Gemini API 호출 실패: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Gemini API 응답 처리
      const responseText = data.candidates[0].content.parts[0].text;
      console.log("API Response Text:", responseText); // API 응답 텍스트 확인

      // JSON 파싱 시도 및 결과 표시, DB 저장
      processRecommendationResult(responseText);
    })
    .catch((error) => {
      console.error("API 호출 오류:", error);
      displayError("AI 추천 결과를 가져오는데 실패했습니다.");
    });

  async function processRecommendationResult(responseText) {
    let recommendationData;
    try {
      recommendationData = parseJsonResponse(responseText); // JSON 파싱
    } catch (jsonError) {
      console.warn("JSON 파싱 실패. 텍스트 응답을 그대로 사용합니다.");
      recommendationData = { details: responseText }; // JSON 파싱 실패 시 전체 텍스트를 details에 저장
    }

    displayRecommendation(recommendationData); // 결과 표시
    await saveRecommendationToDB(mbti, item, location, recommendationData); // DB 저장 (await 추가)
  }

  function parseJsonResponse(responseText) {
    // JSON 블록 추출 및 파싱
    const jsonMatch = responseText.match(/`json\s*([\s\S]*?)\s*`/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1].trim();
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        // JSON 형식은 아니지만, 텍스트 응답 처리 (예: summary, details 빈 문자열로 처리)
        return { summary: "", details: responseText, image_data_url: "" };
      }
    } else {
      // JSON 블록이 없을 경우, 전체 텍스트를 details로 처리
      console.warn("JSON 블록을 찾을 수 없습니다.");
      return { summary: "", details: responseText, image_data_url: "" };
    }
  }

  // 4. 결과 표시 함수 (HTML 구조에 맞춰 변경)
  function displayRecommendation(data) {
    const mainTitleElement = document.querySelector(".mainTitle h1"); // 메인 타이틀 (페이지 제목 용도로 사용 가능)
    const regionElement = document.querySelector(
      ".contentText .text-area .region p"
    ); // 요약
    const detailsElement = document.querySelector(".contentText .text-area p"); // 상세 내용
    const imageElement = document.querySelector(".contentText .image-area img"); // 이미지

    mainTitleElement.textContent = `${location} ${item}`;

    regionElement.textContent = data.summary
      ? data.summary
      : "요약 정보가 없습니다."; // 요약 표시
    detailsElement.innerHTML = data.details
      ? "상세 내용: <br>" + data.details.replace(/\n/g, "<br>")
      : "상세 내용이 없습니다."; // 상세 내용 표시 (줄바꿈 처리)

    if (data.image_data_url) {
      imageElement.src = data.image_data_url;
      imageElement.alt = "추천 장소 이미지";
      imageElement.onerror = function () {
        imageElement.alt = "[이미지 로드 실패]"; // 이미지 로드 실패 시 대체 텍스트
        imageElement.src = "image.jpg"; // 기본 이미지로 대체 (image.jpg 가 HTML과 같은 경로에 있어야 함)
      };
    } else {
      imageElement.src = "image.jpg"; // 이미지 URL 없는 경우 기본 이미지 표시
      imageElement.alt = "이미지 없음";
    }
  }

  // 5. 에러 표시 함수
  function displayError(message) {
    const mainTitleElement = document.querySelector(".mainTitle h1");
    mainTitleElement.textContent = "오류: " + message; // 메인 타이틀 영역에 에러 메시지 표시
    mainTitleElement.style.color = "red"; // 에러 메시지 강조 (빨간색)

    const regionElement = document.querySelector(
      ".contentText .text-area .region p"
    );
    const detailsElement = document.querySelector(".contentText .text-area p");
    const imageElement = document.querySelector(".contentText .image-area img");

    regionElement.textContent = ""; // 기존 내용 초기화
    detailsElement.innerHTML = ""; // 기존 내용 초기화
    imageElement.src = "image.jpg"; // 기본 이미지로 대체
    imageElement.alt = "기본 이미지";
  }

  // 6. Supabase DB 저장 함수
  async function saveRecommendationToDB(mbti, item, location, data) {
    const { error } = await supabase
      .from("recommendations") // **본인의 테이블 이름으로 변경!**
      .insert([
        {
          mbti: mbti,
          item: item,
          location: location,
          summary: data.summary,
          details: data.details,
          image_data_url: data.image_data_url,
        },
      ]);

    if (error) {
      console.error("DB 저장 오류:", error);
      displayError("추천 정보 저장에 실패했습니다."); // 사용자에게 에러 알림 (선택 사항)
    } else {
      console.log("DB 저장 성공!");
    }
  }
});
