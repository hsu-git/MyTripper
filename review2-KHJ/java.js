// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = 'http://127.0.0.1:3000';
const dbCommentTableName = 'comment';

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
    console.log(comments);
    return comments;
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

    // ✨✨✨ 수정된 부분: 댓글 추가 후 댓글 목록 새로고침 및 입력창 초기화 ✨✨✨
    const updatedComments = await getComments();
    displayComments(updatedComments);
    document.querySelector('#comment-area').value = ''; // 댓글 입력창 비우기

    return comments;
  } catch (error) {
    alert('댓글 추가에 실패했습니다. 다시 시도해주세요.'); // 알림 메시지 변경
    return;
  }
}

// **🌟 새로운 함수: 댓글을 화면에 표시하는 함수**
function displayComments(comments) {
  const commentsContainer = document.getElementById('comments-container');
  commentsContainer.innerHTML = '';

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML = '<p>아직 댓글이 없습니다.</p>';
    return;
  }

  comments.forEach((comment) => {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');

    const userIdElement = document.createElement('p');
    userIdElement.textContent = `작성자: ${comment.c_user_id}`;

    const commentTextElement = document.createElement('p');
    commentTextElement.textContent = comment.comment;

    const commentDateElement = document.createElement('p');
    // ✨✨✨ 수정된 부분: 작성일 T -> 공백 치환 ✨✨✨
    commentDateElement.textContent = `작성일: ${comment.comment_day.replace('T', ' ')}`;

    commentDiv.appendChild(userIdElement);
    commentDiv.appendChild(commentTextElement);
    commentDiv.appendChild(commentDateElement);

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

function Check_Login() {
  const getUser_id = localStorage.getItem('user_id');
  if (!getUser_id) {
    const commentForm = document.getElementById('comment-form');
    commentForm.style.display = 'none';
  }
}

// 페이지 로드 및 Submit 버튼 이벤트 리스너 설정
window.addEventListener('DOMContentLoaded', async () => {
  Check_Login();

  const comments = await getComments();
  displayComments(comments);

  // ✨✨✨ Submit 버튼 클릭 이벤트 리스너 ✨✨✨
  const submitButton = document.getElementById('submit-button'); // Submit 버튼 ID
  if (submitButton) {
    submitButton.addEventListener('click', async (event) => {
      event.preventDefault(); //  form submit 방지 (필요에 따라)
      await SetComment();
    });
  }
});
