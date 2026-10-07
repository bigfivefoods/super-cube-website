/**
 * A deliberately small markdown dialect for News posts, parsed into blocks once and rendered
 * two ways: React on the site (NewsBody) and inline-styled HTML in campaign emails.
 *
 * Supported: "## " / "### " headings, paragraphs, "- " lists, "> " quotes, a line holding only
 * ![alt](src) (figure), **bold**, *italic*, [text](href). Links accept https:, mailto: and
 * site-relative paths only; anything else renders as plain text. No raw HTML is ever passed through.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "link"; href: string; c: Inline[] };

export type Block =
  | { t: "h2" | "h3"; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "quote"; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "img"; src: string; alt: string };

/** Allowed link targets: https, mailto, or a path on this site. */
export function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (/^\/(?!\/)/.test(href)) return href;
  if (/^#[\w-]+$/.test(href)) return href;
  if (/^mailto:[^\s"'<>]+$/i.test(href)) return href;
  try {
    const u = new URL(href);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Allowed image sources: a path on this site or an https URL. */
export function safeImageSrc(raw: string): string | null {
  const src = raw.trim();
  if (/^\/(?!\/)[\w\-./%]+$/.test(src)) return src;
  try {
    const u = new URL(src);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    if (rest.startsWith("**")) {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "strong", c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (rest[0] === "*" && rest[1] !== "*" && rest[1] !== " ") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1 && src[end - 1] !== " ") {
        flush();
        out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (rest[0] === "[") {
      const m = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
      if (m) {
        flush();
        const href = safeHref(m[2]!);
        if (href) out.push({ t: "link", href, c: parseInline(m[1]!) });
        else out.push(...parseInline(m[1]!));
        i += m[0].length;
        continue;
      }
    }
    buf += src[i];
    i += 1;
  }
  flush();
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) blocks.push({ t: "p", c: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ t: "ul", items: list.map(parseInline) });
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      flushPara();
      flushList();
      const src = safeImageSrc(img[2]!);
      if (src) blocks.push({ t: "img", src, alt: img[1]!.trim() });
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ t: h[1]!.length === 2 ? "h2" : "h3", c: parseInline(h[2]!) });
      continue;
    }
    if (/^#\s+/.test(line)) {
      // A single "#" would duplicate the page's h1: treat it as a section heading.
      flushPara();
      flushList();
      blocks.push({ t: "h2", c: parseInline(line.replace(/^#\s+/, "")) });
      continue;
    }
    const li = line.match(/^[-*]\s+(.+)$/);
    if (li) {
      flushPara();
      list.push(li[1]!);
      continue;
    }
    if (line.startsWith("> ")) {
      flushPara();
      flushList();
      blocks.push({ t: "quote", c: parseInline(line.slice(2)) });
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

/** Plain text of inline nodes (for feeds, meta descriptions and text emails). */
export function inlineText(nodes: Inline[]): string {
  return nodes.map((n) => (n.t === "text" ? n.v : inlineText(n.c))).join("");
}

/** Plain-text version of a whole body (text/plain email part, RSS fallback). */
export function markdownToText(md: string, origin = ""): string {
  return parseMarkdown(md)
    .map((b) => {
      if (b.t === "img") return "";
      if (b.t === "ul") return b.items.map((i) => `- ${inlineText(i)}`).join("\n");
      const text = b.c
        .map((n) => (n.t === "link" ? `${inlineText(n.c)} (${n.href.startsWith("/") ? origin + n.href : n.href})` : n.t === "text" ? n.v : inlineText(n.c)))
        .join("");
      return b.t === "h2" || b.t === "h3" ? text.toUpperCase() : text;
    })
    .filter(Boolean)
    .join("\n\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Email-safe HTML (inline styles) for a post body. Relative links and images become absolute. */
export function markdownToEmailHtml(md: string, origin: string, linkParams = ""): string {
  const abs = (href: string) => (href.startsWith("/") ? `${origin}${href}` : href);
  const withParams = (href: string) => {
    if (!linkParams || href.startsWith("mailto:") || href.startsWith("#")) return href;
    try {
      const u = new URL(abs(href));
      if (u.origin !== origin) return u.toString();
      for (const [k, v] of new URLSearchParams(linkParams)) u.searchParams.set(k, v);
      return u.toString();
    } catch {
      return href;
    }
  };
  const inl = (nodes: Inline[]): string =>
    nodes
      .map((n) => {
        if (n.t === "text") return esc(n.v);
        if (n.t === "strong") return `<strong>${inl(n.c)}</strong>`;
        if (n.t === "em") return `<em>${inl(n.c)}</em>`;
        return `<a href="${esc(withParams(n.href))}" style="color:#0a0a0a;font-weight:600;text-decoration:underline">${inl(n.c)}</a>`;
      })
      .join("");
  const p = "margin:0 0 16px;font-size:16px;line-height:1.6;color:#262626";
  return parseMarkdown(md)
    .map((b) => {
      switch (b.t) {
        case "h2":
          return `<h2 style="margin:28px 0 10px;font-size:20px;line-height:1.3;font-weight:700;letter-spacing:-0.01em;color:#0a0a0a">${inl(b.c)}</h2>`;
        case "h3":
          return `<h3 style="margin:22px 0 8px;font-size:17px;line-height:1.35;font-weight:700;color:#0a0a0a">${inl(b.c)}</h3>`;
        case "quote":
          return `<blockquote style="margin:0 0 16px;padding:4px 0 4px 14px;border-left:3px solid #d4d4d4;${p}">${inl(b.c)}</blockquote>`;
        case "ul":
          return `<ul style="margin:0 0 16px;padding-left:20px">${b.items
            .map((i) => `<li style="margin:0 0 8px;font-size:16px;line-height:1.55;color:#262626">${inl(i)}</li>`)
            .join("")}</ul>`;
        case "img":
          return `<img src="${esc(abs(b.src))}" alt="${esc(b.alt)}" width="560" style="display:block;width:100%;max-width:560px;height:auto;margin:8px 0 20px;border-radius:12px;border:0">`;
        default:
          return `<p style="${p}">${inl(b.c)}</p>`;
      }
    })
    .join("\n");
}
