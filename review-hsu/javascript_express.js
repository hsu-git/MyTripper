/**
 * 전역 변수 / 상태
 */
const LIMIT = 5;
let currentPage = 1;
let totalPages = 1;

// (A) 여러 MBTI 검색을 누적할 배열
let selectedMbti = [];

// (B) 텍스트 검색어 (하나만)
let currentTextSearch = "";

/**
 * (1) 페이지 로드 후 이벤트 설정
 */
window.addEventListener("DOMContentLoaded", () => {
  // (A) 페이지네이션 클릭
  const paginationEl = document.getElementById("pagination");
  paginationEl.addEventListener("click", (e) => {
    if (e.target.matches(".page-link")) {
      const pageNum = parseInt(e.target.dataset.page, 10);
      if (isNaN(pageNum)) return;
      if (pageNum < 1 || pageNum > totalPages) return;

      fetchBoardData(pageNum, selectedMbti, currentTextSearch);
    }
  });

  // (B) MBTI 드롭다운
  const mbtiSelect = document.getElementById("mbtiSelect");
  mbtiSelect.addEventListener("change", () => {
    const val = mbtiSelect.value;
    if (val === "MBTI별 게시글") {
      return;
    }
    // 중복 추가 방지
    if (!selectedMbti.includes(val)) {
      selectedMbti.push(val);
    }
    mbtiSelect.value = "MBTI별 게시글";

    renderSearchBadges();
    updateSearchResetButtonVisibility();

    fetchBoardData(1, selectedMbti, currentTextSearch);
  });

  // (C) 검색 초기화 버튼
  const btnSearchReset = document.getElementById("btnSearchReset");
  btnSearchReset.addEventListener("click", () => {
    // 모든 검색 조건 리셋
    selectedMbti = [];
    currentTextSearch = "";
    // 검색창도 비우기
    document.getElementById("textSearchInput").value = "";

    renderSearchBadges();
    updateSearchResetButtonVisibility();

    fetchBoardData(1, selectedMbti, currentTextSearch);
  });

  // (D) 텍스트 검색
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

  // (E) 검색 배지 클릭 이벤트 (MBTI / 텍스트 제거)
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
  });

  // (F) 페이지 처음 로드
  fetchBoardData(1, selectedMbti, currentTextSearch);
});

/**
 * (2) 검색 배지 렌더링 (MBTI + 텍스트)
 */
function renderSearchBadges() {
  const searchBadges = document.getElementById("searchBadges");
  searchBadges.innerHTML = "";

  // (A) MBTI 배지들
  selectedMbti.forEach((mbti) => {
    const badge = document.createElement("span");
    badge.classList.add("badge", "me-1");
    // badge.style.backgroundColor = "darkgray";
    badge.style.backgroundColor = "#934A5F";
    badge.style.color = "#E5E5E5";
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

  // (B) 텍스트 검색 배지 (하나만)
  if (currentTextSearch) {
    const textBadge = document.createElement("span");
    textBadge.classList.add("badge", "me-1");
    // textBadge.style.backgroundColor = "lightblue"; // 색 구분
    textBadge.style.backgroundColor = "#C2B4D6"; // 색 구분
    textBadge.style.color = "#57648C";
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
}

/**
 * (3) 검색 초기화 버튼 표시/숨김
 */
function updateSearchResetButtonVisibility() {
  const btnSearchReset = document.getElementById("btnSearchReset");
  // MBTI나 텍스트 검색 중 하나라도 있으면 보이기
  if (selectedMbti.length > 0 || currentTextSearch !== "") {
    btnSearchReset.style.display = "inline-block";
  } else {
    btnSearchReset.style.display = "none";
  }
}

/**
 * (4) 서버에 게시글 요청
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

    // 🔍 서버 포트를 명시 (3000)
    const res = await fetch(
      `http://localhost:3000/api/reviews?${params.toString()}`
    );
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
 * (5) 게시글 목록 렌더링
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

    // 카드 컨테이너
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mb-3", "p-3");

    cardDiv.innerHTML = `
      <!-- 링크 예시 -->
      <a
        href="/review2-KHJ/index.html?id=${serialNumber}"
        style="text-decoration: none; color: inherit; display: block;"
      >
        <div class="d-flex">
          <div style="width:80px; height:80px; overflow:hidden; background:#f0f0f0;">
            <img
              src="${imgUrl}"
              alt="이미지"
              style="width:100%; height:100%; object-fit:cover;"
            />
          </div>
          <div class="ms-3">
            <h5>${title}</h5>
            <p style="margin-bottom:5px;">${content}</p>
            ${
              review
                ? `<p style="font-size: small; color:#555; margin-bottom:0;">
                     후기: ${review}
                   </p>`
                : ""
            }
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
 * (6) 페이지네이션 (Prev, 1..N, Next)
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
