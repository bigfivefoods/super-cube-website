"use client";

import { useLocale } from "@/components/LocaleProvider";

/** "Skip to main content" in the page's language. */
export function SkipLink() {
  const { t } = useLocale();
  return (
    <a href="#main-content" className="skip-link">
      {t("a11y.skip")}
    </a>
  );
}
