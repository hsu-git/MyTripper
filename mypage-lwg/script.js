// 페이지 로드 시 aside active 클래스 설정
const navLinks = document.querySelectorAll('.sideBar');
window.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href').split('/')[1];
    if (currentPath.includes(linkPath)) {
      link.classList.add('active');
      link.classList.remove('text-black');
    } else {
      link.classList.remove('active');
      link.classList.add('text-black');
    }
  });
});
