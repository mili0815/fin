const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "토큰이 필요합니다." });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "잘못된 토큰 형식입니다." });
  }
  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      console.error("JWT 검증 오류:", err);
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = payload;
    next();
  });
}

module.exports = authenticateToken;
