"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { primaryNav, secondaryNav } from "@/lib/content";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isPrimaryActive(href: string) {
    if (href === "/why") {
      return (
        pathname === "/why" ||
        pathname.startsWith("/why-leadership") ||
        pathname.startsWith("/why/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-black/[0.06] bg-white/95 backdrop-blur-xl"
      }`}
    >
      <div className="container-site flex h-14 items-center justify-between gap-2 sm:gap-3 md:h-16">
        <BrandWordmark
          height={26}
          onDark={overHero}
          className="min-w-0 max-w-[min(100%,12.5rem)] shrink sm:max-w-none"
        />

        {/* Desktop / large tablet landscape */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {primaryNav.map((item) => {
            const active = isPrimaryActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.blurb}
                className={`rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors xl:px-3.5 ${
                  active
                    ? overHero
                      ? "bg-white text-ink"
                      : "bg-ink text-white"
                    : overHero
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-slate hover:bg-black/[0.04] hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {secondaryNav
            .filter((i) =>
              ["The Model", "Learn", "About"].includes(i.label)
            )
            .map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors xl:px-3.5 ${
                    active
                      ? overHero
                        ? "bg-white text-ink"
                        : "bg-ink text-white"
                      : overHero
                        ? "text-white/85 hover:bg-white/10 hover:text-white"
                        : "text-slate hover:bg-black/[0.04] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

          <Link
            href="/login"
            className={`rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors xl:px-3.5 ${
              overHero
                ? "text-white/85 hover:bg-white/10 hover:text-white"
                : "text-slate hover:bg-black/[0.04] hover:text-ink"
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/what"
            className={`ml-1 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition ${
              overHero
                ? "bg-white text-ink hover:bg-white/90"
                : "bg-ink text-white hover:bg-ink-soft"
            }`}
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border touch-manipulation lg:hidden ${
            overHero
              ? "border-white/25 bg-white/10 text-white"
              : "border-black/[0.08] bg-white text-ink"
          }`}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 block h-px w-full transition ${
                overHero ? "bg-white" : "bg-ink"
              } ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px w-full transition ${
                overHero ? "bg-white" : "bg-ink"
              } ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 block h-px w-full transition ${
                overHero ? "bg-white" : "bg-ink"
              } ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
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
            className="container-site flex flex-col gap-0.5 py-3 sm:py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            aria-label="Mobile"
          >
            <p className="px-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Super-Cube®
            </p>
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-3 transition active:scale-[0.99] sm:py-3.5 ${
                  isPrimaryActive(item.href)
                    ? "bg-ink text-white"
                    : "text-ink hover:bg-black/[0.04]"
                }`}
              >
                <span className="block text-[0.975rem] font-semibold sm:text-base">
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 block text-[0.7rem] leading-snug sm:text-xs ${
                    isPrimaryActive(item.href) ? "text-white/70" : "text-muted"
                  }`}
                >
                  {item.blurb}
                </span>
              </Link>
            ))}

            <p className="mt-3 px-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted sm:mt-4">
              More
            </p>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-[0.975rem] font-medium text-ink hover:bg-black/[0.04] sm:text-base"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-lg px-3 py-3 text-[0.975rem] font-medium text-ink hover:bg-black/[0.04] sm:text-base"
              >
                Sign in
              </Link>
            </div>
            <Link
              href="/what"
              className="mt-2 rounded-full bg-ink px-4 py-3.5 text-center text-base font-semibold text-white active:bg-ink-soft"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
