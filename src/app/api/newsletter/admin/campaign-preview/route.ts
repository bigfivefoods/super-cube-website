import { NextResponse } from "next/server";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { campaignEmail, defaultCampaignFields } from "@/lib/newsletter/campaign";
import { campaignKey, fieldsOf, getCampaign } from "@/lib/newsletter/campaigns-db";
import { siteOrigin } from "@/lib/newsletter/db";
import { getPublishedNews } from "@/lib/news/store";

export const dynamic = "force-dynamic";

/**
 * Admin-only preview of a campaign email (?id=<campaign>) or of a post's default
 * campaign (?post=<slug>). &format=text shows the plain-text part.
 */
export async function GET(req: Request) {
  const admin = await getNewsletterAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(req.url);
  const site = siteOrigin(req);
  const id = url.searchParams.get("id");
  const campaign = id ? await getCampaign(id) : null;
  const post = await getPublishedNews(campaign?.post_slug ?? url.searchParams.get("post") ?? "");
  if (!post || (id && !campaign)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mail = campaignEmail({
    post,
    fields: campaign ? fieldsOf(campaign) : defaultCampaignFields(post),
    unsubscribeUrl: `${site}/newsletter/unsubscribe`,
    campaignKey: campaign ? campaignKey(campaign) : `news-${post.slug}`,
    site,
  });
  const text = url.searchParams.get("format") === "text";
  return new NextResponse(text ? `Subject: ${mail.subject}\n\n${mail.text}` : mail.html, {
    headers: {
      "Content-Type": text ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
