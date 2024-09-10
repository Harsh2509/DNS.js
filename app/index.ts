import * as dgram from "dgram";
import { DNSHeader, OPCODE, RCODE, type Header } from "./dns/header";

// I am using the default headers for now.
const defaultHeaders: Header = {
  id: 12,
  qr: 1, // For response, it is set   // For request, it is unset
  opcode: OPCODE.STANDARD_QUERY,
  aa: 0, // Authoritative answer
  tc: 0, // Truncated: 1 if the message is larger than 512 bytes.
  ra: 0, // Recursion available
  rd: 0, // Recursion desired
  z: 0, // Reserved for future use
  rcode: RCODE.NO_ERROR,
  qdcount: 0, // Number of questions
  ancount: 0, // Number of answers
  nscount: 0, // Number of authority records
  arcount: 0, // Number of additional records
};

console.log("Logs from your file will appear here!");

const server = dgram.createSocket("udp4");
server.bind(2053, "127.0.0.1");

server.on("message", (msg: Buffer, remoteAddress: dgram.RemoteInfo) => {
  try {
    console.log(
      `Message received from ${remoteAddress.address}:${remoteAddress.port}`
    );
    const header = DNSHeader.encode(defaultHeaders);
    const response = header;
    server.send(response, remoteAddress.port, remoteAddress.address);
  } catch (e) {
    console.log(`Error: ${e}`);
  }
});
