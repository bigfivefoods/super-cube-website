"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { newsletterDb, siteOrigin } from "@/lib/newsletter/db";
import { CAMPAIGN_LIMITS, campaignContentHash, defaultCampaignFields } from "@/lib/newsletter/campaign";
import {
  CAMPAIGNS_TABLE,
  activeSubscriberCount,
  campaignPost,
  fieldsOf,
  getCampaign,
  processCampaignBatch,
  queueCampaign,
  sendCampaignTest,
} from "@/lib/newsletter/campaigns-db";
import { getPublishedNews } from "@/lib/news/store";
import { hit } from "@/lib/server/rate-limit";

export type CampaignState = { ok?: boolean; message?: string; error?: string } | undefined;

const back = (id: string, done?: string) => `/newsletter/admin?tab=campaigns&id=${id}${done ? `&done=${done}` : ""}`;
const clean = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);

/** Start a campaign (a draft) from a published post. Sends nothing. */
export async function createCampaignAction(form: FormData) {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) return;
  const db = newsletterDb();
  if (!db) return;
  const post = await getPublishedNews(String(form.get("slug") ?? ""));
  if (!post) return;
  const f = defaultCampaignFields(post);
  const { data, error } = await db
    .from(CAMPAIGNS_TABLE)
    .insert({ post_slug: post.slug, subject: f.subject, preheader: f.preheader, intro: f.intro, created_by: admin.email })
    .select("id")
    .single();
  if (error || !data) return;
  redirect(back((data as { id: string }).id));
}

/** Edit subject, preview line and intro (drafts only). A changed email needs a new test. */
export async function saveCampaignAction(_prev: CampaignState, form: FormData): Promise<CampaignState> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) return { error: "Your admin session has ended. Sign in again." };
  const c = await getCampaign(String(form.get("id") ?? ""));
  if (!c) return { error: "That campaign wasn’t found." };
  if (c.status !== "draft") return { error: "This campaign has been sent, so it can’t be edited." };
  const subject = clean(form.get("subject"), CAMPAIGN_LIMITS.subject).replace(/\s+/g, " ");
  const preheader = clean(form.get("preheader"), CAMPAIGN_LIMITS.preheader).replace(/\s+/g, " ");
  const intro = clean(form.get("intro"), CAMPAIGN_LIMITS.intro);
  if (subject.length < 3) return { error: "Add a subject line." };
  const db = newsletterDb();
  if (!db) return { error: "The store isn’t configured." };
  const { error } = await db
    .from(CAMPAIGNS_TABLE)
    .update({ subject, preheader, intro, updated_at: new Date().toISOString() })
    .eq("id", c.id)
    .eq("status", "draft");
  if (error) return { error: `Couldn’t save: ${error.message}` };
  revalidatePath("/newsletter/admin");
  redirect(back(c.id, "saved"));
}

/** Send the campaign to the signed-in admin only. Never takes a recipient from the form. */
export async function sendCampaignTestAction(_prev: CampaignState, form: FormData): Promise<CampaignState> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok || admin.email === "api-secret") return { error: "Your admin session has ended. Sign in again." };
  const c = await getCampaign(String(form.get("id") ?? ""));
  if (!c) return { error: "That campaign wasn’t found." };
  const post = await campaignPost(c);
  if (!post) return { error: "The post isn’t published any more." };
  const rl = await hit("newsletter-campaign-test", [`admin:${admin.email}`]);
  if (!rl.allowed) return { error: "Several tests were sent recently. Try again in an hour." };
  const r = await sendCampaignTest(c, post, admin.email, siteOrigin());
  if (!r.ok) return { error: `The test didn’t send (${r.error.slice(0, 120)}).` };
  revalidatePath("/newsletter/admin");
  redirect(back(c.id, "tested"));
}

/**
 * The real send. Needs: a test of this exact content, the confirmation box ticked, and the
 * number of recipients typed in. Then the first batch goes out; the rest via "Continue".
 */
export async function sendCampaignAction(_prev: CampaignState, form: FormData): Promise<CampaignState> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok || admin.email === "api-secret") return { error: "Your admin session has ended. Sign in again." };
  const c = await getCampaign(String(form.get("id") ?? ""));
  if (!c) return { error: "That campaign wasn’t found." };
  if (c.status !== "draft") return { error: "This campaign has already been sent or is sending." };
  const post = await campaignPost(c);
  if (!post) return { error: "The post isn’t published any more." };
  if (!c.test_sent_at || c.test_content_hash !== campaignContentHash(post, fieldsOf(c))) {
    return { error: "Send yourself a test of this exact version first." };
  }
  const count = await activeSubscriberCount();
  if (count === null) return { error: "Couldn’t count subscribers. Nothing was sent." };
  if (count === 0) return { error: "There are no confirmed subscribers yet. Nothing was sent." };
  if (form.get("confirm") !== "yes") return { error: "Tick the box to confirm." };
  if (String(form.get("typed") ?? "").replace(/\s/g, "") !== String(count)) {
    return { error: `Type ${count}, the number of people who will get this email.` };
  }
  const q = await queueCampaign(c, post, admin.email);
  if (!q.ok) return { error: q.error };
  const fresh = await getCampaign(c.id);
  if (fresh) await processCampaignBatch(fresh, post, siteOrigin());
  revalidatePath("/newsletter/admin");
  redirect(back(c.id, "sending"));
}

/** Resume a send in progress (idempotent: only unsent people get it). */
export async function continueCampaignAction(_prev: CampaignState, form: FormData): Promise<CampaignState> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok || admin.email === "api-secret") return { error: "Your admin session has ended. Sign in again." };
  const c = await getCampaign(String(form.get("id") ?? ""));
  if (!c) return { error: "That campaign wasn’t found." };
  const post = await campaignPost(c);
  if (!post) return { error: "The post isn’t published any more." };
  const r = await processCampaignBatch(c, post, siteOrigin());
  if (!r.ok) return { error: r.error };
  revalidatePath("/newsletter/admin");
  redirect(back(c.id, r.done ? "sent" : "sending"));
}
