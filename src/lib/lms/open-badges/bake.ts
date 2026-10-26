/**
 * Bake an Open Badges 3.0 credential into a PNG iTXt chunk.
 * Keyword `openbadgecredential`, compression flag 0, as required by the spec.
 */
import { deflateSync, inflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
export const BAKE_KEYWORD = "openbadgecredential";

export function bakeOpenBadgePng(png: Buffer, credentialJson: string): Buffer {
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("Not a PNG");
  const itxt = chunk("iTXt", itxtData(credentialJson));
  const parts: Buffer[] = [PNG_SIGNATURE];
  let offset = 8;
  let inserted = false;
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const end = offset + 12 + length;
    if (end > png.length) throw new Error("Truncated PNG");
    if (type === "iTXt" && chunkKeyword(png.subarray(offset + 8, offset + 8 + length)) === BAKE_KEYWORD) {
      offset = end;
      continue;
    }
    if (type === "IEND") {
      parts.push(itxt, png.subarray(offset, end));
      inserted = true;
      break;
    }
    parts.push(png.subarray(offset, end));
    offset = end;
  }
  if (!inserted) throw new Error("PNG has no IEND chunk");
  return Buffer.concat(parts);
}

export function extractOpenBadge(png: Buffer): string | null {
  if (png.length < 8 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  let offset = 8;
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    const end = offset + 12 + length;
    if (end > png.length) return null;
    if (type === "iTXt" && chunkKeyword(data) === BAKE_KEYWORD) {
      return itxtText(data);
    }
    if (type === "IEND") return null;
    offset = end;
  }
  return null;
}

/** 8×8 branded PNG used when the logo file cannot be read. */
export function fallbackBadgePng(): Buffer {
  const size = 8;
  const raw: number[] = [];
  for (let y = 0; y < size; y += 1) {
    raw.push(0);
    for (let x = 0; x < size; x += 1) {
      const band = Math.floor((x / size) * 6);
      const colours = [
        [0xb3, 0x20, 0x26],
        [0x5d, 0x1f, 0x5e],
        [0xed, 0x8f, 0x20],
        [0x36, 0x76, 0x38],
        [0x16, 0x97, 0x9a],
        [0x26, 0x40, 0x8c],
      ];
      raw.push(...colours[band]);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(raw))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function itxtData(text: string): Buffer {
  return Buffer.concat([
    Buffer.from(`${BAKE_KEYWORD}\0`, "latin1"),
    Buffer.from([0, 0]),
    Buffer.from("\0\0", "latin1"),
    Buffer.from(text, "utf8"),
  ]);
}

function chunkKeyword(data: Buffer): string {
  const end = data.indexOf(0);
  if (end < 1) return "";
  return data.subarray(0, end).toString("latin1");
}

function itxtText(data: Buffer): string | null {
  const keyEnd = data.indexOf(0);
  if (keyEnd < 1 || keyEnd + 2 >= data.length) return null;
  const compression = data[keyEnd + 1];
  let cursor = keyEnd + 3;
  const langEnd = data.indexOf(0, cursor);
  if (langEnd < 0) return null;
  cursor = langEnd + 1;
  const transEnd = data.indexOf(0, cursor);
  if (transEnd < 0) return null;
  const text = data.subarray(transEnd + 1);
  if (compression === 0) return text.toString("utf8");
  if (compression === 1) return inflateSync(text).toString("utf8");
  return null;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
