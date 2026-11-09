import type { Metadata } from "next";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n/config";
import { pageMeta, localeMeta } from "@/lib/seo";
import { lmsText } from "./text";

function ensureCatalogues() {
  // Side effect: catalogues.ts installs the maps lmsText reads on the server.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./catalogues");
}

export type LearnMetaInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

/**
 * Metadata for a Learn screen. English routes keep pageMeta. Prefixed routes
 * (`/fr/learn/…`) get a localised title, canonical and hreflang cluster.
 */
export function learnMetadata(locale: string | undefined, meta: LearnMetaInput): Metadata {
  if (!isPrefixedLocale(locale)) return pageMeta(meta);
  ensureCatalogues();
  const lang = locale as PrefixedLocale;
  return localeMeta({
    locale: lang,
    path: meta.path,
    title: lmsText(lang, meta.title),
    description: lmsText(lang, meta.description),
    noIndex: meta.noIndex,
  });
}
