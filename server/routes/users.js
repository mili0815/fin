const express = require("express");
const router = express.Router();
const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = "1h";

function validateSignupInput({ id, password, email, nickname }) {
  if (!id || typeof id !== "string" || id.trim().length < 3) {
    return "유효한 아이디를 입력하세요. (최소 3자 이상)";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "유효한 이메일을 입력하세요.";
  }
  if (
    !nickname ||
    typeof nickname !== "string" ||
    nickname.trim().length === 0
  ) {
    return "닉네임을 입력하세요.";
  }
  return null;
}

router.post("/signup", async (req, res) => {
  try {
    const { id, password, location, email, nickname } = req.body;

    const validationError = validateSignupInput({
      id,
      password,
      email,
      nickname,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await new Promise((resolve, reject) => {
      db.get("SELECT 1 FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (existing) {
      return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
    }

    const hash = await bcrypt.hash(password, 8);

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, password, location, email, nickname) VALUES (?, ?, ?, ?, ?)`,
        [id, hash, location || null, email, nickname],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    const payload = { userId: id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      message: "회원가입 완료",
      user: {
        userId: id,
        id,
        email,
        nickname,
        location: location || null,
      },
      token,
    });
  } catch (err) {
    console.error("회원가입 처리 중 오류:", err);
    return res
      .status(500)
      .json({ message: "서버 오류로 회원가입에 실패했습니다." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "아이디 및 비밀번호를 입력하세요." });
    }

    // 1) DB에서 id로 사용자 조회
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      message: "로그인 성공",
      token,
      user: {
        userId: user.id,
        id: user.id,
        nickname: user.nickname,
        location: user.location,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("로그인 처리 중 오류:", err);
    return res
      .status(500)
      .json({ message: "서버 오류로 로그인에 실패했습니다." });
  }
});

module.exports = router;
