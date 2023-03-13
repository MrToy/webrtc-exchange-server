import { createDataChannel } from "./link";

const dc = await createDataChannel("https://webrtc-exchange-server-k7nz4l6d5q-as.a.run.app", "test");
dc.onopen = () => {
  dc.send("hello");
};
dc.onmessage = (e) => {
  console.log(e.data);
};
dc.onclose = () => {
  console.log("close");
};
