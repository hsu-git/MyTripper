// const dbUrl = 'https://nifty-curly-map.glitch.me';
const dbUrl = 'http://127.0.0.1:3000';
const dbCommentTableName = 'comment';

// URL에서 후기 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const serial_number = urlParams.get('serial_number');

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

window.addEventListener('DOMContentLoaded', () => {
  const comments = getComments();
});
