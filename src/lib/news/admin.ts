import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { newsletterDb } from "@/lib/newsletter/db";
import { NEWS_BUCKET } from "./db";
export { validatePostInput, type PostInput, type PostInputResult } from "./validate";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type Uploaded = { square: string; wide: string };

/** Decode, orient, strip metadata and crop to 1440² + 1600×1000 JPEGs. */
export async function cropCover(
  input: Buffer,
): Promise<{ ok: true; square: Buffer; wide: Buffer } | { ok: false; error: string }> {
  try {
    const meta = await sharp(input).metadata();
    if (!meta.width || !meta.height || !["jpeg", "png", "webp"].includes(String(meta.format))) {
      return { ok: false, error: "That file isn’t a readable image." };
    }
    if (Math.min(meta.width, meta.height) < 600) {
      return { ok: false, error: "Cover is too small: use an image at least 1200 px wide and 600 px tall." };
    }
    const base = () => sharp(input, { failOn: "error" }).rotate();
    const square = await base()
      .resize(1440, 1440, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const wide = await base()
      .resize(1600, 1000, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return { ok: true, square, wide };
  } catch {
    return { ok: false, error: "That file isn’t a readable image." };
  }
}

/**
 * Cover upload: decode the image (rejects anything that isn't a real JPEG/PNG/WebP),
 * fix orientation, strip metadata (EXIF/GPS), and store two crops in the public
 * news-media bucket: a 1440² square (cards, homepage, email, phone hero) and a
 * 1600×1000 landscape (desktop hero). sharp's attention crop keeps the subject in frame.
 */
export async function uploadCover(file: File, slug: string): Promise<{ ok: true; urls: Uploaded } | { ok: false; error: string }> {
  if (!TYPES.has(file.type)) return { ok: false, error: "Cover must be a JPEG, PNG or WebP image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Cover must be 4 MB or smaller." };
  const db = newsletterDb();
  if (!db) return { ok: false, error: "The store isn’t configured." };
  const crops = await cropCover(Buffer.from(await file.arrayBuffer()));
  if (!crops.ok) return crops;
  const { square, wide } = crops;
  const stamp = new Date().toISOString().slice(0, 7).replace("-", "/");
  const id = randomBytes(5).toString("hex");
  const store = db.storage.from(NEWS_BUCKET);
  const urls: Partial<Uploaded> = {};
  for (const [kind, buf] of [
    ["square", square],
    ["wide", wide],
  ] as const) {
    const path = `${stamp}/${slug}-${id}-${kind}.jpg`;
    const { error } = await store.upload(path, buf, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("[news] upload failed", error.message);
      return { ok: false, error: "Couldn’t upload the cover. Please try again." };
    }
    urls[kind] = store.getPublicUrl(path).data.publicUrl;
  }
  return { ok: true, urls: urls as Uploaded };
}
