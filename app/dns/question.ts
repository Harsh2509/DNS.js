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
  private static encodeLabel(label: string) {
    const labels = label.split(".");
    let offset = 0;
    const qname = Buffer.alloc(label.length + 2);
    labels.forEach((label) => {
      qname.writeUInt8(label.length, offset);
      offset++;
      qname.write(label, offset);
      offset += label.length;
    });
    qname.writeUInt8(0, offset); // Null terminator
    return qname;
  }

  static encode(questions: Question[]) {
    return Buffer.concat(
      questions.map((question) => {
        const qname = Buffer.alloc(question.qname.length + 2);
        const qtype = Buffer.alloc(2);
        const qclass = Buffer.alloc(2);

        DNSQuestion.encodeLabel(question.qname).copy(qname);

        qtype.writeUInt16BE(question.qtype, 0);
        qclass.writeUInt16BE(question.qclass, 0);

        return Buffer.concat([qname, qtype, qclass]);
      })
    );
  }

  private static decodeLabel(buffer: Buffer, offset: number) {
    let label = "";
    let ofst = offset;

    while (true) {
      const length = buffer.readUInt8(ofst);
      ofst++;

      if (length === 0x00) {
        // End of label sequence
        break;
      } else if ((length & 0xc0) === 0xc0) {
        // Compressed label (pointer)
        const pointer = ((length & 0x3f) << 8) | buffer.readUInt8(ofst);
        ofst++;
        const { label: compressedLabel } = this.decodeLabel(buffer, pointer);
        label += compressedLabel;
        break; // Compression ends the name, so we don't continue
      } else {
        // Regular label
        label += buffer.toString("utf-8", ofst, ofst + length);
        ofst += length;

        // If there is more to read, append a dot
        const nextLength = buffer.readUInt8(ofst);
        if (nextLength !== 0x00) {
          label += ".";
        }
      }
    }

    return { label, ofst };
  }

  static decode(buffer: Buffer) {
    const questions: Question[] = [];
    let offset = 0;
    while (offset < buffer.length) {
      let qname = "";
      let qtype = 0;
      let qclass = 0;

      // Decode the domain name (which might be compressed)
      const { label, ofst } = DNSQuestion.decodeLabel(buffer, offset);
      qname = label;
      offset = ofst;

      qtype = buffer.readUInt16BE(offset);
      offset += 2;
      qclass = buffer.readUInt16BE(offset);
      offset += 2;

      questions.push({ qname, qtype, qclass });
    }

    return questions;
  }
}
