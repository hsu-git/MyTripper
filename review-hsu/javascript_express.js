/**
 * 전역 변수 / 상태
 */
const LIMIT = 5;
let currentPage = 1;
let totalPages = 1;
let showReviewsOnly = false;

// 여러 MBTI 검색을 누적할 배열
let selectedMbti = [];

// 텍스트 검색어 (하나만)
let currentTextSearch = "";

/**
 * 페이지 로드 후 이벤트 설정
 */
window.addEventListener("DOMContentLoaded", () => {
  // 페이지네이션 클릭
  const paginationEl = document.getElementById("pagination");
  paginationEl.addEventListener("click", (e) => {
    if (e.target.matches(".page-link")) {
      const pageNum = parseInt(e.target.dataset.page, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        fetchBoardData(pageNum, selectedMbti, currentTextSearch);
      }
    }
  });

  // MBTI 드롭다운
  const mbtiSelect = document.getElementById("mbtiSelect");

  mbtiSelect.addEventListener("change", () => {
    const val = mbtiSelect.value;
    if (val !== "MBTI별 게시글" && !selectedMbti.includes(val)) {
      selectedMbti.push(val);
      mbtiSelect.value = "MBTI별 게시글";
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch);
    }
  });

  // 검색 초기화 버튼
  const btnSearchReset = document.getElementById("btnSearchReset");
  btnSearchReset.addEventListener("click", () => {
    // 모든 검색 조건 리셋
    selectedMbti = [];
    currentTextSearch = "";
    showReviewsOnly = false;
    // 검색창도 비우기
    document.getElementById("textSearchInput").value = "";
    document.getElementById("reviewCheckbox").checked = false;

    renderSearchBadges();
    updateSearchResetButtonVisibility();

    fetchBoardData(1, selectedMbti, currentTextSearch);
  });

  // 텍스트 검색
  const textSearchInput = document.getElementById("textSearchInput");
  const btnSearchText = document.getElementById("btnSearchText");

  btnSearchText.addEventListener("click", () => {
    currentTextSearch = textSearchInput.value.trim();
    textSearchInput.value = ""; // 검색 후 입력창 비움

    renderSearchBadges();
    updateSearchResetButtonVisibility();

    fetchBoardData(1, selectedMbti, currentTextSearch);
  });

  // 엔터 키
  textSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      currentTextSearch = textSearchInput.value.trim();
      textSearchInput.value = "";

      renderSearchBadges();
      updateSearchResetButtonVisibility();

      fetchBoardData(1, selectedMbti, currentTextSearch);
    }
  });

  // 검색 배지 클릭 이벤트 (MBTI / 텍스트 제거)
  const searchBadges = document.getElementById("searchBadges");
  searchBadges.addEventListener("click", (e) => {
    // MBTI 배지의 X 버튼
    if (e.target.matches(".mbti-remove")) {
      const mbtiVal = e.target.dataset.mbti;
      selectedMbti = selectedMbti.filter((x) => x !== mbtiVal);

      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch);
    }

    // 텍스트 검색 배지의 X 버튼
    if (e.target.matches(".text-search-remove")) {
      currentTextSearch = "";

      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch);
    }
    if (e.target.matches(".review-remove")) {
      showReviewsOnly = false;
      document.getElementById("reviewCheckbox").checked = false;
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch);
    }
  });

  const reviewCheckbox = document.getElementById("reviewCheckbox");
  reviewCheckbox.addEventListener("change", () => {
    showReviewsOnly = reviewCheckbox.checked;
    renderSearchBadges();
    updateSearchResetButtonVisibility();
    fetchBoardData(1, selectedMbti, currentTextSearch);
  });

  // 페이지 처음 로드
  fetchBoardData(1, selectedMbti, currentTextSearch);
});

/**
 * 검색 배지 렌더링 (MBTI + 텍스트) (+ 후기 필터 추가)
 */
