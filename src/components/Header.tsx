"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, mainNav, moreNav } from "@/lib/content";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/learn/start") {
    return pathname === "/learn" || pathname.startsWith("/learn/");
  }
  if (href === "/constructs") {
    return pathname === "/constructs" || pathname.startsWith("/constructs");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinkClass = (active: boolean) =>
    `rounded-full px-2.5 py-2 text-[0.8125rem] font-medium transition-colors xl:px-3 ${
      active
        ? overHero
          ? "bg-white text-ink"
          : "bg-ink text-white"
        : overHero
          ? "text-white/85 hover:bg-white/10 hover:text-white"
          : "text-slate hover:bg-black/[0.04] hover:text-ink"
    }`;

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
          className={`min-w-0 max-w-[min(100%,11rem)] shrink sm:max-w-none ${
            overHero ? "brightness-0 invert" : ""
          }`}
        />

        {/* Desktop */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Main"
        >
          {mainNav.map((item) => {
            const active = linkActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(active)}
              >
                {item.label}
              </Link>
            );
          })}

          {/* More menu */}
          <div className="relative">
            <button
              type="button"
              className={navLinkClass(moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close more menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-black/[0.08] bg-white py-2 shadow-lg"
                  role="menu"
                >
                  {moreNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-black/[0.04]"
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            href="/login"
            className={navLinkClass(pathname === "/login")}
          >
            Sign in
          </Link>
          <Link
            href="/learn/start"
            className={`ml-1 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition ${
              overHero
                ? "bg-white text-ink hover:bg-white/90"
                : "bg-ink text-white hover:bg-ink-soft"
            }`}
          >
            Start free
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
            <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Menu
            </p>
            {mainNav.map((item) => {
              const active = linkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-3.5 text-[1rem] font-semibold transition ${
                    active
                      ? "bg-ink text-white"
                      : "text-ink hover:bg-black/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Jump to each face — so Principles is one tap away */}
            <p className="mt-4 px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Six faces
            </p>
            <div className="grid grid-cols-2 gap-1 px-1">
              {constructs.map((c) => (
                <Link
                  key={c.id}
                  href={`/constructs#${c.id}`}
                  className="rounded-xl px-3 py-3 text-[0.875rem] font-semibold text-ink hover:bg-black/[0.04]"
                  style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <p className="mt-4 px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              More
            </p>
            {moreNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-[0.9375rem] font-medium text-ink hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/login"
              className="rounded-xl px-3 py-3 text-[0.9375rem] font-medium text-ink hover:bg-black/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href="/learn/start"
              className="mt-2 rounded-full bg-ink px-4 py-3.5 text-center text-base font-semibold text-white active:bg-ink-soft"
            >
              Start free baseline
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
