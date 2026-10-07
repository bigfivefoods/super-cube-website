/**
 * Super-Cube® email design system: one shared layout + small components that
 * every email the site sends is built from (transactional and newsletter).
 *
 * Built for the strictest clients first:
 *  - table layout, inline CSS, 600px fluid card (Outlook gets a fixed-width
 *    ghost table), system font stack with Inter first and Arial for Outlook;
 *  - bulletproof buttons (VML roundrect for Outlook, padded <a> elsewhere);
 *  - programme gradients always sit on a solid bgcolor that passes contrast,
 *    so clients that drop gradients (Outlook, some Gmail views) stay readable;
 *  - dark mode via prefers-color-scheme (Apple Mail, iOS Mail, Outlook for
 *    Mac) and [data-ogsc] (Outlook.com), with a light logo swap;
 *  - a hidden preheader and a plain-text alternative built from the same
 *    blocks (never by stripping HTML).
 *
 * Components return { html, text } pairs; renderEmail() stitches them into
 * the shell. Every dynamic value is escaped here, so callers pass plain text.
 * Newsletter campaigns use newsletterEmail() (see the bottom of this file).
 */
import { constructs } from "@/lib/content";
import { PROGRAMME_THEME } from "@/lib/programme-theme";
import type { ProgrammeId } from "@/lib/programmes";

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export const EMAIL_FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const EMAIL_MONO = "'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

export const EMAIL_COLOURS = {
  page: "#f3f4f6", // Big Five Group footer band
  card: "#ffffff",
  panel: "#f7f7f8",
  ink: "#0a0a0a",
  slate: "#4a4a4a",
  muted: "#6b6b6b",
  line: "#e7e7ea",
  // dark mode
  dPage: "#000000",
  dCard: "#121212",
  dPanel: "#1c1c1e",
  dInk: "#f5f5f5",
  dSlate: "#c7c7c7",
  dMuted: "#a3a3a3",
  dLine: "#2c2c2e",
} as const;

/** The six faces in model order: the colour signature used across emails. */
export const FACE_COLOURS: { id: string; name: string; color: string }[] = constructs.map((c) => ({
  id: c.id,
  name: c.shortName,
  color: c.color,
}));

export type EmailTheme = ProgrammeId | "brand";

type HeroTheme = {
  stops: string[];
  solid: string; // fallback bgcolor (passes contrast with ink)
  ink: string;
  accent: string;
  button: { bg: string; fg: string };
};

/** Hero colours: programme accents from programme-theme.ts, plus the house black. */
export function heroTheme(theme: EmailTheme): HeroTheme {
  if (theme === "brand") {
    return {
      stops: ["#0a0a0a", "#16181d", "#1f2330"],
      solid: "#111318",
      ink: "#ffffff",
      accent: "#c7d2fe",
      button: { bg: "#0a0a0a", fg: "#ffffff" },
    };
  }
  const t = PROGRAMME_THEME[theme];
  if (theme === "kids") {
    return { stops: t.stops, solid: t.stops[1], ink: t.ink, accent: t.accent, button: { bg: t.ink, fg: "#ffffff" } };
  }
  if (theme === "adolescents") {
    return { stops: t.stops, solid: t.solid, ink: t.ink, accent: t.accent, button: { bg: t.solid, fg: "#ffffff" } };
  }
  // adults: midnight + champagne gold
  return { stops: t.stops, solid: t.solid, ink: t.ink, accent: t.accent, button: { bg: t.solid, fg: t.accent } };
}

export function isProgrammeId(v: unknown): v is ProgrammeId {
  return v === "kids" || v === "adolescents" || v === "adults";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) and mailto links make it into an email. */
export function safeUrl(url: string): string {
  const u = String(url || "").trim();
  return /^(https?:\/\/|mailto:)/i.test(u) ? u : "#";
}

export const DEFAULT_SITE = "https://www.super-cube.me";

/** Public site origin for links and hosted images (no trailing slash). */
export function emailSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE).replace(/\/$/, "");
}

export type Block = { html: string; text: string };
export type Inline = string | Block;

function inl(x: Inline): Block {
  return typeof x === "string" ? { html: esc(x), text: x } : x;
}

/** Join inline pieces (plain strings are escaped). */
export function rich(...parts: Inline[]): Block {
  const b = parts.map(inl);
  return { html: b.map((p) => p.html).join(""), text: b.map((p) => p.text).join("") };
}

