export enum QuestionType {
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

export enum QuestionClass {
  IN = 1,
  CS = 2,
  CH = 3,
  HS = 4,
  ANY = 255,
}

export interface Question {
  qname: string;
  qtype: QuestionType;
  qclass: QuestionClass;
}

export class DNSQuestion {
  static encode(questions: Question[]) {
    return Buffer.concat(
      questions.map((question) => {
        const qname = Buffer.alloc(question.qname.length + 2);
        const qtype = Buffer.alloc(2);
        const qclass = Buffer.alloc(2);

        const labels = question.qname.split(".");
        let offset = 0;
        labels.forEach((label) => {
          qname.writeUInt8(label.length, offset);
          offset++;
          qname.write(label, offset);
          offset += label.length;
        });
        qname.writeUInt8(0, offset); // Null terminator

        qtype.writeUInt16BE(question.qtype, 0);
        qclass.writeUInt16BE(question.qclass, 0);

        return Buffer.concat([qname, qtype, qclass]);
      })
    );
  }

  static decode(buffer: Buffer) {
    const questions: Question[] = [];
    let offset = 0;
    while (offset < buffer.length) {
      let qname = "";
      let qtype = 0;
      let qclass = 0;

      let length = buffer.readUInt8(offset);
      offset++;
      while (length > 0) {
        qname += buffer.toString("utf-8", offset, offset + length);
        offset += length;
        length = buffer.readUInt8(offset);
        offset++;
        if (length > 0) {
          qname += ".";
        }
      }

      qtype = buffer.readUInt16BE(offset);
      offset += 2;
      qclass = buffer.readUInt16BE(offset);
      offset += 2;

      questions.push({ qname, qtype, qclass });
    }

    return questions;
  }
}
