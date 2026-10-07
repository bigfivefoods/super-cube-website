import { sendEmail } from "@/lib/email";
import { NEWSLETTER_TABLE, newsletterDb } from "@/lib/newsletter/db";
import { getPublishedNews } from "@/lib/news/store";
import type { NewsPost } from "@/lib/news/types";
import {
  campaignContentHash,
  campaignEmail,
  listUnsubscribeHeaders,
  unsubscribePageUrl,
  type CampaignFields,
} from "./campaign";

export const CAMPAIGNS_TABLE = "newsletter_campaigns";
export const SENDS_TABLE = "newsletter_sends";

/** Emails per server-action call; the admin presses "Continue sending" for the rest. */
export const SEND_BATCH = 40;
/** Stay under the email provider's default rate limit (2 requests per second). */
const PACE_MS = 550;

export type CampaignRow = {
  id: string;
  post_slug: string;
  subject: string;
  preheader: string;
  intro: string;
  status: "draft" | "sending" | "sent";
  test_sent_at: string | null;
  test_sent_to: string | null;
  test_content_hash: string | null;
  send_confirmed_at: string | null;
  send_confirmed_by: string | null;
  content_hash: string | null;
  recipients_total: number;
  sent_count: number;
  failed_count: number;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const COLS =
  "id,post_slug,subject,preheader,intro,status,test_sent_at,test_sent_to,test_content_hash,send_confirmed_at,send_confirmed_by,content_hash,recipients_total,sent_count,failed_count,completed_at,created_by,created_at,updated_at";

export const fieldsOf = (c: Pick<CampaignRow, "subject" | "preheader" | "intro">): CampaignFields => ({
  subject: c.subject,
  preheader: c.preheader,
  intro: c.intro,
});

export async function listCampaigns(): Promise<{ rows: CampaignRow[]; error: string | null }> {
  const db = newsletterDb();
  if (!db) return { rows: [], error: "The store isn’t configured (Supabase URL / service role key)." };
  const { data, error } = await db.from(CAMPAIGNS_TABLE).select(COLS).order("created_at", { ascending: false }).limit(200);
  return { rows: (data ?? []) as CampaignRow[], error: error?.message ?? null };
}

export async function getCampaign(id: string): Promise<CampaignRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = newsletterDb();
  if (!db) return null;
  const { data } = await db.from(CAMPAIGNS_TABLE).select(COLS).eq("id", id).maybeSingle();
  return (data as CampaignRow | null) ?? null;
}

/** Confirmed, not unsubscribed: the only people a campaign can reach. */
export async function activeSubscriberCount(): Promise<number | null> {
  const db = newsletterDb();
  if (!db) return null;
  const { count, error } = await db
    .from(NEWSLETTER_TABLE)
    .select("id", { count: "exact", head: true })
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null);
  return error ? null : (count ?? 0);
}

export async function sendCounts(campaignId: string) {
  const db = newsletterDb();
  const out = { pending: 0, sending: 0, sent: 0, failed: 0, skipped: 0 };
  if (!db) return out;
  for (const s of Object.keys(out) as (keyof typeof out)[]) {
    const { count } = await db.from(SENDS_TABLE).select("id", { count: "exact", head: true }).eq("campaign_id", campaignId).eq("status", s);
    out[s] = count ?? 0;
  }
  return out;
}

export async function campaignPost(c: Pick<CampaignRow, "post_slug">): Promise<NewsPost | null> {
  return getPublishedNews(c.post_slug);
}

export const campaignKey = (c: Pick<CampaignRow, "id" | "post_slug">) => `news-${c.post_slug}`.slice(0, 60);

/** Test send: only ever to the signed-in admin's own address, marked [Test]. */
export async function sendCampaignTest(c: CampaignRow, post: NewsPost, adminEmail: string, site: string) {
  const fields = fieldsOf(c);
  const mail = campaignEmail({
    post,
    fields,
    // A test has no subscriber token: the link opens the unsubscribe page without one.
    unsubscribeUrl: `${site}/newsletter/unsubscribe`,
    campaignKey: campaignKey(c),
    site,
  });
  const r = await sendEmail({
    to: adminEmail,
    subject: `[Test] ${mail.subject}`,
    html: mail.html,
    text: mail.text,
    tags: ["newsletter_campaign_test"],
  });
  if (!r.ok) return { ok: false as const, error: r.error ?? r.provider };
  const db = newsletterDb();
  await db
    ?.from(CAMPAIGNS_TABLE)
    .update({
      test_sent_at: new Date().toISOString(),
      test_sent_to: adminEmail,
      test_content_hash: campaignContentHash(post, fields),
      updated_at: new Date().toISOString(),
    })
    .eq("id", c.id);
  return { ok: true as const, provider: r.provider };
}

