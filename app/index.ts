import * as dgram from "dgram";
import { DNSHeader, RCODE } from "./dns/header";
import { DNSQuestion } from "./dns/question";
import { AnswerClass, AnswerType, DNSAnswer, type Answer } from "./dns/answer";

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
    const requestHeader = DNSHeader.decode(msg.subarray(0, 12));
    console.log(`Request header: ${JSON.stringify(requestHeader)}`);
    const requestQuestion = DNSQuestion.decode(msg.subarray(12));
    console.log(`Request question: ${JSON.stringify(requestQuestion)}`);

    let rcode = RCODE.NO_ERROR;
    if (requestHeader.opcode != 0) {
      rcode = RCODE.NOT_IMPLEMENTED;
    }

    const header = DNSHeader.encode({
      ...requestHeader,
      qr: 1,
      aa: 0,
      tc: 0,
      ra: 0,
      z: 0,
      rcode,
      ancount: requestHeader.qdcount,
    });
    const question = DNSQuestion.encode(requestQuestion);
    const answer = DNSAnswer.encode(
      requestQuestion.map((question) => {
        return { ...defaultAnswer, name: question.qname };
      })
    );
    const response = Buffer.concat([header, question, answer]);

    server.send(response, remoteAddress.port, remoteAddress.address);
  } catch (e) {
    console.log(`Error: ${e}`);
  }
});
