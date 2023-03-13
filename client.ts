import { LinkManager } from "./link";

const m = new LinkManager("http://localhost:3000", "battle");
m.on("datachannel", (dc: RTCDataChannel) => {
  dc.onopen = () => {
    dc.send("hello");
  };
  dc.onmessage = (e) => {
    console.log(e.data);
  };
  dc.onclose = () => {
    console.log("close");
  };
});
