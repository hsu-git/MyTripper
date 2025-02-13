function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => (document.getElementById(id).innerHTML = data));
}

// 헤더와 푸터 로드
loadComponent('header', 'header.html');
loadComponent('footer', 'footer.html');
