const peerConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export function createDataChannel(
  socket_url: string,
  code: string
): Promise<RTCDataChannel> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(socket_url);
    const pc = new RTCPeerConnection(peerConfig);
    const dc = pc.createDataChannel("data");
    console.log(dc);
    ws.addEventListener("open", () => {
      console.log("open");
      ws.send(JSON.stringify({ type: "link", code }));
    });
    ws.addEventListener("error", console.error);

    ws.addEventListener("message", async (e) => {
      console.log("received: ", e);
      try {
        const msg = JSON.parse(e.data.toString());
        switch (msg.type) {
          case "link": {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "offer", data: offer }));
            break;
          }
          case "offer": {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "answer", data: answer }));
            break;
          }
          case "answer":
            await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
            break;
          case "candidate":
            await pc.addIceCandidate(new RTCIceCandidate(msg.data));
            ws.send(JSON.stringify({ type: "candidate", data: msg.data }));
            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
    pc.addEventListener(
      "connectionstatechange",
      async (ev) => {
        switch (pc.connectionState) {
          case "connected":
            console.log("connected");
            ws.close();
            break;
        }
      },
      false
    );
    pc.onicecandidate = (e) => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            data: e.candidate,
          })
        );
      }
    };
    pc.addEventListener("datachannel", (ev) => {
      resolve(ev.channel);
    });
  });
}

// export function createDataChannel(socket_url: string, code: string) {
//   return new Promise<RTCDataChannel>((resolve, reject) => {
//     const socket = io(socket_url);
//     const pc = new RTCPeerConnection(peerConfig);
//     pc.addEventListener(
//       "connectionstatechange",
//       (ev) => {
//         switch (pc.connectionState) {
//           case "connected":
//             socket.close();
//             break;
//         }
//       },
//       false
//     );
//     pc.addEventListener("datachannel", (ev) => {
//       resolve(ev.channel);
//     });
//     socket.on("candidate", ([sid, candidate]) => {
//       pc.addIceCandidate(new RTCIceCandidate(candidate));
//     });
//     socket.on("answer", ([sid, answer]) => {
//       pc.setRemoteDescription(answer);
//     });
//     socket.on("offer", async ([sid, offer]) => {
//       pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       pc.setLocalDescription(answer);
//       socket.emit("answer", [sid, answer]);
//     });
//     socket.on("link", async (sid) => {
//       const dc = pc.createDataChannel("data");
//       resolve(dc);
//       pc.onicecandidate = (e) => {
//         if (e.candidate) {
//           socket.emit("candidate", [sid, e.candidate]);
//         }
//       };
//       const offer = await pc.createOffer();
//       pc.setLocalDescription(offer);
//       socket.emit("offer", [sid, offer]);
//     });
//     socket.emit("link", code);
//   });
// }
