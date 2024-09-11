import { QuestionType, QuestionClass } from "./question";

export enum AnswerType {
  A = 1,
  NS = 2,
  CNAME = 5,
  SOA = 6,
  PTR = 12,
  MX = 15,
  TXT = 16,
  AAAA = 28,
  SRV = 33,
  ANY = 255,
}

export enum AnswerClass {
  IN = 1,
  CS = 2,
  CH = 3,
  HS = 4,
  ANY = 255,
}

export interface Answer {
  name: string;
  type: AnswerType;
  class: AnswerClass;
  ttl: number;
  rdata: string;
}

export class DNSAnswer {
  static encode(answers: Answer[]) {
    return Buffer.concat(
      answers.map((answer) => {
        const name = Buffer.alloc(answer.name.length + 2);
        const type = Buffer.alloc(2);
        const classBuffer = Buffer.alloc(2);
        const ttl = Buffer.alloc(4);
        const rdlength = Buffer.alloc(2);
        const rdata = Buffer.alloc(answer.rdata.length);

        const labels = answer.name.split(".");
        let offset = 0;
        labels.forEach((label) => {
          name.writeUInt8(label.length, offset);
          offset++;
          name.write(label, offset);
          offset += label.length;
        });
        name.writeUInt8(0, offset); // Null terminator

        type.writeUInt16BE(answer.type, 0);
        classBuffer.writeUInt16BE(answer.class, 0);
        ttl.writeUInt32BE(answer.ttl, 0);
        rdlength.writeUInt16BE(answer.rdata.length, 0);
        rdata.write(answer.rdata, 0);

        return Buffer.concat([name, type, classBuffer, ttl, rdlength, rdata]);
      })
    );
  }
}
