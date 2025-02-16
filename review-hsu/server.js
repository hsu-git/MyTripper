import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
// 1) 상위 폴더 경로를 구하기
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// (A) 여기서 상위 폴더(MyTripper)의 "_common" 폴더를 "/common" 경로로 서빙
const parentDir = path.join(__dirname, ".."); // review-hsu의 상위 폴더
app.use("/common", express.static(path.join(parentDir, "_common")));

// Supabase 클라이언트
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/reviews?page=1&mbti=ENFP,INFJ&search=...
 * - 한 페이지에 5개씩
 * - totalCount(전체 레코드 수)도 함께 반환
 */
app.get("/api/reviews", async (req, res) => {
  try {
    // 1) 페이지네이션
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // 기본 쿼리
    // 필요한 컬럼: serial_number, sub_title, content_text, review, plan_mbti, post_day, image_url
    let query = supabase
      .from("travelplan_plus")
      .select(
        "serial_number, sub_title, content_text, review, plan_mbti, post_day, image_url",
        { count: "exact" }
      )
      .order("serial_number", { ascending: false })
      .range(start, end);

    // 필터: MBTI
    const { mbti, search } = req.query;
    if (mbti && mbti !== "MBTI별 게시글") {
      // 예: "ENFP,INFJ" → ["ENFP","INFJ"]
      const mbtiArr = mbti.split(",").map((x) => x.trim().toUpperCase());
      query = query.in("plan_mbti", mbtiArr);
    }

    // 필터: 검색어 (sub_title, content_text)
    if (search) {
      query = query.or(
        `sub_title.ilike.%${search}%,content_text.ilike.%${search}%`
      );
    }

    // 쿼리 실행
    const { data, count, error } = await query;
    if (error) throw error;

    // 응답
    res.json({
      success: true,
      data,
      totalCount: count ?? 0,
    });
  } catch (err) {
    console.error("후기 게시글 조회 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 기존 정적 서빙 (review-hsu 폴더)
app.use(express.static(__dirname));

// 라우트
// "/" → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
