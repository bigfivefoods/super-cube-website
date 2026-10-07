"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { shareLinks, shareUrl } from "@/lib/news/share";

/**
 * Share row for /news posts (in the hero and again at the end of the article), as on
 * bigfivegroup.africa/updates: LinkedIn, WhatsApp, X, Facebook, Email and Copy link, plus the
 * device share sheet on phones and tablets that support it. Plain links only, no SDKs.
 */

/* Brand marks (Simple Icons, CC0) and UI icons, drawn in currentColor. */
const PATHS: Record<string, ReactNode> = {
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  ),
  whatsapp: (
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  ),
  x: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />,
  facebook: (
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" />
  ),
};

function Brand({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden focusable="false">
      {PATHS[name]}
    </svg>
  );
}

function Stroke({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

const MailIcon = () => (
  <Stroke>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Stroke>
);
const LinkIcon = () => (
  <Stroke>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </Stroke>
);
const CheckIcon = () => (
  <Stroke>
    <path d="M20 6 9 17l-5-5" />
  </Stroke>
);
const ShareIcon = () => (
  <Stroke>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </Stroke>
);

/** Copies text, with a textarea fallback for browsers without the async Clipboard API. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function ShareButtons({
  url,
  title,
  summary = "",
  tone = "light",
  label = "Share this post",
  position,
}: {
  /** Absolute canonical URL of the post (no query string). */
  url: string;
  /** Plain title (no ®). */
  title: string;
  /** Short summary for the email body and the share sheet. */
  summary?: string;
  /** "dark" on the post hero; "light" at the end of the article. */
  tone?: "dark" | "light";
  label?: string;
  position: "top" | "bottom";
}) {
  const labelId = useId();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const links = shareLinks(url, title, summary);

  useEffect(() => {
    const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection must run after hydration
    setCanNativeShare(touch && typeof navigator.share === "function");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onCopy = async () => {
    const ok = await copyText(shareUrl(url, "copy"));
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  const onNativeShare = async () => {
    try {
      await navigator.share({ title, text: summary || title, url: shareUrl(url, "native") });
    } catch {
      /* dismissed */
    }
  };

  const dark = tone === "dark";
  const btn = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
    dark
      ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-black focus-visible:outline-white"
      : "border-line-strong bg-paper text-ink hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-ink"
  }`;

  const networks = [
    { key: "linkedin", name: "LinkedIn", href: links.linkedin },
    { key: "whatsapp", name: "WhatsApp", href: links.whatsapp },
    { key: "x", name: "X", href: links.x },
    { key: "facebook", name: "Facebook", href: links.facebook },
  ];

  return (
    <div className="news-share" data-share={position}>
      <div className="mb-2 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1">
        <span
          id={labelId}
          className={`text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${dark ? "text-white/75" : "text-slate"}`}
        >
          {label}
        </span>
        <span role="status" aria-live="polite" className={`text-[0.6875rem] font-semibold ${dark ? "text-white" : "text-ink"}`}>
          {copied ? "Link copied" : ""}
        </span>
      </div>
      <ul role="list" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
        {canNativeShare && (
          <li>
            <button
              type="button"
              onClick={onNativeShare}
              className={btn}
              aria-label="Share using your device"
              title="Share"
              data-share-network="native"
            >
              <ShareIcon />
            </button>
          </li>
        )}
        {networks.map((n) => (
          <li key={n.key}>
            <a
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className={btn}
              aria-label={`Share on ${n.name} (opens in a new tab)`}
              title={`Share on ${n.name}`}
              data-share-network={n.key}
            >
              <Brand name={n.key} />
            </a>
          </li>
        ))}
        <li>
          <a href={links.email} className={btn} aria-label="Share by email" title="Share by email" data-share-network="email">
            <MailIcon />
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={onCopy}
            className={btn}
            aria-label={copied ? "Link copied" : "Copy link"}
            title="Copy link"
            data-share-network="copy"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
          </button>
        </li>
      </ul>
    </div>
  );
}
