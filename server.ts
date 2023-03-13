const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "*",
  },
});
app.use(cors());
app.get("/", (req, res) => {
  res.json({ ok: true });
});

const waitList = new Map();
const sockets = new Map();

io.on("connection", (socket) => {
  sockets.set(socket.id, socket);
  console.log("connection", sockets.size, socket.id);
  socket.on("link", (code) => {
    for (let [sid, c] of waitList) {
      if (c === code) {
        console.log("link start", socket.id, sid, code);
        sockets.get(sid).emit("link", socket.id);
        waitList.delete(sid);
        return;
      }
    }
    console.log("link wait", socket.id, code);
    waitList.set(socket.id, code);
  });
  socket.on("candidate", ([sid, candidate]) => {
    sockets.get(sid)?.emit("candidate", [socket.id, candidate]);
  });
  socket.on("offer", ([sid, offer]) => {
    sockets.get(sid)?.emit("offer", [socket.id, offer]);
  });
  socket.on("answer", ([sid, answer]) => {
    sockets.get(sid)?.emit("answer", [socket.id, answer]);
  });
  socket.on("disconnect", () => {
    sockets.delete(socket.id);
    waitList.delete(socket.id);
    console.log("disconnect", sockets.size, socket.id);
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on :${port}`);
});
