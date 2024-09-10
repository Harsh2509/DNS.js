import * as dgram from "dgram";
console.log("Logs from your file will appear here!");

const server = dgram.createSocket("udp4");
server.bind(2053, "127.0.0.1");

server.on("message", (msg: Buffer, remoteAddress: dgram.RemoteInfo) => {
  try {
    console.log(
      `Message received from ${remoteAddress.address}:${remoteAddress.port}`
    );
    const response = Buffer.from("hello from server");
    server.send(response, remoteAddress.port, remoteAddress.address);
  } catch (e) {
    console.log(`Error: ${e}`);
  }
});
