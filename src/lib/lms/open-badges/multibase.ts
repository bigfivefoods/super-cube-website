/** Base58-btc (Bitcoin alphabet) and multibase `z` prefix, used by Multikey and proofValue. */

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58btcEncode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  let n = BigInt(0);
  const byteShift = BigInt(8);
  const base = BigInt(58);
  for (const byte of bytes) n = (n << byteShift) + BigInt(byte);
  let out = "";
  while (n > BigInt(0)) {
    const rem = n % base;
    n /= base;
    out = ALPHABET[Number(rem)] + out;
  }
  return `${"1".repeat(zeros)}${out}`;
}

export function base58btcDecode(text: string): Uint8Array {
  let zeros = 0;
  while (zeros < text.length && text[zeros] === "1") zeros += 1;
  let n = BigInt(0);
  const base = BigInt(58);
  const mask = BigInt(255);
  const byteShift = BigInt(8);
  for (const char of text) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) throw new Error("Invalid base58");
    n = n * base + BigInt(index);
  }
  const body: number[] = [];
  while (n > BigInt(0)) {
    body.push(Number(n & mask));
    n >>= byteShift;
  }
  body.reverse();
  return Uint8Array.from([...Array(zeros).fill(0), ...body]);
}

export function multibaseEncode(bytes: Uint8Array): string {
  return `z${base58btcEncode(bytes)}`;
}

export function multibaseDecode(value: string): Uint8Array {
  if (!value.startsWith("z") || value.length < 2) throw new Error("Expected base58-btc multibase");
  return base58btcDecode(value.slice(1));
}