export function strong(s: string): Block {
  return { html: `<strong class="sc-ink" style="font-weight:600;color:${EMAIL_COLOURS.ink};">${esc(s)}</strong>`, text: s };
}

export function link(href: string, label: string): Block {
  return {
    html: `<a href="${esc(safeUrl(href))}" class="sc-ink" style="color:${EMAIL_COLOURS.ink};font-weight:600;text-decoration:underline;text-underline-offset:2px;">${esc(label)}</a>`,
    text: `${label} (${href})`,
  };
}

const P = `margin:0 0 16px;font-family:${EMAIL_FONT};font-size:16px;line-height:26px;color:${EMAIL_COLOURS.slate};`;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function paragraph(...parts: Inline[]): Block {
  const r = rich(...parts);
  return { html: `<p class="sc-slate" style="${P}">${r.html}</p>`, text: r.text };
}

export function small(...parts: Inline[]): Block {
  const r = rich(...parts);
  return {
    html: `<p class="sc-muted" style="margin:0 0 12px;font-family:${EMAIL_FONT};font-size:13px;line-height:20px;color:${EMAIL_COLOURS.muted};">${r.html}</p>`,
    text: r.text,
  };
}

export function heading(text: string, opts: { eyebrow?: string } = {}): Block {
  const eyebrow = opts.eyebrow
    ? `<p class="sc-muted" style="margin:0 0 6px;font-family:${EMAIL_FONT};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_COLOURS.muted};">${esc(opts.eyebrow)}</p>`
    : "";
  return {
    html: `${eyebrow}<h2 class="sc-ink" style="margin:8px 0 12px;font-family:${EMAIL_FONT};font-size:20px;line-height:28px;font-weight:700;letter-spacing:-0.01em;color:${EMAIL_COLOURS.ink};">${esc(text)}</h2>`,
    text: `${opts.eyebrow ? opts.eyebrow.toUpperCase() + "\n" : ""}${text}\n${"-".repeat(Math.min(60, text.length))}`,
  };
}

export function spacer(px = 16): Block {
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${px}" style="height:${px}px;line-height:${px}px;font-size:1px;">&nbsp;</td></tr></table>`,
    text: "",
  };
}

export function divider(): Block {
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td class="sc-line" style="border-top:1px solid ${EMAIL_COLOURS.line};font-size:1px;line-height:1px;height:1px;">&nbsp;</td></tr></table>`,
    text: "",
  };
}

type ButtonOpts = {
  href: string;
  label: string;
  theme?: EmailTheme;
  /** "primary" fills with the theme colour; "secondary" is an outlined pill. */
  variant?: "primary" | "secondary";
  align?: "left" | "center";
};

/** Bulletproof pill button: VML roundrect in Outlook, padded link elsewhere. */
export function button(o: ButtonOpts): Block {
  const href = esc(safeUrl(o.href));
  const label = esc(o.label);
  const t = heroTheme(o.theme ?? "brand");
  const primary = (o.variant ?? "primary") === "primary";
  const bg = primary ? t.button.bg : "#ffffff";
  const fg = primary ? t.button.fg : EMAIL_COLOURS.ink;
  const border = primary ? bg : "#d4d4d8";
  const width = Math.max(200, Math.round(o.label.length * 8.6 + 64));
  const align = o.align ?? "left";
  const theme = o.theme ?? "brand";
  const cls = !primary
    ? "sc-btn-2"
    : theme === "kids" || theme === "brand"
      ? "sc-btn sc-btn-dark"
      : theme === "adults"
        ? "sc-btn sc-btn-gold"
        : "sc-btn";
  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:8px 0 24px;${align === "center" ? "margin-left:auto;margin-right:auto;" : ""}"><tr><td>
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:${width}px;" arcsize="50%" strokecolor="${border}" fillcolor="${bg}"><w:anchorlock/><center style="color:${fg};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center></v:roundrect><![endif]-->
<!--[if !mso]><!-- --><a href="${href}" class="${cls}" style="display:inline-block;background-color:${bg};color:${fg};border:1px solid ${border};border-radius:999px;font-family:${EMAIL_FONT};font-size:15px;line-height:20px;font-weight:600;text-decoration:none;padding:14px 30px;mso-hide:all;">${label}&nbsp;&rarr;</a><!--<![endif]-->
</td></tr></table>`;
  return { html: `${html}<div style="clear:both;line-height:0;font-size:0;">&nbsp;</div>`, text: `${o.label}: ${o.href}` };
}

