"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${site.name} home`}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[0.65rem] font-semibold tracking-wider text-cream shadow-sm"
            aria-hidden
          >
            SC
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-ink">
            Super-Cube<span className="text-gold">®</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-cream"
                    : "text-slate hover:bg-[var(--cream-dark)] hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gold-bright"
          >
            Begin development
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-paper md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 block h-0.5 w-full bg-ink transition ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-full bg-ink transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-full bg-ink transition ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[var(--line)] bg-cream md:hidden"
        >
          <nav
            className="container-site flex flex-col gap-1 py-4"
            aria-label="Mobile"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-[var(--cream-dark)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 rounded-full bg-gold px-4 py-3 text-center text-base font-semibold text-ink"
            >
              Begin development
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
