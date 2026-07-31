/**
 * Apply 003 orgs/coach SQL via Supabase Management is not available with service role.
 * This script creates tables using the REST-friendly approach where possible,
 * and prints the dashboard SQL path if DDL is required.
 *
 * Prefer: paste SUPABASE_RUN_THIS_ORGS_COACH.sql in SQL Editor.
 *
 * Try: node --env-file=.env.local scripts/run-orgs-sql.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function tableExists(name) {
  const { error } = await supabase.from(name).select("*").limit(1);
  if (!error) return true;
  const msg = `${error.message || ""} ${error.code || ""} ${error.details || ""}`;
  if (
    /does not exist|schema cache|PGRST205|42P01/i.test(msg) ||
    error.code === "PGRST205" ||
    error.code === "42P01"
  ) {
    return false;
  }
  // other errors (RLS, etc.) → table likely exists
  console.warn(`tableExists(${name}):`, msg.trim());
  return true;
}

async function main() {
  const needed = [
    "organisations",
    "org_members",
    "org_progress_snapshots",
    "certificates",
    "growth_shares",
  ];
  const status = {};
  for (const t of needed) {
    status[t] = await tableExists(t);
  }
  console.log("Table status:", status);

  const missing = needed.filter((t) => !status[t]);
  if (missing.length === 0) {
    // Ensure demo cohort
    const { error } = await supabase.from("organisations").upsert(
      {
        code: "DEMO2026",
        name: "Super-Cube® Demo Cohort",
        kind: "cohort",
        contact_email: "hello@super-cube.me",
        notes: "Default pilot code",
        active: true,
      },
      { onConflict: "code" }
    );
    if (error) console.warn("Seed DEMO2026:", error.message);
    else console.log("DEMO2026 cohort ready.");
    console.log("Orgs/coach schema OK.");
    return;
  }

  console.log("\nMissing tables:", missing.join(", "));
  console.log(
    "\nOpen Supabase SQL Editor and run the full file:\n  SUPABASE_RUN_THIS_ORGS_COACH.sql\n"
  );
  const sqlPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "SUPABASE_RUN_THIS_ORGS_COACH.sql"
  );
  console.log("File:", sqlPath);
  console.log("Bytes:", readFileSync(sqlPath).length);
  process.exitCode = 2;
}

main();
