# Webrtc Signal Server

Based on socket.io, implement a simple signaling exchange method to obtain webrtc connection.

Use the same string to match to establish a connection, suitable for p2p scenarios such as game matchmaking.

Deployed on a serverless server that supports websocket, the server is only required during signaling exchange, and can easily support large-scale connections.

For example, using the lightness of the connection of google cloud run, it is possible to ensure that the websocket is connected to the same serverless instance as much as possible


# Webrtc 信令服务器

基于socket.io, 实现一种简单的信令交换方式来获得webrtc连接

使用相同的字符串进行匹配来建立连接, 适合用于游戏匹配对战等p2p场景

部署在支持websocket的serverless服务器上, 只在信令交换期间需要服务端, 可以轻松支持大规模连接

利用google cloud run的连接轻和性, 可以尽可能保证websocket连接到同一个serverless实例上

# Client Example

[https://jsfiddle.net/7y8ugx43/](https://jsfiddle.net/7y8ugx43/)

or just see ./example/link.ts 

make sure your environment support webrtc

