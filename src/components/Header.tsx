"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { MobileModelSection, ModelMegaMenu } from "@/components/ModelMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { audienceNav, menuMoreNav, modelMenuFoldedHrefs } from "@/lib/content";
import { isDarkHeroPath, lightHeroPaths } from "@/lib/hero-media";
import { isEnglishOnlyHref, mainNavI18n, moreLinkI18n, type I18nKey } from "@/lib/i18n";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Hero lists name exact pages. (A prefix match made /insights/[slug], a plain
 * white article page, inherit the dark /insights hero and hide the header.)
 */
function matchesPath(pathname: string, paths: readonly string[]) {
  return paths.includes(pathname);
}

/** Pages that live under "The Model" in the top bar. */
const modelPaths = ["/the-model", "/constructs", ...modelMenuFoldedHrefs];

/** Desktop bar: Research is folded into The Model menu (see content.ts). */
const desktopNav = audienceNav.filter((item) => !modelMenuFoldedHrefs.includes(item.href));

/** Mobile "More" list: the model pages now sit in The Model section. */
const mobileMoreNav = menuMoreNav.filter((item) => item.href !== "/the-model" && item.href !== "/constructs");

/** Has this device started the Learn journey? (Kept tiny: the header is on every page.) */
function readStarted(): boolean {
  try {
    const raw = localStorage.getItem("supercube_lms_v1");
    if (!raw) return false;
    const s = JSON.parse(raw) as {
      profile?: unknown;
      attempts?: unknown[];
      orientation?: unknown;
      lessonProgress?: Record<string, unknown>;
    };
    return Boolean(s.profile || s.orientation || (s.attempts && s.attempts.length) || (s.lessonProgress && Object.keys(s.lessonProgress).length));
  } catch {
    return false;
  }
}

function subscribeStarted(cb: () => void) {
  window.addEventListener("sc-lms-update", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("sc-lms-update", cb);
    window.removeEventListener("storage", cb);
  };
}

