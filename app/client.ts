import * as dgram from "dgram";

const HOST = "127.0.0.1";
const PORT = 2053;
const message = new Buffer("My KungFu is Good!");
const client = dgram.createSocket("udp4");
client.bind(2054, "127.0.0.1");

client.on("message", function (msg: Buffer, rinfo: dgram.RemoteInfo) {
  // print the value of buffer
  console.log(`Message from server: ${msg.toString()}`);
  console.log(`Value of buffer: ${JSON.stringify(msg)}`);
  console.log(`Server info: ${rinfo.address}:${rinfo.port}`);
  client.close();
});

client.send(
  message,
  0,
  message.length,
  PORT,
  HOST,
  function (err: Error | null, bytes: number) {
    if (err) throw err;
    console.log("UDP message sent to " + HOST + ":" + PORT);
    console.log("Response from server: " + bytes);
  }
);
