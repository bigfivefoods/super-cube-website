/**
 * Upload course + session mp4s to Supabase Storage (public bucket).
 *
 * Usage:
 *   node --env-file=.env.local scripts/upload-videos-to-supabase.mjs
 *   node --env-file=.env.local scripts/upload-videos-to-supabase.mjs --courses-only
 *   node --env-file=.env.local scripts/upload-videos-to-supabase.mjs --sessions-only
 *   node --env-file=.env.local scripts/upload-videos-to-supabase.mjs --limit=5
 *
 * Then set on Vercel:
 *   NEXT_PUBLIC_VIDEO_CDN=https://<project>.supabase.co/storage/v1/object/public/videos
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const BUCKET = "videos";

const args = process.argv.slice(2);
const coursesOnly = args.includes("--courses-only");
const sessionsOnly = args.includes("--sessions-only");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureBucket() {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) console.warn("listBuckets", listErr.message);
  const exists = (buckets || []).some((b) => b.name === BUCKET);
  if (exists) {
    console.log("Bucket exists:", BUCKET);
    return;
  }
  // Minimal options — some plans reject fileSizeLimit on create
  let { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (error) {
    // retry private then flip public
    const second = await supabase.storage.createBucket(BUCKET, {
      public: false,
    });
    error = second.error;
    if (!error) {
      await supabase.storage.updateBucket(BUCKET, { public: true });
    }
  }
  if (error) {
    console.error("createBucket", error.message);
    console.error(
      "In Supabase Dashboard → Storage → New bucket → name: videos → Public → Create,"
    );
    console.error("then re-run: npm run videos:upload:courses");
    process.exit(1);
  }
  console.log("Created public bucket:", BUCKET);
}

async function walkMp4(dir, base = "") {
  const out = [];
  let entries;
  try {
    entries = await readdir(path.join(dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkMp4(full, rel)));
    } else if (e.name.endsWith(".mp4")) {
      out.push({ full, rel: rel.replace(/\\/g, "/") });
    }
  }
  return out;
}

async function uploadOne(filePath, objectPath) {
  const buf = await readFile(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
    contentType: "video/mp4",
    upsert: true,
  });
  if (error) throw new Error(error.message);
}

async function main() {
  await ensureBucket();

  const files = [];
  if (!sessionsOnly) {
    const courses = await walkMp4(path.join(root, "public/videos/courses"));
    for (const f of courses) {
      // only age-band finals, skip _raw etc (already skipped via _ prefix)
      if (f.rel.includes("/_")) continue;
      // Bucket name is "videos" → object keys: courses/{programme}/{construct}.mp4
      files.push({
        full: f.full,
        object: `courses/${f.rel}`,
      });
    }
  }
  if (!coursesOnly) {
    const sessions = await walkMp4(path.join(root, "public/videos/sessions"));
    for (const f of sessions) {
      files.push({
        full: f.full,
        object: `sessions/${f.rel}`,
      });
    }
  }

  console.log(`Found ${files.length} mp4 files`);
  let n = 0;
  let ok = 0;
  let fail = 0;

  for (const f of files) {
    if (n >= limit) break;
    n++;
    const size = (await stat(f.full)).size;
    process.stdout.write(
      `[${n}/${Math.min(files.length, limit)}] ${f.object} (${(size / 1e6).toFixed(1)}MB)… `
    );
    try {
      await uploadOne(f.full, f.object);
      ok++;
      console.log("ok");
    } catch (e) {
      fail++;
      console.log("FAIL", e.message);
    }
  }

  const publicBase = `${url}/storage/v1/object/public/${BUCKET}`;
  console.log("\nDone.", { ok, fail });
  console.log("Set Vercel env:");
  console.log(`  NEXT_PUBLIC_VIDEO_CDN=${publicBase}`);
  console.log("Example course URL:");
  console.log(`  ${publicBase}/courses/adults/choices.mp4`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
