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
// 회원 정보 가져오기
async function getInfo() {
  const dbTableName = 'users';
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
    name.value = infoDatas[0].name;
    user_id.value = infoDatas[0].user_id;
    // password.value = infoDatas[0].password;
    mbti.value = infoDatas[0].mbti;
  } catch (error) {
    console.error(error); // 콘솔에 오류 출력
  }
}

// 내 글 가져오기

window.addEventListener('DOMContentLoaded', () => {
  aside_Active();

  // Page 별 데이터 처리
  switch (curPage) {
    case 'mypage':
      getInfo();
      break;
    case 'mydocument':
      break;
  }
});
