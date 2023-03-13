import EventEmitter from "events";
import { io } from "socket.io-client";

const peerConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export class LinkManager extends EventEmitter {
  pc: RTCPeerConnection;
  constructor(socket_url: string, code: string) {
    super();
    const socket = io(socket_url);
    const pc = new RTCPeerConnection(peerConfig);
    this.pc = pc;
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
      this.onDataChannel(ev.channel);
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
      this.onDataChannel(dc);
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
  }
  onDataChannel(dc: RTCDataChannel): void {
    this.emit("datachannel", dc);
  }
}
