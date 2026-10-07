import { ImageResponse } from "next/og";
import { getPublishedNews } from "@/lib/news/store";
import { siteOrigin } from "@/lib/newsletter/db";

/**
 * 1200×630 share card for posts written in the admin (code posts ship static cards).
 * Square cover on the left, tag and headline on the right, Super-Cube® News wordmark.
 */
export const revalidate = 300;

const SPECTRUM = ["#b32026", "#5d1f5e", "#26408c", "#16979a", "#367638", "#ed8f20"];

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedNews(slug);
  if (!post || post.source !== "db") return new Response("Not found", { status: 404 });
  const origin = siteOrigin(req);
  const cover = post.coverImage.startsWith("/") ? `${origin}${post.coverImage}` : post.coverImage;
  const title = post.title.length > 110 ? `${post.title.slice(0, 107).trimEnd()}…` : post.title;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0a0a0a", color: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" width={630} height={630} style={{ width: 630, height: 630, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 52px", width: 570 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#a3a3a3" }}>
              {post.tag}
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: title.length > 70 ? 40 : 48, lineHeight: 1.15, fontWeight: 700 }}>
              {title}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", height: 6, width: 168, borderRadius: 3, overflow: "hidden" }}>
              {SPECTRUM.map((c) => (
                <div key={c} style={{ display: "flex", flex: 1, background: c }} />
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 26, fontWeight: 700 }}>Super-Cube® News</div>
            <div style={{ display: "flex", marginTop: 4, fontSize: 20, color: "#a3a3a3" }}>super-cube.me/news</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400" },
    },
  );
}
