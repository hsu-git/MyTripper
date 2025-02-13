// aside html 불러오기
function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => (document.getElementById(id).innerHTML = data));
}

loadComponent('aside', 'aside.html');
