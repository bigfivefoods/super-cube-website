"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

/** Share / copy the public check link. No scores or personal details go into the URL. */
export function ShareCertificate({ url, title }: { url: string; title: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const { t } = useLocale();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMsg(t("share.copied"));
    } catch {
      setMsg(url);
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cancelled: fall through to copy
      }
    }
    await copy();
  }

  const btn =
    "sc-btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-transparent px-5 py-2.5 text-sm font-semibold tracking-tight text-ink hover:border-black/30 hover:bg-black/[0.03] sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

  return (
    <>
      <button type="button" onClick={share} className={btn}>
        {t("share.short")}
      </button>
      <button type="button" onClick={copy} className={btn}>
        {t("share.copy")}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        {t("share.linkedin")}<span className="sr-only"> {t("share.newTab")}</span>
      </a>
      <p role="status" aria-live="polite" className="w-full text-sm text-muted">
        {msg}
      </p>
    </>
  );
}
