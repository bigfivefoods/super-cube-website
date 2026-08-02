"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, mainNav, moreNavGroups } from "@/lib/content";
import { darkHeroPaths, lightHeroPaths } from "@/lib/hero-media";

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
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLightHero = matchesPath(pathname, lightHeroPaths);
  const isDarkHero = matchesPath(pathname, darkHeroPaths);
  /** Over media hero (not scrolled, menu closed) */
  const overHero = (isDarkHero || isLightHero) && !scrolled && !open;
  /** Dark photo / model hero — transparent, white type / inverted logo */
  const overDark = overHero && isDarkHero;
  /** Light grey geometric hero — ink type, grey blend */
  const overLight = overHero && isLightHero;

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

  const navLinkClass = (active: boolean) => {
    if (overDark) {
      return `rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
        active
          ? "bg-white text-ink"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`;
    }
    if (overLight) {
      return `rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
        active
          ? "bg-ink text-white"
          : "text-ink/80 hover:bg-black/[0.06] hover:text-ink"
      }`;
    }
    return `rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
      active
        ? "bg-ink text-white"
        : "text-slate hover:bg-black/[0.04] hover:text-ink"
    }`;
  };

  const headerSurface = overDark
    ? "border-b border-transparent bg-transparent"
    : overLight
      ? "border-b border-transparent bg-[#e8e8e8]/90 backdrop-blur-md"
      : "border-b border-black/[0.06] bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${headerSurface}`}
    >
      <div className="container-site flex h-14 items-center justify-between gap-3 md:h-16">
        <BrandWordmark
          height={26}
          className={`min-w-0 max-w-[min(100%,11rem)] shrink sm:max-w-none ${
            overDark ? "brightness-0 invert" : ""
          }`}
        />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Main"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(linkActive(pathname, item.href))}
            >
              {item.label}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              className={navLinkClass(moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
              <span className="ml-1 text-[0.65rem] opacity-60" aria-hidden>
                ▾
              </span>
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  aria-label="Close menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-black/[0.08] bg-white p-4 shadow-xl"
                  role="menu"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {moreNavGroups.map((group) => (
                      <div key={group.title}>
                        <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          {group.title}
                        </p>
                        <ul className="mt-1.5 space-y-0.5">
                          {group.links.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                role="menuitem"
                                className="block rounded-lg px-2 py-1.5 text-sm font-medium text-ink hover:bg-black/[0.04]"
                                onClick={() => setMoreOpen(false)}
                              >
                                {item.label}
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
            Contact
          </Link>
          <Link
            href="/learn/start"
            className={`ml-1.5 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition ${
              overDark
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
            overDark
              ? "border-white/25 bg-white/10 text-white"
              : "border-black/[0.1] bg-white/80 text-ink"
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
            aria-label="Mobile"
          >
            <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Main
            </p>
            <div className="flex flex-col gap-0.5">
              {mainNav.map((item) => {
                const active = linkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-3 text-[1rem] font-semibold ${
                      active
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-black/[0.04]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <p className="mt-5 px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Six faces
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {constructs.map((c) => (
                <Link
                  key={c.id}
                  href={`/constructs#${c.id}`}
                  className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-2.5 text-[0.875rem] font-semibold text-ink"
                  style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {moreNavGroups.map((group) => (
              <div key={group.title} className="mt-5">
                <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {group.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium text-ink hover:bg-black/[0.04]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link
              href="/learn/start"
              className="mt-5 rounded-full bg-ink px-4 py-3.5 text-center text-base font-semibold text-white"
            >
              Start free baseline
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