/** Numbered steps; badges cycle through the six face colours. */
export function steps(items: { title: string; detail?: string }[]): Block {
  const rows = items
    .map((it, i) => {
      const c = FACE_COLOURS[i % FACE_COLOURS.length].color;
      return `<tr>
<td valign="top" width="40" style="width:40px;padding:0 0 18px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="28" height="28" bgcolor="${c}" style="width:28px;height:28px;border-radius:14px;background-color:${c};color:#ffffff;font-family:${EMAIL_FONT};font-size:13px;line-height:28px;font-weight:700;">${i + 1}</td></tr></table>
</td>
<td valign="top" style="padding:3px 0 18px;font-family:${EMAIL_FONT};">
  <p class="sc-ink" style="margin:0;font-size:15px;line-height:22px;font-weight:600;color:${EMAIL_COLOURS.ink};">${esc(it.title)}</p>
  ${it.detail ? `<p class="sc-muted" style="margin:2px 0 0;font-size:14px;line-height:21px;color:${EMAIL_COLOURS.muted};">${esc(it.detail)}</p>` : ""}
</td></tr>`;
    })
    .join("");
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 12px;">${rows}</table>`,
    text: items.map((it, i) => `${i + 1}. ${it.title}${it.detail ? ` — ${it.detail}` : ""}`).join("\n"),
  };
}

/** Bulleted list with face-colour dots. */
export function bullets(items: Inline[]): Block {
  const b = items.map(inl);
  const rows = b
    .map((it, i) => {
      const c = FACE_COLOURS[i % FACE_COLOURS.length].color;
      return `<tr><td valign="top" width="22" style="width:22px;padding:9px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="8" height="8" bgcolor="${c}" style="width:8px;height:8px;border-radius:4px;background-color:${c};font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td><td valign="top" class="sc-slate" style="padding:0 0 10px;font-family:${EMAIL_FONT};font-size:15px;line-height:24px;color:${EMAIL_COLOURS.slate};">${it.html}</td></tr>`;
    })
    .join("");
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">${rows}</table>`,
    text: b.map((it) => `• ${it.text}`).join("\n"),
  };
}

/** Label/value rows in a soft panel (receipts, order details). */
export function details(rows: { label: string; value: Inline; emphasis?: boolean }[], opts: { title?: string } = {}): Block {
  const body = rows
    .map((r, i) => {
      const v = inl(r.value);
      const top = i === 0 ? "" : `border-top:1px solid ${EMAIL_COLOURS.line};`;
      return `<tr>
<td class="sc-muted sc-line sc-kv-l" valign="top" style="${top}padding:12px 12px 12px 0;font-family:${EMAIL_FONT};font-size:14px;line-height:20px;color:${EMAIL_COLOURS.muted};width:36%;">${esc(r.label)}</td>
<td class="sc-ink sc-line sc-kv-v" valign="top" align="right" style="${top}padding:12px 0;font-family:${EMAIL_FONT};font-size:${r.emphasis ? 17 : 14}px;line-height:20px;font-weight:${r.emphasis ? 700 : 600};color:${EMAIL_COLOURS.ink};text-align:right;word-break:break-word;">${v.html}</td>
</tr>`;
    })
    .join("");
  const title = opts.title
    ? `<tr><td colspan="2" class="sc-muted" style="padding:0 0 4px;font-family:${EMAIL_FONT};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_COLOURS.muted};">${esc(opts.title)}</td></tr>`
    : "";
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-panel" bgcolor="${EMAIL_COLOURS.panel}" style="background-color:${EMAIL_COLOURS.panel};border-radius:16px;margin:4px 0 24px;"><tr><td style="padding:18px 22px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${title}${body}</table></td></tr></table>`,
    text: `${opts.title ? opts.title.toUpperCase() + "\n" : ""}${rows.map((r) => `${r.label}: ${inl(r.value).text}`).join("\n")}`,
  };
}

/** Soft callout with a coloured edge (tips, privacy notes, next steps). */
export function callout(o: { title?: string; body: Inline; color?: string }): Block {
  const c = o.color ?? FACE_COLOURS[3].color;
  const b = inl(o.body);
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-panel" bgcolor="${EMAIL_COLOURS.panel}" style="background-color:${EMAIL_COLOURS.panel};border-radius:14px;margin:4px 0 24px;"><tr>
<td width="4" bgcolor="${c}" style="width:4px;background-color:${c};border-radius:14px 0 0 14px;font-size:1px;line-height:1px;">&nbsp;</td>
<td style="padding:16px 20px;font-family:${EMAIL_FONT};">
${o.title ? `<p class="sc-ink" style="margin:0 0 4px;font-size:14px;line-height:20px;font-weight:700;color:${EMAIL_COLOURS.ink};">${esc(o.title)}</p>` : ""}
<p class="sc-slate" style="margin:0;font-size:14px;line-height:22px;color:${EMAIL_COLOURS.slate};">${b.html}</p>
</td></tr></table>`,
    text: `${o.title ? o.title + ": " : ""}${b.text}`,
  };
}

