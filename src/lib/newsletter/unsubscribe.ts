import { NEWSLETTER_TABLE, newsletterDb } from "@/lib/newsletter/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function unsubscribeByToken(
  token: string
): Promise<"done" | "invalid" | "unavailable"> {
  if (!UUID.test(token)) return "invalid";
  const db = newsletterDb();
  if (!db) return "unavailable";
  const now = new Date().toISOString();
  const { data, error } = await db
    .from(NEWSLETTER_TABLE)
    .update({ unsubscribed_at: now, updated_at: now })
    .eq("unsubscribe_token", token)
    .is("unsubscribed_at", null)
    .select("id");
  if (error) {
    console.error("[newsletter] unsubscribe failed", error.message);
    return "unavailable";
  }
  if (data && data.length) return "done";
  // Already unsubscribed, or unknown token
  const { data: existing } = await db
    .from(NEWSLETTER_TABLE)
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  return existing ? "done" : "invalid";
}
