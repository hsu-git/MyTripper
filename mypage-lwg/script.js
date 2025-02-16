// 페이지 로드 시 aside active 클래스 설정
let curPage = '';
function aside_Active() {
  const navLinks = document.querySelectorAll('.sideBar');
  const currentPath = window.location.pathname;
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href').split('/')[1];
    if (currentPath.includes(linkPath)) {
      link.classList.add('active');
      link.classList.remove('text-black');
      getCurrentPage(currentPath);
    } else {
      link.classList.remove('active');
      link.classList.add('text-black');
    }
  });
}
// 마이페이지 메뉴 중 접속된 페이지 명 가져오기
function getCurrentPage(page) {
  page = page.split('/');
  curPage = page[page.length - 1].split('.')[0];
}

// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = 'http://127.0.0.1:3000';
const dbInfoTableName = 'users';

// 회원 정보 가져오기
const userData = {
  id: '',
  mbti: '',
  name: '',
  password: '',
  user_id: '',
};
async function getInfo() {
  const name = document.getElementById('infoName');
  const user_id = document.getElementById('infoId');
  const password = document.getElementById('infoPwd');
  const mbti = document.getElementById('infoMbti');

  userData.id = localStorage.getItem('user_id');
  try {
    const response = await fetch(`${dbUrl}/myinfo?id=${userData.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      alert('회원 정보 조회에 실패했습니다. 다시 시도해주세요.');
      return;
    }
    const infoDatas = await response.json();
    userData.name = name.value = infoDatas.name;
    userData.user_id = user_id.value = infoDatas.user_id;
    userData.password = password.value = infoDatas.password;
    userData.mbti = mbti.value = infoDatas.mbti;
    userData.id = infoDatas.id;
  } catch (error) {
    alert('회원 정보 조회에 실패했습니다. 다시 시도해주세요.');
    console.error(error);
  }
}

// 회원 정보 수정
function modifyInfo() {
  const form = document.getElementById('infoForm');
  try {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      userData.mbti = document.getElementById('infoMbti').value;
      userData.name = document.getElementById('infoName').value;
      userData.password = document.getElementById('infoPwd').value;
      userData.user_id = document.getElementById('infoId').value;

      const response = await fetch(`${dbUrl}/myinfo/modifiy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      alert('회원 정보를 변경했습니다.');
      location.href = location.href;
    });
  } catch (error) {
    console.error(error);
    alert('회원 정보 변경에 실패했습니다. 다시 시도해주세요.');
  }
}

// 내 글 가져오기
const PAGE_LIMIT = 5;
let totalPages = 1;
let totalPostCount = 0;

// 게시글 데이터를 비동기적으로 가져오는 함수
async function fetchMyPostsData(pageNum = 1) {
  const user_id = localStorage.getItem('user_id');
  const url = `${dbUrl}/mypost?id=${user_id}&pageNum=${pageNum}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`게시글 목록을 가져오는데 실패했습니다. 상태 코드: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('fetchMyPostsData 에러:', error);
    return null; // 에러 발생 시 null 또는 에러 객체 반환 고려
  }
}

// 게시글 목록을 가져오고 화면에 표시하는 메인 함수 (리팩토링)
async function getMyPosts(pageNum = 1) {
  const responseData = await fetchMyPostsData(pageNum);

  if (!responseData) {
    alert('내 글 조회에 실패했습니다. 다시 시도해주세요.'); // 더 나은 에러 처리 방식으로 개선 필요
    return;
  }

  const { data, totalCount } = responseData;
  totalPostCount = totalCount;
  makePosts(data);
  totalPages = Math.ceil((totalPostCount || 0) / PAGE_LIMIT);
  setupPagination(pageNum, totalPages);
}

function makePosts(postDatas) {
  const postDiv = document.querySelector('#post-container');
  if (!postDatas || totalPostCount === 0) {
    // "게시글 없음" 조건 명시적으로 표현
    postDiv.innerHTML = `<h5 class="fw-bold">작성된 게시글이 없습니다.</h5>`;
    return;
  }

  postDiv.innerHTML = postDatas
    .map(
      (post) => `
            <a href="../review2-KHJ/index.html?id=${post.user_id}&serial_number=${post.serial_number}" style="text-decoration: none; color: inherit; display: block;">
                <div class="d-flex">
                    <div style="width:80px; height:80px; overflow:hidden; background:#f0f0f0;">
                        <img src="${post.image_url}" alt="이미지" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div class="ms-3">
                        <h5>${post.main_title}</h5>
                        <p style="margin-bottom:5px;">${post.content_text}</p>
                        <p style="font-size: small; color:#999;">
                            MBTI: ${post.plan_mbti} / 작성일: ${post.post_day}
                        </p>
                    </div>
                </div>
            </a>`
    )
    .join('');
}

// 페이징 UI 설정 (로직 변경 없이 가독성 향상)
function setupPagination(current, total) {
  const paginationEl = document.getElementById('pagination');
  paginationEl.innerHTML = '';

  const createPageItem = (page, text = page, className = '', disabled = false) => {
    return `
            <li class="page-item ${className} ${disabled ? 'disabled' : ''}">
                <button class="page-link" data-page="${page}">${text}</button>
            </li>
        `;
  };

  // "이전" 버튼
  paginationEl.innerHTML += createPageItem(current - 1, 'Prev', current === 1 ? 'disabled' : '', current === 1);

  const maxVisibleButtons = 5;
  let startPage = Math.max(current - Math.floor(maxVisibleButtons / 2), 1);
  let endPage = startPage + maxVisibleButtons - 1;

  if (endPage > total) {
    endPage = total;
    startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
  }

  // 첫 페이지 생략 (...) 표시
  if (startPage > 1) {
    paginationEl.innerHTML += createPageItem(1, '1');
    paginationEl.innerHTML += createPageItem(0, '...', 'disabled', true); // 0 또는 특수 값으로 "..." 구분
  }

  // 페이지 번호 버튼
  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === current ? 'active' : '';
    paginationEl.innerHTML += createPageItem(i, i, activeClass);
  }

  // 마지막 페이지 생략 (...) 표시
  if (endPage < total) {
    paginationEl.innerHTML += createPageItem(0, '...', 'disabled', true); // 0 또는 특수 값으로 "..." 구분
    paginationEl.innerHTML += createPageItem(total, total);
  }

  // "다음" 버튼
  paginationEl.innerHTML += createPageItem(current + 1, 'Next', current === total ? 'disabled' : '', current === total);
}

function PageClick_Event() {
  const paginationEl = document.getElementById('pagination');
  paginationEl.addEventListener('click', (e) => {
    if (e.target.matches('.page-link')) {
      const pageNum = parseInt(e.target.dataset.page, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        return;
      }
      getMyPosts(pageNum);
      setupPagination(pageNum, totalPages);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  aside_Active();

  switch (curPage) {
    case 'mypage':
      getInfo();
      modifyInfo();
      break;
    case 'mypost':
      getMyPosts(); // 페이지 로드 시 게시글 목록 로드 (기본 페이지: 1)
      PageClick_Event();
      break;
  }
});