/** A code learners type in (cohort codes): big, spaced, monospace. */
export function codeBox(code: string, caption?: string): Block {
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;"><tr><td align="center" class="sc-panel sc-line" bgcolor="${EMAIL_COLOURS.panel}" style="background-color:${EMAIL_COLOURS.panel};border:2px dashed #d4d4d8;border-radius:16px;padding:22px 16px;">
${caption ? `<p class="sc-muted" style="margin:0 0 8px;font-family:${EMAIL_FONT};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_COLOURS.muted};">${esc(caption)}</p>` : ""}
<p class="sc-ink" style="margin:0;font-family:${EMAIL_MONO};font-size:30px;line-height:38px;font-weight:700;letter-spacing:0.18em;color:${EMAIL_COLOURS.ink};">${esc(code)}</p>
</td></tr></table>`,
    text: `${caption ? caption + ": " : ""}${code}`,
  };
}

/** Face chips: a colour dot + name for each named face (e.g. weekly focus). */
export function faceChips(ids: string[]): Block {
  const faces = ids
    .map((id) => FACE_COLOURS.find((f) => f.id === id || f.name.toLowerCase() === String(id).toLowerCase()))
    .filter((f): f is (typeof FACE_COLOURS)[number] => Boolean(f));
  if (!faces.length) return { html: "", text: "" };
  const cells = faces
    .map(
      (f) =>
        `<td style="padding:0 8px 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="sc-chip" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid ${EMAIL_COLOURS.line};border-radius:999px;padding:7px 14px 7px 12px;font-family:${EMAIL_FONT};font-size:14px;line-height:18px;font-weight:600;color:${EMAIL_COLOURS.ink};white-space:nowrap;"><span style="display:inline-block;width:10px;height:10px;border-radius:5px;background-color:${f.color};vertical-align:-1px;">&nbsp;</span>&nbsp;&nbsp;<span class="sc-ink" style="color:${EMAIL_COLOURS.ink};">${esc(f.name)}</span></td></tr></table></td>`,
    )
    .join("");
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr>${cells}</tr></table>`,
    text: faces.map((f) => f.name).join(" · "),
  };
}

/** Responsive image (absolute URL), optionally linked. */
export function image(o: { src: string; alt: string; width?: number; href?: string; radius?: number }): Block {
  const w = o.width ?? 504;
  const img = `<img src="${esc(safeUrl(o.src))}" width="${w}" alt="${esc(o.alt)}" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;outline:none;text-decoration:none;border-radius:${o.radius ?? 16}px;" />`;
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;"><tr><td>${o.href ? `<a href="${esc(safeUrl(o.href))}">${img}</a>` : img}</td></tr></table>`,
    text: o.href ? `[${o.alt}] ${o.href}` : "",
  };
}

/** Six-face colour signature: a thin bar split into the six face colours. */
export function faceBar(height = 6): string {
  const cells = FACE_COLOURS.map(
    (f) =>
      `<td width="16.66%" height="${height}" bgcolor="${f.color}" style="width:16.66%;height:${height}px;background-color:${f.color};font-size:1px;line-height:1px;">&nbsp;</td>`,
  ).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
}

