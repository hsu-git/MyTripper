import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const SUPABASE_URL = "https://hvkejvcyejfzecclrlkm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a2VqdmN5ZWpmemVjY2xybGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMzY1MzcsImV4cCI6MjA1NDgxMjUzN30.A7NDpEni7CZaY6tjEc0imu7jdNkD07Cz1Cm35MArmFM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// URL에서 후기 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const reviewId = urlParams.get("id");

let currentUserId = "본인 user id"; // 임시 사용자 ID, 실제로는 로그인된 사용자 ID를 가져와야 함.

async function fetchComments(reviewId) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, author_id, created_at, users(username)") // id 추가
    .eq("review_id", reviewId)
    .order("created_at");

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data;
}

async function createComment(reviewId, content) {
  const { data, error } = await supabase.from("comments").insert([
    {
      review_id: reviewId,
      content: content,
      author_id: currentUserId, // 현재 사용자 ID
    },
  ]);

  if (error) {
    console.error("Error creating comment:", error);
  }

  return data;
}

async function updateComment(commentId, content) {
  const { error } = await supabase
    .from("comments")
    .update({ content: content })
    .eq("id", commentId);

  if (error) {
    console.error("Error updating comment:", error);
  }
}

async function deleteComment(commentId) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
  }
}

if (reviewId) {
  const comments = await fetchComments(reviewId);
  const commentsContainer = document.getElementById("comments-container");
  comments.forEach((comment) => {
    addCommentToPage(comment);
  });
}

const commentForm = document.querySelector(".comment-form");
commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const commentText = commentForm.querySelector("textarea").value;

  createComment(reviewId, commentText).then((newComment) => {
    if (newComment) {
      addCommentToPage(newComment[0]);
      commentForm.reset();
    }
  });
});

function addCommentToPage(comment) {
  const commentsContainer = document.getElementById("comments-container");
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  commentDiv.dataset.commentId = comment.id; // data-comment-id 속성 추가
  commentDiv.innerHTML = `
            <div class="comment-author">${comment.users.username}</div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <button class="btn btn-sm btn-link comment-edit">수정</button>
                <button class="btn btn-sm btn-link comment-delete">삭제</button>
            </div>
        `;
  commentsContainer.appendChild(commentDiv);

  const editButton = commentDiv.querySelector(".comment-edit");
  editButton.addEventListener("click", () => {
    const commentContent = commentDiv.querySelector(".comment-content");
    const editForm = document.createElement("form");
    editForm.innerHTML = `
                <textarea>${comment.content}</textarea>
                <button type="submit">저장</button>
                <button type="button">취소</button>
            `;

    commentDiv.replaceChild(editForm, commentContent);

    editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newContent = editForm.querySelector("textarea").value;
      const commentId = commentDiv.dataset.commentId; // commentId 가져오기

      updateComment(commentId, newContent).then(() => {
        comment.content = newContent; // 댓글 내용 업데이트
        commentContent.textContent = newContent; // 화면 내용 업데이트
        commentDiv.replaceChild(commentContent, editForm); // 수정 폼 제거
      });
    });

    editForm
      .querySelector('button[type="button"]')
      .addEventListener("click", () => {
        commentDiv.replaceChild(commentContent, editForm);
      });
  });

  const deleteButton = commentDiv.querySelector(".comment-delete");
  deleteButton.addEventListener("click", () => {
    const commentId = commentDiv.dataset.commentId; // commentId 가져오기
    deleteComment(commentId).then(() => {
      commentDiv.remove();
    });
  });
}
