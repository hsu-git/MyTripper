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

  // TODO. 로그인 시 해당 코드 수정 필요!!
  userData.id = 14;
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

window.addEventListener('DOMContentLoaded', () => {
  aside_Active();

  // 페이지별 데이터 처리
  switch (curPage) {
    case 'mypage':
      getInfo();
      modifyInfo();
      break;
    case 'mydocument':
      break;
  }
});
