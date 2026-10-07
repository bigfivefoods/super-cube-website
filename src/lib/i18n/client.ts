"use client";

import { useEffect, useLayoutEffect, useReducer } from "react";
import type { Locale } from "./config";
import en, { type Dict } from "./dict/en";
import { LOCALE_DATA_ID } from "./dataId";

/**
 * Strings for client components, one language at a time (the bigfivegroup.africa pattern): the
 * browser bundle carries English only. A translated page ships its own language as inert JSON
 * (<LocaleData> in src/app/[locale]/layout.tsx), read here on hydration so the first render
 * matches the server. Server rendering reads every language from i18n/dictionaries.
 */

const cache: Partial<Record<Locale, Dict>> = { en };

const LOADERS: Record<Exclude<Locale, "en">, () => Promise<{ default: Dict }>> = {
  fr: () => import("./dict/fr"),
  ar: () => import("./dict/ar"),
  pt: () => import("./dict/pt"),
  sw: () => import("./dict/sw"),
  zu: () => import("./dict/zu"),
  af: () => import("./dict/af"),
};

/** The strings for `locale` if they are already here (bundle, cache or the page's JSON), else undefined. */
export function peekDict(locale: Locale): Dict | undefined {
  const hit = cache[locale];
  if (hit) return hit;
  if (typeof window === "undefined") {
    // Server render only: this branch is dropped from the browser bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DICTS } = require("./dictionaries") as typeof import("./dictionaries");
    return DICTS[locale];
  }
  const el = document.getElementById(LOCALE_DATA_ID);
  if (el?.dataset.locale === locale && el.textContent) {
    try {
      cache[locale] = JSON.parse(el.textContent) as Dict;
      return cache[locale];
    } catch {
      /* fall through to the loader */
    }
  }
  return undefined;
}

/** Loads a language's strings (own chunk) when the page did not carry them. */
export async function loadDict(locale: Locale): Promise<Dict> {
  const hit = peekDict(locale);
  if (hit) return hit;
  const mod = await LOADERS[locale as Exclude<Locale, "en">]();
  cache[locale] = mod.default;
  return mod.default;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Strings for `locale`. On a client-side switch into another language the page's JSON lands in
 * the same commit, so the layout effect re-reads it before paint; a missing language loads its chunk.
 */
export function useDict(locale: Locale): Dict {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const dict = peekDict(locale);
  useIsoLayoutEffect(() => {
    if (dict) return;
    if (peekDict(locale)) {
      rerender();
      return;
    }
    let live = true;
    void loadDict(locale).then(() => live && rerender());
    return () => {
      live = false;
    };
  }, [locale, dict]);
  return dict ?? en;
}