function renderSearchBadges() {
  const searchBadges = document.getElementById("searchBadges");
  searchBadges.innerHTML = "";

  // MBTI 배지들
  selectedMbti.forEach((mbti) => {
    const badge = document.createElement("span");
    badge.classList.add("badge", "me-1");
    // badge.style.backgroundColor = "darkgray";
    badge.style.backgroundColor = "#934A5F";
    badge.style.color = "#E5E5E5";
    // badge.style.color = "#FFF6DA";
    badge.style.marginBottom = "5px";

    badge.innerHTML = `
      ${mbti}
      <button
        type="button"
        class="mbti-remove"
        data-mbti="${mbti}"
        style="border:none;background:none;color:white;margin-left:5px;"
      >
        x
      </button>
    `;
    searchBadges.appendChild(badge);
  });

  // 텍스트 검색 배지 (하나만)
  if (currentTextSearch) {
    const textBadge = document.createElement("span");
    textBadge.classList.add("badge", "me-1");
    // textBadge.style.backgroundColor = "lightblue"; // 색 구분
    textBadge.style.backgroundColor = "#C2B4D6"; // 색 구분
    textBadge.style.color = "#433E49";
    // textBadge.style.color = "#E5E5E5";
    textBadge.style.marginBottom = "5px";

    textBadge.innerHTML = `
      ${currentTextSearch}
      <button
        type="button"
        class="text-search-remove"
        style="border:none;background:none;color:white;margin-left:5px;"
      >
        x
      </button>
    `;
    searchBadges.appendChild(textBadge);
  }
  // 후기 게시글 보기 배지
  if (showReviewsOnly) {
    const reviewBadge = document.createElement("span");
    reviewBadge.classList.add("badge", "me-1");
    reviewBadge.style.backgroundColor = "#57648C";
    // reviewBadge.style.color = "#F2D7D9";
    reviewBadge.style.color = "#E5E5E5";
    reviewBadge.style.marginBottom = "5px";

    reviewBadge.innerHTML = `
      후기 게시글
      <button type="button" class="review-remove" 
        style="border:none;background:none;color:white;margin-left:5px;">x</button>
    `;
    searchBadges.appendChild(reviewBadge);
  }
}

/**
 * 검색 초기화 버튼 표시/숨김
 */
function updateSearchResetButtonVisibility() {
  const btnSearchReset = document.getElementById("btnSearchReset");
  // MBTI나 텍스트 검색 중 하나라도 있으면 보이기
  if (selectedMbti.length > 0 || currentTextSearch !== "" || showReviewsOnly) {
    btnSearchReset.style.display = "inline-block";
  } else {
    btnSearchReset.style.display = "none";
  }
}

/**
 *  서버에 게시글 요청
 */
async function fetchBoardData(page = 1, mbtiList = [], searchText = "") {
  try {
    const params = new URLSearchParams();
    params.append("page", page);

    if (mbtiList.length > 0) {
      params.append("mbti", mbtiList.join(","));
    }
    if (searchText) {
      params.append("search", searchText);
    }
    if (showReviewsOnly) {
      params.append("withReview", "true");
    }

    // 🔍 서버 포트를 명시 (3000)
    const res = await fetch(
      `http://localhost:3000/api/reviews?${params.toString()}`
    );

    // (상대 경로로 변경)
    // const res = await fetch(`/api/reviews?${params.toString()}`);
    const json = await res.json();
    // const res = await fetch(`/api/reviews?${params.toString()}`);
    // const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const { data, totalCount } = json;
    console.log("데이터:", data, "총 개수:", totalCount);

    renderBoardData(data);

    totalPages = Math.ceil((totalCount || 0) / LIMIT);
    currentPage = page;
    setupPagination(currentPage, totalPages);
  } catch (err) {
    console.error("게시글 불러오기 실패:", err);
  }
}

