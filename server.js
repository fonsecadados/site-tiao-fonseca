const path = require("path");
const express = require("express");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const app = express();

app.use(
  express.static(publicDir, {
    extensions: ["html"],
    maxAge: "1d",
    setHeaders(res, filePath) {
      if (path.extname(filePath) === ".html") {
        res.setHeader("Cache-Control", "no-cache");
      }
    }
  })
);

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Site rodando em http://localhost:${PORT}`);
});
