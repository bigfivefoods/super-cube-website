"use client";

import { useCallback } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { fillCopy, lmsText, localizeDeep } from "@/lib/i18n/lms/text";

/**
 * Learn strings and localised paths for the language in the URL.
 * Progress lives in localStorage and on the account, not in the path, so switching
 * language keeps the same attempt, lessons and draft.
 */
export function useLmsT() {
  const { locale, L, basePath, pathname } = useLocale();
  const t = useCallback((s: string) => lmsText(locale, s), [locale]);
  const td = useCallback(<V,>(value: V) => localizeDeep(locale, value), [locale]);
  const fill = useCallback(
    (template: string, vars?: Record<string, string | number>) => fillCopy(t(template), vars),
    [t],
  );
  return { locale, L, t, td, fill, basePath, pathname };
}
