import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const waitList: Map<WebSocket, string> = new Map();
const pairList: Map<WebSocket, WebSocket> = new Map();

app.use(cors());
app.get("/", (req, res) => {
  res.send(`
    当前等待人数: ${waitList.size}<br>
    当前配对人数: ${pairList.size}<br>
    当前等待列表: ${Array.from(waitList.values()).join(",")}
  `);
});

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log(msg);
      switch (msg.type) {
        case "link":
          {
            let isPaird = false;
            for (let [ws2, code] of waitList) {
              if (ws !== ws2 && code === msg.code) {
                isPaird = true;
                waitList.delete(ws2);
                pairList.set(ws, ws2);
                pairList.set(ws2, ws);
                ws.send(JSON.stringify({ type: "link" }));
                break;
              }
            }
            if (!isPaird) {
              waitList.set(ws, msg.code);
            }
          }
          break;
        case "candidate":
        case "offer":
        case "answer":
          pairList.get(ws)?.send(
            JSON.stringify(msg)
          );
          break;
      }
    } catch (e) {
      console.log(e);
    }
  });
  ws.on("close", () => {
    waitList.delete(ws);
    pairList.delete(ws);
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on :${port}`);
});