function useLearnStarted(): boolean {
  return useSyncExternalStore(subscribeStarted, readStarted, () => false);
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
  // basePath: the English path behind /fr/… etc., so heroes and active links match in every language.
  const { t, L, locale, basePath: pathname } = useLocale();
  /** hrefLang="en" on links to pages that stay English while reading another language. */
  const enLang = (href: string) => (isEnglishOnlyHref(locale, href) ? "en" : undefined);
  const { resolvedDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [mobileModelOpen, setMobileModelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Inside the Learn app the site's marketing links step back: Learn has its own navigation.
  const inLearn = pathname === "/learn" || pathname.startsWith("/learn/");
  const started = useLearnStarted();
  const showStartCta = !(inLearn && started);

  const isLightHero = matchesPath(pathname, lightHeroPaths);
  const isDarkHero = isDarkHeroPath(pathname);
  // An open menu (mobile sheet or The Model panel) always gets a solid header.
  const overHero = (isDarkHero || isLightHero) && !scrolled && !open && !modelOpen;
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
    setModelOpen(false);
    setMobileModelOpen(false);
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

  // When the menu is open the header must be solid with no backdrop-filter:
  // a backdrop-filter would become the containing block for the fixed sheet.
  const surface = open || modelOpen
    ? "border-line bg-paper"
    : overDark
    ? "border-transparent bg-transparent"
    : overLight
      ? "border-transparent bg-white/60 backdrop-blur-md dark:bg-black/50"
      : onDark
        ? "border-white/10 bg-black/75 backdrop-blur-xl backdrop-saturate-150"
        : "border-line bg-paper/80 backdrop-blur-xl backdrop-saturate-150";

  const linkCls = (active: boolean) =>
    `relative inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-2.5 text-[0.8125rem] font-medium tracking-tight transition-colors ${
      onDark
        ? active
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active
          ? "text-ink"
          : "text-slate hover:text-ink"
    } ${active ? "after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-px after:bg-current" : ""}`;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,border-color] duration-300 ${surface}`}
    >
      <div className="container-site flex h-14 items-center justify-between gap-3 lg:h-16">
        <BrandWordmark
          href={L("/")}
          label={t("nav.homeLabel")}
          height={26}
          className={`min-w-0 max-w-[min(100%,10rem)] shrink sm:max-w-none ${onDark ? "brightness-0 invert" : ""}`}
        />

        <nav className={`hidden items-center self-stretch ${inLearn ? "" : "lg:flex"}`} aria-label={t("nav.main")}>
          <ModelMegaMenu
            open={modelOpen}
            onOpenChange={setModelOpen}
            active={modelPaths.some((p) => linkActive(pathname, p))}
            buttonClassName={linkCls(modelPaths.some((p) => linkActive(pathname, p)))}
          />
          {desktopNav.map((item) => (
            <Link
              key={item.href}
              href={L(item.href)}
              hrefLang={enLang(item.href)}
              className={linkCls(linkActive(pathname, item.href))}
              aria-current={linkActive(pathname, item.href) ? "page" : undefined}
            >
              {label(item.href, item.label, item.i18n)}
            </Link>
          ))}
          {/* News joins the bar from 1280px; below that the bar keeps six items on one line (menu + footer link it). */}
          <Link
            href="/news"
            hrefLang={enLang("/news")}
            className={`${linkCls(linkActive(pathname, "/news"))} max-xl:hidden`}
            aria-current={linkActive(pathname, "/news") ? "page" : undefined}
          >
            {t("nav.news")}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher overDark={onDark} />
          <Link
            href="/login"
            hrefLang={enLang("/login")}
            className={`hidden min-h-9 items-center whitespace-nowrap text-[0.8125rem] font-medium tracking-tight ${inLearn ? "lg:inline-flex" : "xl:inline-flex"} ${
              onDark ? "text-white/70 hover:text-white" : "text-slate hover:text-ink"
            }`}
          >
            {t("nav.signIn")}
          </Link>
          {inLearn && (
            <Link
              href={L("/")}
              className={`inline-flex min-h-9 items-center whitespace-nowrap text-[0.8125rem] font-medium tracking-tight ${
                onDark ? "text-white/70 hover:text-white" : "text-slate hover:text-ink"
              }`}
            >
              {t("nav.homeLabel")}
            </Link>
          )}
          {showStartCta && (
            <Link
              href="/learn/start"
              hrefLang={enLang("/learn/start")}
              className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-4 text-[0.8125rem] font-semibold tracking-tight transition ${
                onDark ? "bg-white text-black hover:bg-white/90" : "sc-btn-primary"
              }`}
            >
              {t("nav.startFreeBaseline")}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-0.5 lg:hidden">
          <LanguageSwitcher overDark={onDark} />
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
            <li>
              <MobileModelSection
                expanded={mobileModelOpen}
                onToggle={() => setMobileModelOpen((v) => !v)}
                onNavigate={() => setOpen(false)}
              />
            </li>
            {audienceNav.map((item) => {
              const active = linkActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={L(item.href)}
                    hrefLang={enLang(item.href)}
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
            {mobileMoreNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={L(item.href)}
                  hrefLang={enLang(item.href)}
                  className="flex min-h-11 items-center text-[0.9375rem] font-medium tracking-tight text-slate hover:text-ink"
                >
                  {label(item.href, item.label)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                hrefLang={enLang("/login")}
                className="flex min-h-11 items-center text-[0.9375rem] font-medium tracking-tight text-slate hover:text-ink"
              >
                {t("nav.signIn")}
              </Link>
            </li>
          </ul>

          <div className="mt-8 border-t border-line pt-5">
            <LanguageSwitcher variant="list" onChoose={() => setOpen(false)} />
          </div>
          <div className="mt-5 flex justify-end">
            <ThemeToggle />
          </div>

          {showStartCta && (
            <div className="mt-auto pt-8">
              <Link
                href="/learn/start"
                hrefLang={enLang("/learn/start")}
                className="sc-btn-primary flex min-h-12 items-center justify-center rounded-full px-5 text-base font-semibold tracking-tight"
              >
                {t("nav.startFreeBaseline")}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
