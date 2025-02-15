/*
 * 전역 변수 / 상태
 */
const LIMIT = 5; // 한 페이지에 5개
let currentPage = 1;
let totalPages = 1;

// 여러 MBTI를 누적할 배열
let selectedMbti = []; // e.g. ["ENFP","INFJ"]

/*
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

      // 현재 텍스트 검색어
      const textVal = document.getElementById("textSearchInput").value;
      // 다시 검색
      fetchBoardData(pageNum, selectedMbti, textVal);
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
    // 드롭다운 리셋
    mbtiSelect.value = "MBTI별 게시글";
    // 배지 렌더링
    renderMbtiBadges();

    // 텍스트 검색어와 함께 검색
    const textVal = document.getElementById("textSearchInput").value;
    fetchBoardData(1, selectedMbti, textVal);
  });

  // (C) 배지에서 X 버튼 클릭 -> MBTI 제거
  const mbtiBadges = document.getElementById("mbtiBadges");
  mbtiBadges.addEventListener("click", (e) => {
    if (e.target.matches(".mbti-remove")) {
      const mbtiVal = e.target.dataset.mbti;
      selectedMbti = selectedMbti.filter((x) => x !== mbtiVal);
      renderMbtiBadges();

      const textVal = document.getElementById("textSearchInput").value;
      fetchBoardData(1, selectedMbti, textVal);
    }
  });

  // (D) 텍스트 검색
  const textSearchInput = document.getElementById("textSearchInput");
  const btnSearchText = document.getElementById("btnSearchText");

  // 버튼 클릭
  btnSearchText.addEventListener("click", () => {
    const searchVal = textSearchInput.value;
    fetchBoardData(1, selectedMbti, searchVal);
    textSearchInput.value = "";
  });

  // 엔터 키
  textSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchVal = textSearchInput.value;
      fetchBoardData(1, selectedMbti, searchVal);
      textSearchInput.value = "";
    }
  });

  // (E) 페이지 처음 로드
  fetchBoardData(1, selectedMbti, "");
});

// 커스텀 색상 사용
function renderMbtiBadges() {
  const mbtiBadges = document.getElementById("mbtiBadges");
  mbtiBadges.innerHTML = "";

  selectedMbti.forEach((mbti) => {
    const badge = document.createElement("span");
    badge.classList.add("badge", "me-1");
    badge.style.backgroundColor = "darkgray"; // 예: 핑크
    badge.style.color = "white";
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
    mbtiBadges.appendChild(badge);
  });
}

/*
 * (3) 서버에 게시글 요청
 */
async function fetchBoardData(page = 1, mbtiList = [], searchText = "") {
  try {
    const params = new URLSearchParams();
    params.append("page", page);

    // 여러 MBTI를 "ENFP,INFJ" 형태로
    if (mbtiList.length > 0) {
      params.append("mbti", mbtiList.join(","));
    }
    if (searchText) {
      params.append("search", searchText);
    }

    const res = await fetch(`/api/reviews?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const { data, totalCount } = json;
    console.log("데이터:", data, "총 개수:", totalCount);

    // 게시글 렌더
    renderBoardData(data);

    // 페이지 계산
    totalPages = Math.ceil((totalCount || 0) / LIMIT);
    currentPage = page;

    // 페이지네이션 갱신
    setupPagination(currentPage, totalPages);
  } catch (err) {
    console.error("게시글 불러오기 실패:", err);
  }
}

/*
 * (4) 게시글 목록 렌더링
 */
function renderBoardData(data) {
  const boardList = document.getElementById("board-list");
  boardList.innerHTML = "";

  if (!data || data.length === 0) {
    boardList.innerHTML = `<p style="color:gray;">게시글이 없습니다.</p>`;
    return;
  }

  data.forEach((row) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mb-3", "p-3");

    cardDiv.innerHTML = `
      <div class="d-flex">
        <div style="width:80px; height:80px; overflow:hidden; background:#f0f0f0;">
          <img
            src="${row.ai_photo ?? ""}"
            alt="이미지"
            style="width:100%; height:100%; object-fit:cover;"
          />
        </div>
        <div class="ms-3">
          <h5>${row.board_title ?? "No Title"}</h5>
          <p style="margin-bottom:5px;">${row.ai_contents ?? ""}</p>
          ${
            row.rc_board_revw && row.rc_board_revw.length > 0
              ? `<p style="font-size: small; color:#555; margin-bottom:0;">
                  리뷰: ${row.rc_board_revw[0].revw_contents ?? ""}
                </p>`
              : ""
          }
          <p style="font-size: small; color:#999;">
            MBTI: ${row.mbti ?? "-"}
          </p>
        </div>
      </div>
    `;
    boardList.appendChild(cardDiv);
  });
}

/*
 * (5) 페이지네이션 (Prev, 1..N, Next)
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

  // 1..N
  for (let i = 1; i <= total; i++) {
    const activeClass = i === current ? "active" : "";
    paginationEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <button class="page-link" data-page="${i}">${i}</button>
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
