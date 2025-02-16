// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = "http://127.0.0.1:3000";
const dbCommentTableName = "comment";

// URL에서 후기 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const serial_number = urlParams.get("serial_number");

async function getComments() {
  try {
    const response = await fetch(`${dbUrl}/comment?id=${serial_number}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const comments = await response.json();
    console.log(comments); // 콘솔 출력은 이제 필요없으니 제거하거나 주석 처리해도 됩니다.
    return comments; //  **🌟 수정: 가져온 댓글 데이터를 반환합니다.**
  } catch (error) {
    alert("댓글 조회에 실패했습니다. 다시 시도해주세요.");
    return;
  }
}

// **🌟 새로운 함수: 댓글을 화면에 표시하는 함수**
function displayComments(comments) {
  const commentsContainer = document.getElementById("comments-container"); // 댓글 표시 영역 가져오기
  commentsContainer.innerHTML = ""; //  **🌟 중요: 기존 내용 비우기. 안 하면 댓글이 계속 추가됩니다.**

  if (!comments || comments.length === 0) {
    // 댓글이 없을 경우 처리
    commentsContainer.innerHTML = "<p>아직 댓글이 없습니다.</p>"; //  **🌟 댓글 없을 때 표시할 내용**
    return;
  }

  comments.forEach((comment) => {
    //  **🌟 댓글 배열 순회**
    const commentDiv = document.createElement("div"); // 댓글 하나를 감싸는 div 생성
    commentDiv.classList.add("comment"); // (선택 사항) CSS 스타일 적용을 위한 클래스 추가

    // 각 댓글 정보 (사용자 ID, 내용, 날짜)를 표시하는 HTML 요소 생성 및 내용 채우기
    const userIdElement = document.createElement("p");
    userIdElement.textContent = `작성자: ${comment.c_user_id}`;

    const commentTextElement = document.createElement("p");
    commentTextElement.textContent = comment.comment;

    const commentDateElement = document.createElement("p");
    commentDateElement.textContent = `작성일: ${comment.comment_day}`;

    // 생성한 요소들을 commentDiv에 추가
    commentDiv.appendChild(userIdElement);
    commentDiv.appendChild(commentTextElement);
    commentDiv.appendChild(commentDateElement);

    // commentDiv를 댓글 표시 영역에 추가
    commentsContainer.appendChild(commentDiv);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  // **🌟 async 키워드 추가: getComments()가 Promise를 반환하므로 await 사용**
  const comments = await getComments(); // **🌟 await 키워드 사용: 댓글 데이터를 기다린 후 displayComments 호출**
  if (comments) {
    // 댓글 데이터가 정상적으로 왔을 경우에만 표시
    displayComments(comments); // **🌟 댓글 표시 함수 호출**
  }
});
