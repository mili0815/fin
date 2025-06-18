const express = require("express");
const router = express.Router();
const db = require("../models/db");
const path = require("path");
const multer = require("multer");
const authenticateToken = require("../middleware/authenticateToken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 모든 게시글 조회
router.get("/", (req, res) => {
  db.all(
    `SELECT p.id, p.userId, u.nickname AS authorNickname, p.content, p.image, p.time, p.likes
     FROM posts p
     LEFT JOIN users u ON p.userId = u.id
     ORDER BY p.id DESC`,
    (err, rows) => {
      if (err) {
        console.error("게시글 조회 SQL 오류:", err);
        return res.status(500).json({ error: "게시글 조회 실패" });
      }
      res.json(rows);
    }
  );
});

// 게시글 작성
router.post("/", authenticateToken, upload.single("image"), (req, res) => {
  if (!req.user?.userId) return res.status(401).json({ error: "인증 필요" });
  const userId = req.user.userId;
  // 사용자 존재 확인
  db.get("SELECT 1 FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) return res.status(500).json({ error: "서버 오류" });
    if (!row) return res.status(400).json({ error: "유효하지 않은 사용자" });
    const content = req.body.content;
    const fileName = req.file?.filename || null;
    const time = new Date().toISOString();
    db.run(
      `INSERT INTO posts (userId, content, image, time) VALUES (?, ?, ?, ?)`,
      [userId, content, fileName, time],
      function (err2) {
        if (err2) {
          console.error("게시글 저장 SQL 오류:", err2);
          return res.status(500).json({ error: "게시글 저장 실패" });
        }
        res.status(201).json({
          id: this.lastID,
          userId,
          content,
          image: fileName,
          time,
          likes: 0,
        });
      }
    );
  });
});

// 좋아요 기능
router.post("/:id/like", (req, res) => {
  const postId = req.params.id;

  db.run(
    "UPDATE posts SET likes = likes + 1 WHERE id = ?",
    [postId],
    function (err) {
      if (err) return res.status(500).json({ error: "좋아요 실패" });
      res.json({ success: true });
    }
  );
});

// 댓글 조회
router.get("/:id/comments", (req, res) => {
  const postId = req.params.id;
  db.all(
    `SELECT c.id, c.postId, c.userId, u.nickname AS authorNickname, c.content, c.time
     FROM comments c
     LEFT JOIN users u ON c.userId = u.id
     WHERE c.postId = ?`,
    [postId],
    (err, rows) => {
      if (err) {
        console.error("댓글 조회 SQL 오류:", err);
        return res.status(500).json({ error: "댓글 조회 실패" });
      }
      res.json(rows);
    }
  );
});

// 댓글 작성
router.post("/:id/comments", authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  const content = req.body.content;
  const time = new Date().toISOString();
  db.run(
    `INSERT INTO comments (postId, userId, content, time) VALUES (?, ?, ?, ?)`,
    [postId, userId, content, time],
    function (err) {
      if (err) {
        console.error("댓글 저장 SQL 오류:", err);
        return res.status(500).json({ error: "댓글 저장 실패" });
      }
      res.status(201).json({ id: this.lastID, user: userId, content, time });
    }
  );
});

//삭제 기능
router.delete("/:id", authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;

  // 소유권 확인
  db.get("SELECT userId FROM posts WHERE id = ?", [postId], (err, row) => {
    if (err) {
      console.error("게시글 조회 오류:", err);
      return res.status(500).json({ error: "서버 오류" });
    }
    if (!row) {
      return res.status(404).json({ error: "게시글이 존재하지 않습니다." });
    }
    if (row.userId !== userId) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // 댓글 삭제 후 게시글 삭제
    db.run("DELETE FROM comments WHERE postId = ?", [postId], function (err2) {
      if (err2) {
        console.error("댓글 삭제 오류:", err2);
        return res.status(500).json({ error: "댓글 삭제 실패" });
      }
      db.run("DELETE FROM posts WHERE id = ?", [postId], function (err3) {
        if (err3) {
          console.error("게시글 삭제 오류:", err3);
          return res.status(500).json({ error: "게시글 삭제 실패" });
        }
        res.json({ success: true });
      });
    });
  });
});

module.exports = router;
