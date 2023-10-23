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
  return new Promise((resolve) => {
    const ws = new WebSocket(socket_url);
    const pc = new RTCPeerConnection(peerConfig);
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "link", code }));
    });
    ws.addEventListener("error", console.error);

    ws.addEventListener("message", async (e) => {
      // console.log("received: ", e);
      try {
        const msg = JSON.parse(e.data.toString());
        switch (msg.type) {
          case "link": {
            const dc = pc.createDataChannel("data");
            resolve(dc);
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
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "candidate", data: msg.data }));
            }
            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
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
    pc.addEventListener("datachannel", (ev) => {
      resolve(ev.channel);
    });
  });
}
