document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded 이벤트 발생!"); // 로그 추가
  const supabaseUrl = "https://xngpdlhdrzcdcwnpinot.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ3BkbGhkcnpjZGN3bnBpbm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjM1NzMsImV4cCI6MjA1NTE5OTU3M30._BKCgacI_A-_vx-dN_eijau7Mo2ZFub3Dr0sFxnO4ks";

  console.log("Supabase 초기화 시도..."); // 로그 추가
  const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase 클라이언트 초기화 완료:", supabase); // 로그 추가

  if (supabase) {
    console.log("Supabase 객체 생성 성공!"); // 성공 로그
  } else {
    console.error("Supabase 객체 생성 실패!"); // 실패 로그
  }

  console.log("DOMContentLoaded 함수 종료."); // 로그 추가
});

console.log("index.js 파일 로드됨."); // index.js 파일 로드 시점 로그
