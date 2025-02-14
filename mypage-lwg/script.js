let curPage = '';
// 페이지 로드 시 aside active 클래스 설정
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
function getCurrentPage(page) {
  page = page.split('/');
  curPage = page[page.length - 1].split('.')[0];
}

const dbUrl = 'https://hvkejvcyejfzecclrlkm.supabase.co';
const apiKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a2VqdmN5ZWpmemVjY2xybGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMzY1MzcsImV4cCI6MjA1NDgxMjUzN30.A7NDpEni7CZaY6tjEc0imu7jdNkD07Cz1Cm35MArmFM';
const dbTableName = 'users';

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
  try {
    const response = await fetch(`${dbUrl}/rest/v1/${dbTableName}`, {
      method: 'GET',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const infoDatas = await response.json();
    const index = 2;
    userData.name = name.value = infoDatas[index].name;
    userData.user_id = user_id.value = infoDatas[index].user_id;
    userData.password = password.value = infoDatas[index].password;
    userData.mbti = mbti.value = infoDatas[index].mbti;
    userData.id = infoDatas[index].id;
    console.log(infoDatas);
    console.log('Get UserData : ', userData);
  } catch (error) {
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
      console.log('Put UserData : ', userData.password);

      const response = await fetch(`${dbUrl}/rest/v1/${dbTableName}?id=eq.${userData.id}`, {
        method: 'PUT',
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      console.log(result);
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