/**
 * 게시글 목록 렌더링
 *    - travelplan_plus 컬럼: serial_number, sub_title, content_text, review, plan_mbti, post_day, image_url
 */
function renderBoardData(data) {
  const boardList = document.getElementById("board-list");
  boardList.innerHTML = "";

  if (!data || data.length === 0) {
    boardList.innerHTML = `<p style="color:gray;">게시글이 없습니다.</p>`;
    return;
  }

  data.forEach((row) => {
    const serialNumber = row.serial_number;
    const title = row.sub_title ?? "No Title";
    const content = row.content_text ?? "";
    const mbti = row.plan_mbti ?? "-";
    const review = row.review ?? "";
    const postDay = row.post_day ?? "";
    const imgUrl = row.image_url ?? "";

    //  텍스트 줄임: 1줄 제한
    const previewContent =
      content.length > 60 ? `${content.substring(0, 60)}...` : content;
    const previewTitle =
      title.length > 30 ? `${title.substring(0, 30)}...` : title;
    const previewReview =
      review.length > 40 ? `${review.substring(0, 40)}...` : review;

    //  카드 생성
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mb-3", "p-3");

    cardDiv.innerHTML = `
      <a
        href="/review2-KHJ/index.html?id=${serialNumber}"
        style="text-decoration: none; color: inherit; display: block;"
      >
        <div class="d-flex align-items-start">
          <!-- 이미지 -->
          <div style="min-width:100px; height:100px; overflow:hidden; border-radius:10px; margin-right:15px;">
            <img
              src="${imgUrl}"
              alt="이미지"
              style="width:100px; height:100px; object-fit:cover;"
            />
          </div>

          <!-- 텍스트 내용 -->
          <div class="flex-grow-1">
            <!-- 제목 -->
            <h5 class="text-truncate" style="max-width:100%; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;font-weight: bold;">
              ${previewTitle}
            </h5>

            <!-- 본문 -->
            <p class="text-truncate" style="max-width:100%; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;">
              ${previewContent}
            </p>

            <!-- 후기 -->
            ${
              review
                ? `<p class="text-truncate" style="max-width:100%; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis; font-size: small; color:#555; margin-bottom:0;">
                     [후기] ${previewReview}
                   </p>`
                : ""
            }

            <!-- 하단 정보 -->
            <p style="font-size: small; color:#999;">
              MBTI: ${mbti} / 작성일: ${postDay}
            </p>
          </div>
        </div>
      </a>
    `;

    boardList.appendChild(cardDiv);
  });
}

/**
 * 페이지네이션 (Prev, 1..N, Next)
 */
function setupPagination(current, total) {
  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  // Prev
  const prevDisabled = current === 1 ? "disabled" : "";
  paginationEl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <button class="page-link" data-page="${current - 1}">Prev</button>
    </li>
  `;

  const maxVisibleButtons = 5;
  let startPage = Math.max(current - Math.floor(maxVisibleButtons / 2), 1);
  let endPage = startPage + maxVisibleButtons - 1;

  if (endPage > total) {
    endPage = total;
    startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
  }

  // 처음 페이지가 생략되었는지
  if (startPage > 1) {
    paginationEl.innerHTML += `
      <li class="page-item">
        <button class="page-link" data-page="1">1</button>
      </li>
      <li class="page-item disabled">
        <span class="page-link">...</span>
      </li>
    `;
  }

  // 페이지 번호
  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === current ? "active" : "";
    paginationEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  // 마지막 페이지가 생략되었는지
  if (endPage < total) {
    paginationEl.innerHTML += `
      <li class="page-item disabled">
        <span class="page-link">...</span>
      </li>
      <li class="page-item">
        <button class="page-link" data-page="${total}">${total}</button>
      </li>
    `;
  }

  // Next
  const nextDisabled = current === total ? "disabled" : "";
  paginationEl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <button class="page-link" data-page="${current + 1}">Next</button>
    </li>
  `;
}
