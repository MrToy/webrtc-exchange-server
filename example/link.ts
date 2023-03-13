import { io } from "socket.io-client";

const peerConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export function createDataChannel(socket_url: string, code: string) {
  return new Promise<RTCDataChannel>((resolve, reject) => {
    const socket = io(socket_url);
    const pc = new RTCPeerConnection(peerConfig);
    pc.addEventListener(
      "connectionstatechange",
      (ev) => {
        switch (pc.connectionState) {
          case "connected":
            socket.close();
            break;
        }
      },
      false
    );
    pc.addEventListener("datachannel", (ev) => {
      resolve(ev.channel);
    });
    socket.on("candidate", ([sid, candidate]) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on("answer", ([sid, answer]) => {
      pc.setRemoteDescription(answer);
    });
    socket.on("offer", async ([sid, offer]) => {
      pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      pc.setLocalDescription(answer);
      socket.emit("answer", [sid, answer]);
    });
    socket.on("link", async (sid) => {
      const dc = pc.createDataChannel("data");
      resolve(dc);
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("candidate", [sid, e.candidate]);
        }
      };
      const offer = await pc.createOffer();
      pc.setLocalDescription(offer);
      socket.emit("offer", [sid, offer]);
    });
    socket.emit("link", code);
  });
}