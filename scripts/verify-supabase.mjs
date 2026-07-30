/**
 * Verify Supabase credentials and LMS tables.
 * Usage: node --env-file=.env.local scripts/verify-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", url || "(missing)");
console.log("anon:", anon ? `set (${anon.slice(0, 20)}…)` : "(missing)");
console.log("service_role:", service ? `set (${service.slice(0, 20)}…)` : "(missing)");

if (!url || !service) {
  console.error("Missing URL or service_role key");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users, error: usersErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1,
});
if (usersErr) {
  console.error("Auth admin error:", usersErr.message);
  process.exit(1);
}
console.log("Auth admin: OK (users page loaded, count≈", users?.users?.length ?? 0, ")");

const tables = [
  "profiles",
  "programmes",
  "subscription_plans",
  "subscriptions",
  "courses",
  "lessons",
  "assessment_instruments",
  "assessment_items",
];

let missing = 0;
for (const t of tables) {
  const { error } = await admin.from(t).select("*").limit(1);
  if (error) {
    console.log(`Table ${t}: MISSING or error — ${error.message}`);
    missing++;
  } else {
    console.log(`Table ${t}: OK`);
  }
}

if (missing) {
  console.log("\n→ Run supabase/SETUP_ALL.sql in the SQL Editor, then re-run this script.");
  process.exit(2);
}

const { data: programmes, error: pErr } = await admin
  .from("programmes")
  .select("id,name");
if (pErr) console.error(pErr);
else console.log("Programmes:", programmes);

console.log("\nSupabase ready.");
