// review.js (CDN 방식)

// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = 'http://127.0.0.1:3000';
const dbCommentTableName = 'comment';

// URL에서 serial_number 파라미터 가져오기 (댓글과 후기글 모두 사용)
const urlParams = new URLSearchParams(window.location.search);
const serial_number = urlParams.get('id');

// Supabase 설정 (CDN 방식에서는 전역 변수 supabase 사용)
const supabaseUrl = 'https://xngpdlhdrzcdcwnpinot.supabase.co';
const supabaseApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ3BkbGhkcnpjZGN3bnBpbm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjM1NzMsImV4cCI6MjA1NTE5OTU3M30._BKCgacI_A-_vx-dN_eijau7Mo2ZFub3Dr0sFxnO4ks';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseApiKey); // ✅ supabase 전역 변수 사용

// 🌟 새로운 함수: 후기 게시글 데이터 조회 함수
async function getReviewPost(serial_number) {
    try {
        const { data: reviewPost, error } = await supabaseClient // ✅ supabaseClient 로 변경
            .from('travelplan') // 🌟 후기 게시글 테이블 이름 (실제 테이블 이름으로 변경)
            .select('sub_title, content_text, image_url') // 🌟 필요한 컬럼 선택 (실제 컬럼 이름으로 변경)
            .eq('serial_number', serial_number) // 🌟 serial_number 기준으로 특정 게시글 조회
            .single(); // 단일 게시글만 가져오기

        if (error) {
            console.error('Supabase 후기 게시글 조회 오류:', error);
            return null; // 오류 발생 시 null 반환
        }
        return reviewPost; // 조회된 후기 게시글 데이터 반환
    } catch (error) {
        console.error('후기 게시글 조회 중 오류 발생:', error);
        return null; // 오류 발생 시 null 반환
    }
}

// 댓글 조회 (기존 함수)
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

// 댓글 추가 (기존 함수)
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

// 댓글을 화면에 표시하는 함수 (기존 함수)
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

// 🌟 새로운 함수: 후기 게시글을 화면에 표시하는 함수
function displayReviewPost(reviewPost) {
    const reviewContainer = document.querySelector('.review-container'); // 후기글 + 댓글 영역 감싸는 컨테이너

    if (!reviewPost) {
        reviewContainer.innerHTML = '<p>후기 게시글을 불러올 수 없습니다.</p>'; // 게시글 없을 때 메시지 표시
        return;
    }

    // review-post div 생성 (style.css 스타일 적용)
    const reviewPostDiv = document.createElement('div');
        reviewPostDiv.classList.add('review-post');

        const titleElement = document.createElement('h2');
        titleElement.classList.add('review-title');
        titleElement.textContent = reviewPost.sub_title; // 제목

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('review-content');

        const commentElement = document.createElement('p');
        commentElement.classList.add('review-comment');
        commentElement.textContent = reviewPost.content_text; // 코멘트

        const imageElement = document.createElement('img');
        imageElement.classList.add('review-image');
        imageElement.src = reviewPost.image_url; // 이미지 URL
        imageElement.alt = '후기 이미지';

        contentDiv.appendChild(titleElement);
        contentDiv.appendChild(imageElement);
        contentDiv.appendChild(commentElement);


        reviewPostDiv.appendChild(contentDiv);

        // reviewContainer (후기글 + 댓글 영역) 안에 reviewPostDiv를 맨 위에 추가
        reviewContainer.insertBefore(reviewPostDiv, reviewContainer.firstChild); // 댓글 폼 위에 추가
}

function Check_Login() {
  const getUser_id = localStorage.getItem('user_id');
  if (!getUser_id) {
    const commentForm = document.getElementById('comment-form');
    commentForm.style.display = 'none';
  }
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', async () => {
  Check_Login();
    // URL에서 serial_number 가져오기 (async 함수 안에서 다시 가져올 필요 없음)

    // 🌟 후기 게시글 데이터 가져오기 및 표시
    const reviewPost = await getReviewPost(serial_number);
    displayReviewPost(reviewPost);

    // 댓글 데이터 가져오기 및 표시 (기존 코드)
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
