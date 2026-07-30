"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/learn", label: "Dashboard", exact: true },
  { href: "/learn/programmes", label: "Programmes" },
  { href: "/learn/assessment", label: "Assessment" },
  { href: "/learn/courses", label: "Courses" },
  { href: "/learn/report", label: "Report" },
  { href: "/learn/account", label: "Account" },
];

export function LearnShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[100svh] bg-[#fafafa] pt-16">
      <div className="container-site grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-10 lg:py-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Learning
          </p>
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition lg:rounded-lg ${
                    active
                      ? "bg-ink text-white"
                      : "text-slate hover:bg-black/[0.04] hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/pricing"
            className="mt-4 hidden text-sm font-semibold text-ink underline-offset-4 hover:underline lg:inline-block"
          >
            Plans & pricing →
          </Link>
        </aside>

        <div className="min-w-0">
          {(title || subtitle) && (
            <header className="mb-6 sm:mb-8">
              {title && (
                <h1 className="heading-lg text-ink">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-2 max-w-2xl text-base text-slate sm:text-lg">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
