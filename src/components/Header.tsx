"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { constructs, exploreNavGroups, mainNav } from "@/lib/content";
import { darkHeroPaths, lightHeroPaths } from "@/lib/hero-media";
import {
  faceI18n,
  mainNavI18n,
  moreGroupI18n,
  moreLinkI18n,
} from "@/lib/i18n";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/learn/start") {
    return pathname === "/learn" || pathname.startsWith("/learn/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function matchesPath(pathname: string, paths: readonly string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function Header() {
  const pathname = usePathname();
  const { t } = useLocale();
  const explorePanelId = useId();
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLightHero = matchesPath(pathname, lightHeroPaths);
  const isDarkHero = matchesPath(pathname, darkHeroPaths);
  const overHero = (isDarkHero || isLightHero) && !scrolled && !open;
  const overDark = overHero && isDarkHero;
  const overLight = overHero && isLightHero;

  const exploreActive = exploreNavGroups.some((g) =>
    g.links.some((item) => linkActive(pathname, item.href)),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setExploreOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinkClass = (active: boolean) => {
    if (overDark) {
      return `rounded-full px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
        active
          ? "bg-white text-ink"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`;
    }
    if (overLight) {
      return `rounded-full px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
        active
          ? "bg-ink text-white"
          : "text-ink/80 hover:bg-black/[0.06] hover:text-ink"
      }`;
    }
    return `rounded-full px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
      active
        ? "bg-ink text-white"
        : "text-slate hover:bg-black/[0.04] hover:text-ink"
    }`;
  };

  const quietLinkClass = () => {
    if (overDark) {
      return "text-sm font-medium tracking-tight text-white/80 transition-colors hover:text-white";
    }
    if (overLight) {
      return "text-sm font-medium tracking-tight text-ink/75 transition-colors hover:text-ink";
    }
    return "text-sm font-medium tracking-tight text-slate transition-colors hover:text-ink";
  };

  const headerSurface = overDark
    ? "border-b border-transparent bg-transparent"
    : overLight
      ? "border-b border-transparent bg-[#e8e8e8]/90 backdrop-blur-md"
      : "border-b border-black/[0.06] bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl";

  function navLabel(href: string, fallback: string) {
    const key = mainNavI18n[href] || moreLinkI18n[href];
    return key ? t(key) : fallback;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${headerSurface}`}
    >
      <div className="container-site flex h-14 items-center justify-between gap-2 md:gap-3 lg:h-16">
        <BrandWordmark
          height={26}
          className={`min-w-0 max-w-[min(100%,10rem)] shrink sm:max-w-none ${
            overDark ? "brightness-0 invert" : ""
          }`}
        />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={t("nav.main")}
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(linkActive(pathname, item.href))}
            >
              {navLabel(item.href, item.label)}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              className={navLinkClass(exploreOpen || exploreActive)}
              aria-expanded={exploreOpen}
              aria-haspopup="true"
              aria-controls={explorePanelId}
              onClick={() => setExploreOpen((v) => !v)}
            >
              {t("nav.explore")}
              <span className="ml-1 text-[0.65rem] opacity-60" aria-hidden>
                ▾
              </span>
            </button>
            {exploreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  aria-label={t("nav.close")}
                  onClick={() => setExploreOpen(false)}
                />
                <div
                  id={explorePanelId}
                  className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,40rem)] rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xl"
                  role="menu"
                >
                  <div className="grid grid-cols-3 gap-5">
                    {exploreNavGroups.map((group) => (
                      <div key={group.title}>
                        <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          {t(moreGroupI18n[group.title] || "nav.explore")}
                        </p>
                        {"description" in group && group.description ? (
                          <p className="mt-1 px-1 text-[0.6875rem] leading-snug text-muted/90">
                            {group.description}
                          </p>
                        ) : null}
                        <ul className="mt-2.5 space-y-0.5">
                          {group.links.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                role="menuitem"
                                className="block rounded-lg px-2 py-1.5 text-sm font-medium tracking-tight text-ink hover:bg-black/[0.04]"
                                onClick={() => setExploreOpen(false)}
                              >
                                {navLabel(item.href, item.label)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            href="/contact"
            className={navLinkClass(pathname === "/contact")}
          >
            {t("nav.contact")}
          </Link>

          <div
            className={`ml-1 flex items-center gap-3 border-l pl-3 ${
              overDark ? "border-white/20" : "border-black/[0.08]"
            }`}
          >
            <LanguageSwitcher overDark={overDark} variant="compact" />
            <Link href="/login" className={quietLinkClass()}>
              {t("nav.signIn")}
            </Link>
            <Link
              href="/learn/start"
              className={`rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition ${
                overDark
                  ? "bg-white text-ink hover:bg-white/90"
                  : "bg-ink text-white hover:bg-ink-soft"
              }`}
            >
              {t("nav.startFree")}
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher overDark={overDark} variant="compact" />
          <button
            type="button"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border touch-manipulation ${
              overDark
                ? "border-white/25 bg-white/10 text-white"
                : "border-black/[0.1] bg-white/80 text-ink"
            }`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.open")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{t("nav.menu")}</span>
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 block h-px w-full transition ${
                  overDark ? "bg-white" : "bg-ink"
                } ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-px w-full transition ${
                  overDark ? "bg-white" : "bg-ink"
                } ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 block h-px w-full transition ${
                  overDark ? "bg-white" : "bg-ink"
                } ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="max-h-[min(100dvh,100svh)] overflow-y-auto overscroll-contain border-t border-black/[0.06] bg-white lg:hidden"
          style={{
            maxHeight:
              "calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))",
          }}
        >
          <nav
            className="container-site flex flex-col py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            aria-label={t("nav.menu")}
          >
            <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("nav.main")}
            </p>
            <div className="flex flex-col gap-0.5">
              {mainNav.map((item) => {
                const active = linkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-3 text-base font-semibold tracking-tight ${
                      active
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-black/[0.04]"
                    }`}
                  >
                    {navLabel(item.href, item.label)}
                  </Link>
                );
              })}
            </div>

            {exploreNavGroups.map((group) => (
              <div key={group.title} className="mt-5">
                <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t(moreGroupI18n[group.title] || "nav.explore")}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium tracking-tight text-ink hover:bg-black/[0.04]"
                    >
                      {navLabel(item.href, item.label)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <p className="mt-5 px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("nav.sixFaces")}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {constructs.map((c) => (
                <Link
                  key={c.id}
                  href={`/constructs#${c.id}`}
                  className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-2.5 text-[0.875rem] font-semibold tracking-tight text-ink"
                  style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
                >
                  {t(faceI18n[c.id] || "nav.sixFaces")}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-0.5 border-t border-black/[0.06] pt-4">
              <Link
                href="/contact"
                className="rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium tracking-tight text-ink hover:bg-black/[0.04]"
              >
                {t("nav.contact")}
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium tracking-tight text-slate hover:bg-black/[0.04] hover:text-ink"
              >
                {t("nav.signIn")}
              </Link>
            </div>

            <div className="mt-4 px-1">
              <LanguageSwitcher variant="footer" />
            </div>

            <Link
              href="/learn/start"
              className="mt-5 rounded-full bg-ink px-4 py-3.5 text-center text-base font-semibold tracking-tight text-white"
            >
              {t("nav.startFreeBaseline")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
