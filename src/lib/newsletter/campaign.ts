import { createHash } from "node:crypto";
import { newsletterEmail, type NewsletterSection, type RenderedEmail } from "@/lib/email/layout";
import { inlineText, parseMarkdown, safeImageSrc } from "@/lib/news/markdown";
import { formatNewsDate } from "@/lib/news/seo";
import type { NewsPost } from "@/lib/news/types";

/**
 * A newsletter campaign = one published /news post, sent as a teaser on the shared
 * Super-Cube® newsletter layout (newsletterEmail): the cover, the summary, the opening
 * of up to three sections, and a "Read the full post" button with utm tags.
 */
export type CampaignFields = { subject: string; preheader: string; intro: string };

export const CAMPAIGN_LIMITS = { subject: 150, preheader: 200, intro: 1200 } as const;

export function defaultCampaignFields(post: NewsPost): CampaignFields {
  return { subject: post.title.slice(0, CAMPAIGN_LIMITS.subject), preheader: post.excerpt.slice(0, CAMPAIGN_LIMITS.preheader), intro: "" };
}

/** Shorten at a sentence end where possible, so a teaser never cuts a claim in half. */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const head = s.slice(0, max);
  const end = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
  if (end >= max * 0.4) return head.slice(0, end + 1);
  return `${head.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** The opening paragraph of up to `max` "## " sections of the post body (plain text). */
export function teaserSections(body: string, max = 3): { title: string; text: string }[] {
  const out: { title: string; text: string }[] = [];
  let current: { title: string; text: string } | null = null;
  for (const b of parseMarkdown(body)) {
    if (b.t === "h2") {
      if (current?.text) out.push(current);
      if (out.length >= max) break;
      current = { title: inlineText(b.c), text: "" };
    } else if (current && !current.text) {
      if (b.t === "p" || b.t === "quote") current.text = inlineText(b.c);
      else if (b.t === "ul") current.text = b.items.slice(0, 3).map((i) => inlineText(i)).join(" · ");
    }
  }
  if (current?.text && out.length < max) out.push(current);
  return out.map((s) => ({ title: s.title, text: clip(s.text, 300) }));
}

export function campaignUrl(post: NewsPost, site: string, campaignKey: string): string {
  const u = new URL(`/news/${post.slug}`, site);
  u.searchParams.set("utm_source", "newsletter");
  u.searchParams.set("utm_medium", "email");
  u.searchParams.set("utm_campaign", campaignKey);
  return u.toString();
}

function absoluteImage(src: string, site: string): string | null {
  const ok = safeImageSrc(src);
  if (!ok) return null;
  return ok.startsWith("/") ? `${site}${ok}` : ok;
}

export function campaignEmail(o: {
  post: NewsPost;
  fields: CampaignFields;
  unsubscribeUrl: string;
  campaignKey: string;
  site: string;
  assetBase?: string;
}): RenderedEmail {
  const site = o.site.replace(/\/$/, "");
  const url = campaignUrl(o.post, site, o.campaignKey);
  const cover = absoluteImage(o.post.coverImage, site);
  const teasers = teaserSections(o.post.body);
  const sections: NewsletterSection[] = [
    {
      eyebrow: o.post.tag,
      // The hero already carries the subject; don't repeat it when it is the post title.
      title: o.post.title.trim() === o.fields.subject.trim() ? "Inside this post" : o.post.title,
      ...(cover ? { image: { src: cover, alt: o.post.coverAlt, href: url } } : {}),
      paragraphs: o.fields.intro ? [o.post.excerpt] : [],
    },
    ...teasers.map((t) => ({ title: t.title, paragraphs: [t.text] })),
  ];
  return newsletterEmail({
    subject: o.fields.subject,
    preheader: o.fields.preheader || o.post.excerpt,
    issueLabel: `Super-Cube® News · ${formatNewsDate(o.post.publishedAt)}`,
    title: o.fields.subject,
    intro: o.fields.intro || o.post.excerpt,
    sections,
    cta: { href: url, label: "Read the full post" },
    unsubscribeUrl: o.unsubscribeUrl,
    viewInBrowserUrl: url,
    site,
    assetBase: o.assetBase,
  });
}

/** Ties a test send to the exact content: editing the campaign or the post needs a new test. */
export function campaignContentHash(post: NewsPost, fields: CampaignFields): string {
  return createHash("sha256")
    .update(JSON.stringify([post.slug, post.updatedAt, post.title, post.excerpt, post.body, post.coverImage, fields]))
    .digest("hex")
    .slice(0, 32);
}

/** RFC 8058 one-click unsubscribe headers (Gmail and Yahoo bulk-sender rules). */
export function listUnsubscribeHeaders(site: string, token: string): Record<string, string> {
  const api = `${site.replace(/\/$/, "")}/api/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
  return { "List-Unsubscribe": `<${api}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}

export function unsubscribePageUrl(site: string, token: string): string {
  return `${site.replace(/\/$/, "")}/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
}
