// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = 'http://127.0.0.1:3000';
const dbCommentTableName = 'comment';
let loginFlag = false;

// 댓글 조회
const urlParams = new URLSearchParams(window.location.search);
const serial_number = urlParams.get('id');

async function getComments() {
  try {
    const response = await fetch(`${dbUrl}/comment?id=${serial_number}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const comments = await response.json();
    console.log(comments); // 콘솔 출력은 이제 필요없으니 제거하거나 주석 처리해도 됩니다.
    return comments; //  **🌟 수정: 가져온 댓글 데이터를 반환합니다.**
  } catch (error) {
    alert('댓글 조회에 실패했습니다. 다시 시도해주세요.');
    return;
  }
}

// 댓글 추가
async function SetComment() {
  const commentValue = document.querySelector('#comment-area').value;
  if (commentValue == '') return;

  const comment = {
    c_user_id: localStorage.getItem('user_id'),
    c_s_num: serial_number,
    comment: commentValue,
    comment_day: getTime(),
  };
  console.log('comment :', comment);
  try {
    const response = await fetch(`${dbUrl}/comment/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });

    const comments = await response.json();
    console.log(comments);
    return comments;
  } catch (error) {
    alert('댓글 조회에 실패했습니다. 다시 시도해주세요.');
    return;
  }
}

// **🌟 새로운 함수: 댓글을 화면에 표시하는 함수**
function displayComments(comments) {
  const commentsContainer = document.getElementById('comments-container'); // 댓글 표시 영역 가져오기
  commentsContainer.innerHTML = ''; //  **🌟 중요: 기존 내용 비우기. 안 하면 댓글이 계속 추가됩니다.**

  if (!comments || comments.length === 0) {
    // 댓글이 없을 경우 처리
    commentsContainer.innerHTML = '<p>아직 댓글이 없습니다.</p>'; //  **🌟 댓글 없을 때 표시할 내용**
    return;
  }

  comments.forEach((comment) => {
    //  **🌟 댓글 배열 순회**
    const commentDiv = document.createElement('div'); // 댓글 하나를 감싸는 div 생성
    commentDiv.classList.add('comment'); // (선택 사항) CSS 스타일 적용을 위한 클래스 추가

    // 각 댓글 정보 (사용자 ID, 내용, 날짜)를 표시하는 HTML 요소 생성 및 내용 채우기
    const userIdElement = document.createElement('p');
    userIdElement.textContent = `작성자: ${comment.c_user_id}`;

    const commentTextElement = document.createElement('p');
    commentTextElement.textContent = comment.comment;

    const commentDateElement = document.createElement('p');
    commentDateElement.textContent = `작성일: ${comment.comment_day}`;

    // 생성한 요소들을 commentDiv에 추가
    commentDiv.appendChild(userIdElement);
    commentDiv.appendChild(commentTextElement);
    commentDiv.appendChild(commentDateElement);

    // commentDiv를 댓글 표시 영역에 추가
    commentsContainer.appendChild(commentDiv);
  });
}

function getTime() {
  var today = new Date();

  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);

  var hours = ('0' + today.getHours()).slice(-2);
  var minutes = ('0' + today.getMinutes()).slice(-2);
  var seconds = ('0' + today.getSeconds()).slice(-2);

  var timeString = hours + ':' + minutes + ':' + seconds;

  var dateString = year + '-' + month + '-' + day;

  return dateString + ' ' + timeString;
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', async () => {
  const comments = await getComments(); // 댓글 데이터 가져오기
  displayComments(comments); // 댓글 화면에 렌더링
});
