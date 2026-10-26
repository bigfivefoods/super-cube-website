/**
 * JSON Canonicalization Scheme (RFC 8785) for the shapes we sign.
 * Objects sort by UTF-16 code unit. Strings use JSON escaping. Only safe
 * integers are accepted, so a float cannot be signed two different ways.
 */

export function canonicalize(value: unknown): string {
  return serialize(value);
}

function serialize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return serializeNumber(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => serialize(item)).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((key) => obj[key] !== undefined)
      .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${serialize(obj[key])}`).join(",")}}`;
  }
  throw new Error("Unsupported JSON value");
}

function serializeNumber(n: number): string {
  if (!Number.isFinite(n) || !Number.isSafeInteger(n)) {
    throw new Error("Only safe integers are signed");
  }
  return String(n);
}
