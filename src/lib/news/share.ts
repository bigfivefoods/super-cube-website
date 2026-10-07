/**
 * Share links for News posts: plain URLs, no SDKs, scripts or trackers (the CSP is unchanged).
 * Every shared link is the canonical post URL plus utm_source=<network>&utm_medium=social&utm_campaign=news.
 */
export type ShareNetwork = "linkedin" | "whatsapp" | "x" | "facebook" | "email" | "copy" | "native";

export function shareUrl(url: string, network: ShareNetwork): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", network);
  u.searchParams.set("utm_medium", network === "email" ? "email" : "social");
  u.searchParams.set("utm_campaign", "news");
  return u.toString();
}

const enc = encodeURIComponent;

export function shareLinks(url: string, title: string, summary: string) {
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl(url, "linkedin"))}`,
    whatsapp: `https://wa.me/?text=${enc(`${title} ${shareUrl(url, "whatsapp")}`)}`,
    x: `https://x.com/intent/post?text=${enc(title)}&url=${enc(shareUrl(url, "x"))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl(url, "facebook"))}`,
    email: `mailto:?subject=${enc(title)}&body=${enc(`${summary ? `${summary}\n\n` : ""}${shareUrl(url, "email")}`)}`,
  };
}
