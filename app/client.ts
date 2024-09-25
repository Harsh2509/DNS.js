import * as dgram from "dgram";
import { DNSHeader, OPCODE, RCODE, type Header } from "./dns/header";
import { DNSQuestion, QuestionClass, QuestionType } from "./dns/question";

// Sending this header from the client to the server
const defaultHeaders: Header = {
  id: 12,
  qr: 0, // For response, it is set   // For request, it is unset
  opcode: OPCODE.STANDARD_QUERY,
  aa: 0, // Authoritative answer
  tc: 0, // Truncated: 1 if the message is larger than 512 bytes.
  ra: 0, // Recursion available
  rd: 0, // Recursion desired
  z: 0, // Reserved for future use
  rcode: RCODE.NO_ERROR,
  qdcount: 1, // Number of questions
  ancount: 0, // Number of answers
  nscount: 0, // Number of authority records
  arcount: 0, // Number of additional records
};


const defaultQuestion = [{
  qname: "www.google.com",
  qtype: QuestionType.A,
  qclass: QuestionClass.IN,
},{
  qname: "mail.google.com",
  qtype: QuestionType.A,
  qclass: QuestionClass.IN,
}];

// This compressed question was a challenging part for me...
let compressedQuestion = Buffer.from([ 3, 119, 119, 119, 6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109, 0, 0, 1, 0, 1, 4, 109, 97, 105, 108, 0xC0, 0x04, 0, 1, 0, 1 ]);
compressedQuestion = Buffer.concat([ DNSHeader.encode(defaultHeaders), compressedQuestion ]);


const HOST = "127.0.0.1";
const PORT = 2053;
const message = compressedQuestion || Buffer.concat([
  DNSHeader.encode(defaultHeaders),
  DNSQuestion.encode(defaultQuestion),
]);
const client = dgram.createSocket("udp4");
client.bind(2054, "127.0.0.1");

client.on("message", function (msg: Buffer, rinfo: dgram.RemoteInfo) {
  const header = DNSHeader.decode(msg.subarray(0, 12));
  const questionLength = DNSQuestion.encode(defaultQuestion).length;
  const question = DNSQuestion.decode(msg.subarray(12, 12 + questionLength));
  console.log();
  console.log("-------------------RECEIVED MESSAGES-------------------")
  console.log(`header received from server: ${JSON.stringify(header)}`);
  console.log(`question received from server: ${JSON.stringify(question)}`);
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
    console.log();
    console.log("-------------------SENDING MESSAGE-------------------");
    console.log("Message: ", message);
    console.log("UDP message sent to " + HOST + ":" + PORT);
    console.log("Response from server: " + bytes);
  }
);
