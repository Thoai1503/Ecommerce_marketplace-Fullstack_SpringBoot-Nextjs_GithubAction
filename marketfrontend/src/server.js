import express from "express";
import next from "next";
import path from "path";

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // 🔥 QUAN TRỌNG: serve ảnh
  server.use(
    "/image",
    express.static(path.join(process.cwd(), "public/image"))
  );

  server.all("*", (req, res) => handle(req, res));

  server.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
  });
});