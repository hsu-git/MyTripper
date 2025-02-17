const LIMIT = 5;
let currentPage = 1;
let totalPages = 1;
let showReviewsOnly = false;
let selectedMbti = [];
let currentTextSearch = "";
let currentSort = "recent"; // Added to keep track of current sort

window.addEventListener("DOMContentLoaded", () => {
  const paginationEl = document.getElementById("pagination");
  paginationEl.addEventListener("click", (e) => {
    if (e.target.matches(".page-link")) {
      const pageNum = parseInt(e.target.dataset.page, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        fetchBoardData(pageNum, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
      }
    }
  });

  const mbtiSelect = document.getElementById("mbtiSelect");
  mbtiSelect.addEventListener("change", () => {
    const val = mbtiSelect.value;
    if (val !== "MBTI별 게시글" && !selectedMbti.includes(val)) {
      selectedMbti.push(val);
      mbtiSelect.value = "MBTI별 게시글";
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
    }
  });

  const btnSearchReset = document.getElementById("btnSearchReset");
  btnSearchReset.addEventListener("click", () => {
    selectedMbti = [];
    currentTextSearch = "";
    document.getElementById("textSearchInput").value = "";
    renderSearchBadges();
    updateSearchResetButtonVisibility();
    fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
  });

  const textSearchInput = document.getElementById("textSearchInput");
  const btnSearchText = document.getElementById("btnSearchText");

  btnSearchText.addEventListener("click", () => {
    currentTextSearch = textSearchInput.value.trim();
    textSearchInput.value = "";
    renderSearchBadges();
    updateSearchResetButtonVisibility();
    fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
  });

  textSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      currentTextSearch = textSearchInput.value.trim();
      textSearchInput.value = "";
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
    }
  });

  const searchBadges = document.getElementById("searchBadges");
  searchBadges.addEventListener("click", (e) => {
    if (e.target.matches(".mbti-remove")) {
      const mbtiVal = e.target.dataset.mbti;
      selectedMbti = selectedMbti.filter((x) => x !== mbtiVal);
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
    }

    if (e.target.matches(".text-search-remove")) {
      currentTextSearch = "";
      renderSearchBadges();
      updateSearchResetButtonVisibility();
      fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
    }
  });

  fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Initial fetch with currentSort
});

function renderSearchBadges() {
  const searchBadges = document.getElementById("searchBadges");
  searchBadges.innerHTML = "";

  selectedMbti.forEach((mbti) => {
    const badge = document.createElement("span");
    badge.classList.add("badge", "me-1");
    badge.style.backgroundColor = "#934A5F";
    badge.style.color = "#E5E5E5";
    badge.style.marginBottom = "5px";

    badge.innerHTML = `
      ${mbti}
      <button type="button" class="mbti-remove" data-mbti="${mbti}" style="border:none;background:none;color:white;margin-left:5px;">x</button>
    `;
    searchBadges.appendChild(badge);
  });

  if (currentTextSearch) {
    const textBadge = document.createElement("span");
    textBadge.classList.add("badge", "me-1");
    textBadge.style.backgroundColor = "#C2B4D6";
    textBadge.style.color = "#433E49";
    textBadge.style.marginBottom = "5px";

    textBadge.innerHTML = `
      ${currentTextSearch}
      <button type="button" class="text-search-remove" style="border:none;background:none;color:white;margin-left:5px;">x</button>
    `;
    searchBadges.appendChild(textBadge);
  }
}

function updateSearchResetButtonVisibility() {
  const btnSearchReset = document.getElementById("btnSearchReset");
  if (selectedMbti.length > 0 || currentTextSearch !== "") {
    btnSearchReset.style.display = "inline-block";
  } else {
    btnSearchReset.style.display = "none";
  }
}

async function fetchBoardData(page = 1, mbtiList = [], searchText = "", sort = "recent") { // Added sort parameter
  try {
    const params = new URLSearchParams();
    params.append("page", page);

    if (mbtiList.length > 0) {
      params.append("mbti", mbtiList.join(","));
    }
    if (searchText) {
      params.append("search", searchText);
    }
    params.append("sort", sort); // Use the sort parameter

    const res = await fetch(
      `http://localhost:3000/api/reviews?${params.toString()}`
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const { data, totalCount } = json;
    renderBoardData(data);

    totalPages = Math.ceil((totalCount || 0) / LIMIT);
    currentPage = page;
    setupPagination(currentPage, totalPages);
  } catch (err) {
    console.error("게시글 불러오기 실패:", err);
  }
}

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
    const postDay = row.post_day ?? "";
    const imgUrl = row.image_url ?? "";
    const commentCount = row.comment_count ?? 0;

    console.log(`ℹ️ 댓글 수 디버그: ${serialNumber} → ${commentCount}`); // 디버그용 로그

    const previewContent =
      content.length > 60 ? `${content.substring(0, 60)}...` : content;
    const previewTitle =
      title.length > 30 ? `${title.substring(0, 30)}...` : title;

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mb-3", "p-3");
    cardDiv.style.position = "relative";

    // --------  MODIFIED PART: Added <a> tag around the entire card --------
    cardDiv.innerHTML = `
      <a href="../review2-KHJ/index.html?id=${serialNumber}" style="text-decoration: none; color: inherit; display: block;">
        <div class="d-flex align-items-start">
          <div style="min-width:100px; height:100px; overflow:hidden; border-radius:10px; margin-right:15px;">
            <img src="${imgUrl}" alt="이미지" style="width:100px; height:100px; object-fit:cover;" />
          </div>
          <div class="flex-grow-1">
            <h5 class="text-truncate" style="max-width:100%; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;font-weight: bold;">
              ${previewTitle}
            </h5>
            <p class="text-truncate" style="max-width:100%; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;">
              ${previewContent}
            </p>
            <p style="font-size: small; color:#999;">
              MBTI: ${mbti} / 작성일: ${postDay}
            </p>
          </div>
        </div>
        <div class="comment-count">
          <img src="../review-hsu/comment-icon.png" alt="댓글 아이콘" />
          <span>${commentCount}</span>
        </div>
      </a>
       `; // --------  MODIFIED PART: Closing <a> tag --------

    boardList.appendChild(cardDiv);
  });
}

function setupPagination(current, total) {
  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

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

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === current ? "active" : "";
    paginationEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

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

  const nextDisabled = current === total ? "disabled" : "";
  paginationEl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <button class="page-link" data-page="${current + 1}">Next</button>
    </li>
  `;
}


document.getElementById("btnSortRecent").addEventListener("click", () => {
  currentSort = "recent";
  document.getElementById("btnSortRecent").classList.add("active");
  document.getElementById("btnSortComment").classList.remove("active");
  fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
});

document.getElementById("btnSortComment").addEventListener("click", () => {
  currentSort = "comment";
  document.getElementById("btnSortComment").classList.add("active");
  document.getElementById("btnSortRecent").classList.remove("active");
  fetchBoardData(1, selectedMbti, currentTextSearch, currentSort); // Pass currentSort
});