/**
 * Queue the campaign for every active subscriber (one row each; the unique key makes
 * re-queuing harmless) and mark it as sending. The caller has already checked the
 * admin's explicit confirmation and the matching test send.
 */
export async function queueCampaign(c: CampaignRow, post: NewsPost, adminEmail: string): Promise<{ ok: true; queued: number } | { ok: false; error: string }> {
  const db = newsletterDb();
  if (!db) return { ok: false, error: "The store isn’t configured." };
  const now = new Date().toISOString();
  const { data: claimed, error: claimErr } = await db
    .from(CAMPAIGNS_TABLE)
    .update({
      status: "sending",
      send_confirmed_at: now,
      send_confirmed_by: adminEmail,
      content_hash: campaignContentHash(post, fieldsOf(c)),
      updated_at: now,
    })
    .eq("id", c.id)
    .eq("status", "draft")
    .select("id");
  if (claimErr) return { ok: false, error: claimErr.message };
  if (!claimed?.length) return { ok: false, error: "This campaign has already been sent or is sending." };

  let queued = 0;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(NEWSLETTER_TABLE)
      .select("id,email")
      .not("confirmed_at", "is", null)
      .is("unsubscribed_at", null)
      .order("created_at", { ascending: true })
      .range(from, from + 999);
    if (error) return { ok: false, error: error.message };
    const rows = (data ?? []) as { id: string; email: string }[];
    if (rows.length) {
      const { error: insErr } = await db
        .from(SENDS_TABLE)
        .upsert(
          rows.map((r) => ({ campaign_id: c.id, subscriber_id: r.id, email: r.email })),
          { onConflict: "campaign_id,subscriber_id", ignoreDuplicates: true },
        );
      if (insErr) return { ok: false, error: insErr.message };
      queued += rows.length;
    }
    if (rows.length < 1000) break;
  }
  await db.from(CAMPAIGNS_TABLE).update({ recipients_total: queued, updated_at: new Date().toISOString() }).eq("id", c.id);
  return { ok: true, queued };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Send the next batch. Each row is claimed (pending → sending) before its email goes out,
 * so two admins pressing the button at once can't email anyone twice. People who
 * unsubscribed after queuing are skipped. Content is the confirmed version (content_hash).
 */
export async function processCampaignBatch(c: CampaignRow, post: NewsPost, site: string) {
  const db = newsletterDb();
  if (!db) return { ok: false as const, error: "The store isn’t configured." };
  if (c.status !== "sending") return { ok: false as const, error: "This campaign isn’t sending." };
  const fields = fieldsOf(c);
  if (c.content_hash && campaignContentHash(post, fields) !== c.content_hash) {
    return { ok: false as const, error: "The post changed after the send was confirmed. Nothing more was sent." };
  }
  const { data: pending } = await db
    .from(SENDS_TABLE)
    .select("id,subscriber_id,email")
    .eq("campaign_id", c.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(SEND_BATCH);
  let sent = 0;
  let failed = 0;
  for (const row of (pending ?? []) as { id: string; subscriber_id: string; email: string }[]) {
    const { data: got } = await db
      .from(SENDS_TABLE)
      .update({ status: "sending", claimed_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id");
    if (!got?.length) continue;
    const { data: sub } = await db
      .from(NEWSLETTER_TABLE)
      .select("email,unsubscribe_token,confirmed_at,unsubscribed_at")
      .eq("id", row.subscriber_id)
      .maybeSingle();
    const s = sub as { email: string; unsubscribe_token: string; confirmed_at: string | null; unsubscribed_at: string | null } | null;
    if (!s || !s.confirmed_at || s.unsubscribed_at || !s.unsubscribe_token) {
      await db.from(SENDS_TABLE).update({ status: "skipped" }).eq("id", row.id);
      continue;
    }
    const mail = campaignEmail({
      post,
      fields,
      unsubscribeUrl: unsubscribePageUrl(site, s.unsubscribe_token),
      campaignKey: campaignKey(c),
      site,
    });
    const r = await sendEmail({
      to: s.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      tags: ["newsletter_campaign"],
      headers: listUnsubscribeHeaders(site, s.unsubscribe_token),
    });
    if (r.ok) sent++;
    else failed++;
    await db
      .from(SENDS_TABLE)
      .update(r.ok ? { status: "sent", sent_at: new Date().toISOString() } : { status: "failed", error: String(r.error ?? r.provider).slice(0, 300) })
      .eq("id", row.id);
    await sleep(PACE_MS);
  }
  const counts = await sendCounts(c.id);
  const done = counts.pending === 0 && counts.sending === 0;
  await db
    .from(CAMPAIGNS_TABLE)
    .update({
      sent_count: counts.sent,
      failed_count: counts.failed,
      updated_at: new Date().toISOString(),
      ...(done ? { status: "sent", completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", c.id);
  return { ok: true as const, sent, failed, remaining: counts.pending, done };
}
