"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { rememberLocale } from "@/components/LanguageSwitcher";

/**
 * The URL is the language. Remember it so a later unprefixed /learn link
 * (a bookmark, or a control that still points at English) opens this language.
 * Middleware leaves /learn alone when the cookie is already English.
 */
export function LearnLocaleSync() {
  const { locale } = useLocale();
  useEffect(() => {
    rememberLocale(locale);
  }, [locale]);
  return null;
}
