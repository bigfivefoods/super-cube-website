"use client";

import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { constructs, footerColumns } from "@/lib/content";
import {
  faceI18n,
  footerColI18n,
  mainNavI18n,
  moreLinkI18n,
} from "@/lib/i18n";

export function Footer() {
  const { t } = useLocale();

  function linkLabel(href: string, fallback: string) {
    const fromMap = mainNavI18n[href] || moreLinkI18n[href];
    return fromMap ? t(fromMap) : fallback;
  }

  return (
    <footer className="border-t border-black/[0.08] bg-[#fafafa] text-ink">
      <div className="container-site section-pad pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-6 border-b border-black/[0.06] pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <BrandWordmark height={24} />
            <p className="mt-3 text-sm leading-relaxed tracking-tight text-slate">
              {t("footer.tagline")}
            </p>
            <p className="mt-2 text-xs text-muted">{t("footer.credit")}</p>
            <div className="mt-5">
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/learn/start"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold tracking-tight text-white hover:bg-ink-soft"
            >
              {t("footer.startFree")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 text-sm font-semibold tracking-tight text-ink hover:border-black/25"
            >
              {t("footer.contact")}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12 lg:grid-cols-4 lg:gap-x-14">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {t(footerColI18n[col.title] || "footer.product")}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="text-sm tracking-tight text-slate transition hover:text-ink"
                    >
                      {linkLabel(item.href, item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-black/[0.06] pt-8">
          <div className="mb-3.5 flex items-baseline justify-between gap-3">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("footer.sixFaces")}
            </h3>
            <Link
              href="/constructs"
              className="text-xs font-semibold tracking-tight text-ink underline-offset-2 hover:underline"
            >
              {t("footer.allConstructs")}
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {constructs.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/constructs#${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[0.8125rem] font-medium tracking-tight text-ink transition hover:border-black/15"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.color }}
                    aria-hidden
                  />
                  {t(faceI18n[c.id] || "nav.sixFaces")}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-black/[0.06] pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
            <Link href="/privacy" className="hover:text-ink">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-ink">
              {t("footer.terms")}
            </Link>
            <Link href="/login" className="hover:text-ink">
              {t("nav.signIn")}
            </Link>
            <span className="text-muted/80">{t("footer.journals")}</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
