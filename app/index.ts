import * as dgram from "dgram";
import { DNSHeader, OPCODE, RCODE, type Header } from "./dns/header";
import {
  DNSQuestion,
  QuestionClass,
  QuestionType,
  type Question,
} from "./dns/question";
import { AnswerClass, AnswerType, DNSAnswer, type Answer } from "./dns/answer";

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
  qdcount: 1, // Number of questions
  ancount: 1, // Number of answers
  nscount: 0, // Number of authority records
  arcount: 0, // Number of additional records
};

const defaultQuestion: Question = {
  qname: "google.com",
  qtype: QuestionType.A, // A type record
  qclass: QuestionClass.IN, // Internet
};

const defaultAnswer: Answer = {
  name: "google.com",
  type: AnswerType.A,
  class: AnswerClass.IN,
  ttl: 3600,
  rdata: "\x08\x08\x08\x09",
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
    const question = DNSQuestion.encode([defaultQuestion]);
    const answer = DNSAnswer.encode([defaultAnswer]);
    const response = Buffer.concat([header, question, answer]);

    server.send(response, remoteAddress.port, remoteAddress.address);
  } catch (e) {
    console.log(`Error: ${e}`);
  }
});
