const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(cors());

const SUPABASE_URL = "https://YOUR-SUPABASE-URL.supabase.co";
const SUPABASE_KEY = "YOUR-SUPABASE-API-KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SECRET_KEY = "your_secret_key"; // JWT 서명 키

// 회원가입 API
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supabase users 테이블에 저장
    const { data, error } = await supabase
        .from("users")
        .insert([{ email, password: hashedPassword }]);

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: "회원가입 성공!" });
});

// 로그인 API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Supabase에서 사용자 조회
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (error || !data) {
        return res.status(401).json({ message: "이메일이 존재하지 않음" });
    }

    // 비밀번호 검증
    const validPassword = await bcrypt.compare(password, data.password);
    if (!validPassword) {
        return res.status(401).json({ message: "비밀번호가 틀림" });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ email: data.email }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
});

// 서버 실행
app.listen(3000, () => console.log("서버 실행 중... http://localhost:3000"));
