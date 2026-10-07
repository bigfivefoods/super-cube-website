import { site } from "@/lib/content";
import { markdownToEmailHtml } from "@/lib/news/markdown";
import { NEWS_FEED_PATH, absolute, newsUrl } from "@/lib/news/seo";
import { listPublishedNews } from "@/lib/news/store";

export const revalidate = 300;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** RSS 2.0 feed of published News posts (full content, absolute links and images). */
export async function GET() {
  const origin = site.url.replace(/\/$/, "");
  const posts = (await listPublishedNews()).slice(0, 30);
  const items = posts
    .map((p) => {
      const url = newsUrl(p.slug);
      const cover = absolute(p.coverImage);
      const html = `<p><img src="${esc(cover)}" alt="${esc(p.coverAlt)}" width="1200"/></p>${markdownToEmailHtml(p.body, origin)}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${esc(p.tag)}</category>
      <description>${esc(p.excerpt)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`;
    })
    .join("\n");
  const updated = posts[0]?.publishedAt ?? new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Super-Cube® News</title>
    <link>${origin}/news</link>
    <atom:link href="${origin}${NEWS_FEED_PATH}" rel="self" type="application/rss+xml"/>
    <description>Launches, programme updates and research from the Super-Cube® Leadership Model.</description>
    <language>en-za</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <image>
      <url>${origin}/icons/icon-192.png</url>
      <title>Super-Cube® News</title>
      <link>${origin}/news</link>
    </image>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