/** Six short face-colour segments: the model's signature, used in the hero. */
export function faceDots(): string {
  const cells = FACE_COLOURS.map(
    (f, i) =>
      `<td width="22" height="4" bgcolor="${f.color}" style="width:22px;height:4px;background-color:${f.color};border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td>${i < FACE_COLOURS.length - 1 ? `<td width="5" style="width:5px;font-size:1px;line-height:1px;">&nbsp;</td>` : ""}`,
  ).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;"><tr>${cells}</tr></table>`;
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export type EmailFooter = {
  /** Why they got this email, e.g. "You're receiving this because you bought …". */
  reason: string;
  /** Marketing / newsletter: one-click unsubscribe URL. */
  unsubscribeUrl?: string;
  /** Account or preferences page. */
  preferencesUrl?: string;
  preferencesLabel?: string;
};

export type RenderEmailOptions = {
  subject: string;
  /** Inbox preview line (~40–110 chars). */
  preheader: string;
  theme?: EmailTheme;
  /** Small label at the top right of the header ("Receipt", "Newsletter"…). */
  label?: string;
  eyebrow?: string;
  title: string;
  intro?: Inline;
  blocks: Block[];
  /** Sign-off line under the content. */
  signoff?: Inline;
  footer: EmailFooter;
  /** "View in browser" link (newsletters). */
  viewInBrowserUrl?: string;
  /** Override the origin for links + hosted images (previews/tests). */
  site?: string;
  /** Override the origin for hosted images only (local previews). */
  assetBase?: string;
  lang?: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const LINK_FOOT = `color:${EMAIL_COLOURS.muted};text-decoration:underline;text-underline-offset:2px;`;

const STYLE_BASE = `
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0 !important;padding:0 !important;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{-ms-interpolation-mode:bicubic;border:0;}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}
u + #body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;}
@media screen and (max-width:620px){
.sc-wrap{padding:12px 8px 24px !important;}
.sc-px{padding-left:24px !important;padding-right:24px !important;}
.sc-hero{padding:32px 24px 34px !important;}
.sc-h1{font-size:27px !important;line-height:33px !important;}
.sc-intro{font-size:16px !important;line-height:25px !important;}
.sc-label{display:none !important;}
.sc-stack{display:block !important;width:100% !important;}
.sc-stack-pad{padding:0 0 16px !important;}
.sc-kv-l{display:block !important;width:auto !important;padding:12px 0 2px !important;}
.sc-kv-v{display:block !important;width:auto !important;text-align:left !important;border-top:0 !important;padding:0 0 12px !important;}
}`;

const STYLE_DARK = `
@media (prefers-color-scheme:dark){
.sc-page{background-color:${EMAIL_COLOURS.dPage} !important;}
.sc-card{background-color:${EMAIL_COLOURS.dCard} !important;border-color:${EMAIL_COLOURS.dLine} !important;}
.sc-panel{background-color:${EMAIL_COLOURS.dPanel} !important;}
.sc-chip{background-color:${EMAIL_COLOURS.dPanel} !important;border-color:${EMAIL_COLOURS.dLine} !important;}
.sc-ink{color:${EMAIL_COLOURS.dInk} !important;}
.sc-slate{color:${EMAIL_COLOURS.dSlate} !important;}
.sc-muted,.sc-muted a{color:${EMAIL_COLOURS.dMuted} !important;}
.sc-line{border-color:${EMAIL_COLOURS.dLine} !important;}
.sc-btn-dark{background-color:#f5f5f5 !important;border-color:#f5f5f5 !important;color:#0a0a0a !important;}
.sc-btn-gold{background-color:#E9CF97 !important;border-color:#E9CF97 !important;color:#0B1320 !important;}
.sc-btn-2{background-color:transparent !important;border-color:#52525b !important;color:${EMAIL_COLOURS.dInk} !important;}
.sc-logo-light{display:none !important;}
.sc-logo-dark{display:block !important;max-height:none !important;overflow:visible !important;}
}`;

const STYLE_OGSC = `
[data-ogsc] .sc-ink{color:${EMAIL_COLOURS.dInk} !important;}
[data-ogsc] .sc-slate{color:${EMAIL_COLOURS.dSlate} !important;}
[data-ogsc] .sc-muted{color:${EMAIL_COLOURS.dMuted} !important;}
[data-ogsb] .sc-card{background-color:${EMAIL_COLOURS.dCard} !important;}
[data-ogsb] .sc-panel{background-color:${EMAIL_COLOURS.dPanel} !important;}`;

/** Hidden preheader + filler so clients don't pull body text into the preview. */
function preheaderHtml(text: string): string {
  const filler = "&#847;&zwnj;&nbsp;".repeat(60);
  return `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(text)}${filler}</div>`;
}

function footerHtml(f: EmailFooter, site: string, assets: string): string {
  const year = new Date().getFullYear();
  const links = [
    ["Learn", `${site}/learn`],
    ["Programmes", `${site}/what`],
    ["Research", `${site}/research`],
    ["Contact", `${site}/contact`],
  ]
    .map(([l, h]) => `<a href="${esc(h)}" class="sc-ink" style="color:${EMAIL_COLOURS.ink};text-decoration:none;font-weight:600;">${l}</a>`)
    .join(`<span class="sc-muted" style="color:#c4c4c8;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);
  const manage = [
    f.unsubscribeUrl ? `<a href="${esc(safeUrl(f.unsubscribeUrl))}" style="${LINK_FOOT}">Unsubscribe</a>` : "",
    f.preferencesUrl
      ? `<a href="${esc(safeUrl(f.preferencesUrl))}" style="${LINK_FOOT}">${esc(f.preferencesLabel ?? "Manage preferences")}</a>`
      : "",
    `<a href="${esc(site)}/privacy" style="${LINK_FOOT}">Privacy</a>`,
    `<a href="${esc(site)}/terms" style="${LINK_FOOT}">Terms</a>`,
  ]
    .filter(Boolean)
    .join("&nbsp;&nbsp;·&nbsp;&nbsp;");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-card" bgcolor="${EMAIL_COLOURS.card}" style="background-color:${EMAIL_COLOURS.card};border:1px solid rgba(0,0,0,0.06);border-radius:24px;margin-top:16px;">
<tr><td class="sc-px" style="padding:32px 40px 8px;font-family:${EMAIL_FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td class="sc-stack sc-stack-pad" valign="top" style="padding-right:16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle" width="34" style="width:34px;padding-right:12px;"><img src="${esc(assets)}/email/super-cube-mark.png" width="34" height="38" alt="" style="display:block;width:34px;height:auto;border:0;" /></td>
        <td valign="middle">
          <p class="sc-ink" style="margin:0;font-size:15px;line-height:20px;font-weight:700;color:${EMAIL_COLOURS.ink};">Super-Cube®</p>
          <p class="sc-muted" style="margin:2px 0 0;font-size:13px;line-height:19px;color:${EMAIL_COLOURS.muted};">Human-centric leadership, developed from the core outward.</p>
        </td>
      </tr></table>
    </td>
  </tr></table>
  <p style="margin:20px 0 0;font-size:13px;line-height:20px;">${links}</p>
  <p class="sc-muted" style="margin:16px 0 0;font-size:13px;line-height:20px;color:${EMAIL_COLOURS.muted};">
    <a href="https://bigfivegroup.africa/leadership" class="sc-ink" style="color:${EMAIL_COLOURS.ink};text-decoration:none;font-weight:600;">Big Five Learn</a> · part of <a href="https://bigfivegroup.africa" class="sc-ink" style="color:${EMAIL_COLOURS.ink};text-decoration:none;font-weight:600;">Big Five Group</a><br />
    <span style="letter-spacing:0.02em;">Feed. Educate. Empower.</span>
  </p>
  <p class="sc-muted" style="margin:12px 0 0;font-size:13px;line-height:20px;color:${EMAIL_COLOURS.muted};">
    Questions? Reply to this email or write to <a href="mailto:hello@super-cube.me" style="${LINK_FOOT}">hello@super-cube.me</a>
  </p>
</td></tr>
<tr><td class="sc-px" style="padding:20px 40px 28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="sc-line sc-muted" style="border-top:1px solid ${EMAIL_COLOURS.line};padding-top:18px;font-family:${EMAIL_FONT};font-size:12px;line-height:19px;color:${EMAIL_COLOURS.muted};">
    <p style="margin:0 0 8px;">${esc(f.reason)}</p>
    <p style="margin:0 0 8px;">${manage}</p>
    <p style="margin:0;">© ${year} Super-Cube® Leadership Model. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table>`;
}

function footerText(f: EmailFooter, site: string): string {
  return [
    "—",
    "Super-Cube® · Human-centric leadership, developed from the core outward.",
    "Big Five Learn · part of Big Five Group",
    "Feed. Educate. Empower.",
    `${site} · hello@super-cube.me`,
    "",
    f.reason,
    f.unsubscribeUrl ? `Unsubscribe: ${f.unsubscribeUrl}` : "",
    f.preferencesUrl ? `${f.preferencesLabel ?? "Manage preferences"}: ${f.preferencesUrl}` : "",
    `Privacy: ${site}/privacy · Terms: ${site}/terms`,
    `© ${new Date().getFullYear()} Super-Cube® Leadership Model. All rights reserved.`,
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
}

/** Render a complete branded email (HTML + plain text). */
export function renderEmail(o: RenderEmailOptions): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const assets = (o.assetBase ?? site).replace(/\/$/, "");
  const t = heroTheme(o.theme ?? "brand");
  const intro = o.intro !== undefined ? inl(o.intro) : null;
  const signoff = o.signoff !== undefined ? inl(o.signoff) : null;
  const gradient = `linear-gradient(120deg, ${t.stops.join(", ")})`;
  const content = o.blocks.map((b) => b.html).join("\n");

  const label = o.label
    ? `<td class="sc-label" align="right" valign="middle" style="font-family:${EMAIL_FONT};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;"><span class="sc-muted" style="color:${EMAIL_COLOURS.muted};">${esc(o.label)}</span></td>`
    : "";

  const viewOnline = o.viewInBrowserUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="sc-muted" style="padding:0 0 12px;font-family:${EMAIL_FONT};font-size:12px;line-height:18px;color:${EMAIL_COLOURS.muted};"><a href="${esc(safeUrl(o.viewInBrowserUrl))}" style="${LINK_FOOT}">View this email in your browser</a></td></tr></table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${esc(o.lang ?? "en")}" dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${esc(o.subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>*{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
<style>${STYLE_BASE}</style>
<style>${STYLE_DARK}</style>
<style>${STYLE_OGSC}</style>
</head>
<body id="body" class="sc-page" style="margin:0;padding:0;background-color:${EMAIL_COLOURS.page};word-spacing:normal;">
${preheaderHtml(o.preheader)}
<div role="article" aria-roledescription="email" aria-label="${esc(o.subject)}" lang="${esc(o.lang ?? "en")}" class="sc-page" style="background-color:${EMAIL_COLOURS.page};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-page" bgcolor="${EMAIL_COLOURS.page}" style="background-color:${EMAIL_COLOURS.page};">
<tr><td align="center" class="sc-wrap" style="padding:28px 16px 40px;">
<!--[if mso]><table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<div style="max-width:600px;margin:0 auto;">
${viewOnline}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-card" bgcolor="${EMAIL_COLOURS.card}" style="background-color:${EMAIL_COLOURS.card};border:1px solid rgba(0,0,0,0.06);border-radius:24px;">
<tr><td class="sc-px" style="padding:26px 40px 22px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle" align="left">
      <a href="${esc(site)}" style="text-decoration:none;display:inline-block;">
        <img class="sc-logo-light" src="${esc(assets)}/email/super-cube-logo.png" width="170" height="36" alt="Super-Cube®" style="display:block;width:170px;height:auto;border:0;outline:none;color:${EMAIL_COLOURS.ink};font-family:${EMAIL_FONT};font-size:20px;font-weight:700;" />
        <!--[if !mso]><!--><div class="sc-logo-dark" style="display:none;max-height:0;overflow:hidden;mso-hide:all;"><img src="${esc(assets)}/email/super-cube-logo-light.png" width="170" height="36" alt="Super-Cube®" style="display:block;width:170px;height:auto;border:0;outline:none;color:#f5f5f5;font-family:${EMAIL_FONT};font-size:20px;font-weight:700;" /></div><!--<![endif]-->
      </a>
    </td>
    ${label}
  </tr></table>
</td></tr>
<tr><td style="padding:0 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:18px;"><tr>
  <td class="sc-hero" bgcolor="${t.solid}" style="background-color:${t.solid};background-image:${gradient};border-radius:18px;padding:40px 36px 36px;font-family:${EMAIL_FONT};color:${t.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="font-family:${EMAIL_FONT};">${o.eyebrow ? `<p style="margin:0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${t.accent};">${esc(o.eyebrow)}</p>` : "&nbsp;"}</td>
      <td valign="middle" align="right" width="36" style="width:36px;"><img src="${esc(assets)}/email/super-cube-mark.png" width="32" height="36" alt="" style="display:block;width:32px;height:auto;border:0;" /></td>
    </tr></table>
    <div style="height:14px;line-height:14px;font-size:1px;">&nbsp;</div>
    <h1 class="sc-h1" style="margin:0;font-size:32px;line-height:38px;font-weight:700;letter-spacing:-0.025em;color:${t.ink};">${esc(o.title)}</h1>
    ${intro ? `<p class="sc-intro" style="margin:14px 0 0;font-size:17px;line-height:27px;color:${t.ink};opacity:0.92;">${intro.html}</p>` : ""}
    ${faceDots()}
  </td></tr>
  </table>
</td></tr>
<tr><td class="sc-px" style="padding:36px 40px 20px;font-family:${EMAIL_FONT};">
${content}
${signoff ? `<p class="sc-slate" style="${P}margin-top:8px;">${signoff.html}</p>` : ""}
</td></tr>
</table>
${footerHtml(o.footer, site, assets)}
</div>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</div>
</body>
</html>`;

  const text = [
    o.viewInBrowserUrl ? `View in your browser: ${o.viewInBrowserUrl}\n` : "",
    `SUPER-CUBE®${o.label ? ` · ${o.label.toUpperCase()}` : ""}`,
    "",
    o.eyebrow ? o.eyebrow.toUpperCase() : "",
    o.title,
    intro ? `\n${intro.text}` : "",
    "",
    ...o.blocks.map((b) => b.text).filter(Boolean).flatMap((t) => [t, ""]),
    signoff ? signoff.text : "",
    "",
    footerText(o.footer, site),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject: o.subject, html, text: `${text}\n` };
}

// ---------------------------------------------------------------------------
// Newsletter campaign layout (shared with the newsletter feature)
// ---------------------------------------------------------------------------

export type NewsletterSection = {
  eyebrow?: string;
  title: string;
  /** Paragraphs (plain text; escaped). */
  paragraphs: Inline[];
  /** Face id (choices, principles…) to colour the section marker. */
  face?: string;
  image?: { src: string; alt: string; href?: string };
  cta?: { href: string; label: string };
};

export type NewsletterEmailOptions = {
  subject: string;
  preheader: string;
  /** e.g. "October 2026" */
  issueLabel: string;
  title: string;
  intro?: Inline;
  sections: NewsletterSection[];
  /** Main call to action at the end. */
  cta?: { href: string; label: string };
  signoff?: Inline;
  /** Per-recipient one-click unsubscribe URL (required for campaigns). */
  unsubscribeUrl: string;
  viewInBrowserUrl?: string;
  theme?: EmailTheme;
  site?: string;
  assetBase?: string;
};

/** Newsletter: the same shell with issue header, face-marked sections and unsubscribe. */
export function newsletterEmail(o: NewsletterEmailOptions): RenderedEmail {
  const blocks: Block[] = [];
  o.sections.forEach((s, i) => {
    if (i > 0) blocks.push(divider());
    const face = s.face ? FACE_COLOURS.find((f) => f.id === s.face) : undefined;
    const marker = face
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;"><tr><td width="28" height="4" bgcolor="${face.color}" style="width:28px;height:4px;background-color:${face.color};border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`
      : "";
    blocks.push({ html: marker, text: "" });
    blocks.push(heading(s.title, { eyebrow: s.eyebrow ?? face?.name }));
    if (s.image) blocks.push(image({ ...s.image }));
    s.paragraphs.forEach((p) => blocks.push(paragraph(p)));
    if (s.cta) blocks.push(button({ href: s.cta.href, label: s.cta.label, theme: o.theme, variant: "secondary" }));
  });
  if (o.cta) {
    blocks.push(divider());
    blocks.push(button({ href: o.cta.href, label: o.cta.label, theme: o.theme, align: "center" }));
  }
  return renderEmail({
    subject: o.subject,
    preheader: o.preheader,
    theme: o.theme ?? "brand",
    label: "Newsletter",
    eyebrow: o.issueLabel,
    title: o.title,
    intro: o.intro,
    blocks,
    signoff: o.signoff,
    viewInBrowserUrl: o.viewInBrowserUrl,
    site: o.site,
    assetBase: o.assetBase,
    footer: {
      reason: "You're receiving this because you subscribed to the Super-Cube® newsletter with this address.",
      unsubscribeUrl: o.unsubscribeUrl,
    },
  });
}
