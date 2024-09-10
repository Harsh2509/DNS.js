export enum OPCODE {
  STANDARD_QUERY = 0,
  INVERSE_QUERY = 1,
  SERVER_STATUS_REQUEST = 2,
  RESERVED = 3,
}

export enum RCODE {
  NO_ERROR = 0,
  FORMAT_ERROR = 1,
  SERVER_FAILURE = 2,
  NAME_ERROR = 3,
  NOT_IMPLEMENTED = 4,
  REFUSED = 5,
}

export interface Header {
  id: number;
  qr: number;
  opcode: OPCODE;
  aa: number;
  tc: number;
  rd: number;
  ra: number;
  z: number;
  rcode: RCODE;
  qdcount: number;
  ancount: number;
  nscount: number;
  arcount: number;
}

export class DNSHeader {
  static encode(header: Header) {
    const buffer = Buffer.alloc(12);
    const flags =
      (header.qr << 15) |
      (header.opcode << 11) |
      (header.aa << 10) |
      (header.tc << 9) |
      (header.rd << 8) |
      (header.ra << 7) |
      (header.z << 4) |
      header.rcode;

    buffer.writeUInt16BE(header.id, 0);
    buffer.writeUInt16BE(header.id, 0);

    return buffer;
  }
}
