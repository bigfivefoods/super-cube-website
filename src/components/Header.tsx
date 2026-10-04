"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { audienceNav, menuMoreNav } from "@/lib/content";
import { darkHeroPaths, lightHeroPaths } from "@/lib/hero-media";
import { mainNavI18n, moreLinkI18n, type I18nKey } from "@/lib/i18n";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function matchesPath(pathname: string, paths: readonly string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="opacity-40">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Site header (Phase 3).
 * Audience-first IA: Individuals · Organisations · Schools · Speaking ·
 * Research · Pricing, with one primary CTA (Start free baseline).
 * Transparent over dark photo heroes, frosted glass once scrolled.
 */
export function Header() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { resolvedDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isLightHero = matchesPath(pathname, lightHeroPaths);
  const isDarkHero = matchesPath(pathname, darkHeroPaths);
  const overHero = (isDarkHero || isLightHero) && !scrolled && !open;
  const overDark = overHero && isDarkHero;
  const overLight = overHero && isLightHero;
  const onDark = overDark || (resolvedDark && !overLight);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation (render-time reset, no effect needed).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menuRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function label(href: string, fallback: string, key?: string) {
    const k = (key as I18nKey | undefined) || mainNavI18n[href] || moreLinkI18n[href];
    return k ? t(k) : fallback;
  }

  const surface = overDark
    ? "border-transparent bg-transparent"
    : overLight
      ? "border-transparent bg-white/60 backdrop-blur-md dark:bg-black/50"
      : onDark
        ? "border-white/10 bg-black/75 backdrop-blur-xl backdrop-saturate-150"
        : "border-line bg-paper/80 backdrop-blur-xl backdrop-saturate-150";

  const linkCls = (active: boolean) =>
    `relative inline-flex min-h-9 items-center rounded-full px-3 text-[0.8125rem] font-medium tracking-tight transition-colors ${
      onDark
        ? active
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active
          ? "text-ink"
          : "text-slate hover:text-ink"
    } ${active ? "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:bg-current" : ""}`;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,border-color] duration-300 ${surface}`}
    >
      <div className="container-site flex h-14 items-center justify-between gap-3 lg:h-16">
        <BrandWordmark
          height={26}
          className={`min-w-0 max-w-[min(100%,10rem)] shrink sm:max-w-none ${onDark ? "brightness-0 invert" : ""}`}
        />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("nav.main")}>
          {audienceNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls(linkActive(pathname, item.href))}
              aria-current={linkActive(pathname, item.href) ? "page" : undefined}
            >
              {label(item.href, item.label, item.i18n)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher overDark={onDark} variant="compact" />
          <Link
            href="/login"
            className={`hidden min-h-9 items-center text-[0.8125rem] font-medium tracking-tight xl:inline-flex ${
              onDark ? "text-white/70 hover:text-white" : "text-slate hover:text-ink"
            }`}
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/learn/start"
            className={`inline-flex min-h-9 items-center rounded-full px-4 text-[0.8125rem] font-semibold tracking-tight transition ${
              onDark ? "bg-white text-black hover:bg-white/90" : "sc-btn-primary"
            }`}
          >
            {t("nav.startFreeBaseline")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher overDark={onDark} variant="compact" />
          <button
            ref={toggleRef}
            type="button"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full touch-manipulation ${
              onDark ? "text-white" : "text-ink"
            }`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.open")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 block h-[1.5px] w-full rounded bg-current transition-transform duration-300 ${
                  open ? "top-[5px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full rounded bg-current transition-transform duration-300 ${
                  open ? "top-[5px] -rotate-45" : "top-[10px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        ref={menuRef}
        hidden={!open}
        className="mobile-sheet fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] overflow-y-auto overscroll-contain bg-paper lg:hidden"
      >
        <nav className="container-site flex min-h-full flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2" aria-label={t("nav.menu")}>
          <ul className="divide-y divide-line">
            {audienceNav.map((item) => {
              const active = linkActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="flex min-h-14 items-center justify-between text-[1.375rem] font-semibold tracking-[-0.02em] text-ink"
                  >
                    {label(item.href, item.label, item.i18n)}
                    <Chevron />
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="eyebrow mt-8">{t("nav.moreLinks")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4">
            {menuMoreNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-[0.9375rem] font-medium tracking-tight text-slate hover:text-ink"
                >
                  {label(item.href, item.label)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="flex min-h-11 items-center text-[0.9375rem] font-medium tracking-tight text-slate hover:text-ink"
              >
                {t("nav.signIn")}
              </Link>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <LanguageSwitcher variant="footer" />
            <ThemeToggle />
          </div>

          <div className="mt-auto pt-8">
            <Link
              href="/learn/start"
              className="sc-btn-primary flex min-h-12 items-center justify-center rounded-full px-5 text-base font-semibold tracking-tight"
            >
              {t("nav.startFreeBaseline")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
