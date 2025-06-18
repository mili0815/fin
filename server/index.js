const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("./models/db");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const postsRouter = require("./routes/posts");
const authRouter = require("./routes/users");
app.use("/backend/posts", postsRouter);
app.use("/backend/users", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
