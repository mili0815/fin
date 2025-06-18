const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbFile = path.join(__dirname, "..", "weatherfit.db");
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("DB 연결 오류:", err);
  } else {
    console.log("DB 연결 성공:", dbFile);
    db.run("PRAGMA foreign_keys = ON;");
  }
});

db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      location TEXT,
      email TEXT,
      nickname TEXT
    )
    `,
    (err) => {
      if (err) console.error("users 테이블 생성 실패:", err);
      else console.log("users 테이블 생성 확인");
    }
  );

  db.run(
    `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      content TEXT,
      image TEXT,
      time DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
    `,
    (err) => {
      if (err) console.error("posts 테이블 생성 실패:", err);
      else console.log("posts 테이블 생성 확인");
    }
  );

  db.run(
    `
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      userId TEXT, 
      content TEXT,
      time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE SET NULL
    )
    `,
    (err) => {
      if (err) console.error("comments 테이블 생성 실패:", err);
      else console.log("comments 테이블 생성 확인");
    }
  );
});
// db.all("PRAGMA table_info(posts);", (err, cols) => {
//   console.log("posts 스키마:", cols);
// });

module.exports = db;
