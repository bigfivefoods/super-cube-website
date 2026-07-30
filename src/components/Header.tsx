"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandLogo";
import { nav } from "@/lib/content";

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-black/[0.06] bg-white/95 backdrop-blur-xl"
      }`}
    >
      <div className="container-site flex h-14 items-center justify-between md:h-16">
        <BrandWordmark
          height={28}
          className={overHero ? "brightness-0 invert" : ""}
        />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            className={`ml-1 rounded-full px-3 py-2 text-[0.8125rem] font-medium transition ${
              overHero
                ? "text-white/85 hover:bg-white/10 hover:text-white"
                : "text-slate hover:bg-black/[0.04] hover:text-ink"
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
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
          className={`flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${
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
          className="max-h-[calc(100svh-3.5rem)] overflow-y-auto border-t border-black/[0.06] bg-white lg:hidden"
        >
          <nav
            className="container-site flex flex-col gap-0.5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            aria-label="Mobile"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3.5 text-base font-medium text-ink hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-lg px-3 py-3.5 text-base font-medium text-ink hover:bg-black/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="mt-2 rounded-full bg-ink px-4 py-3.5 text-center text-base font-semibold text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
