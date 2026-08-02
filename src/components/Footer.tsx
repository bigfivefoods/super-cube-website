import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, mainNav, moreNav, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white text-ink">
      <div className="container-site section-pad pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <BrandWordmark height={26} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate sm:mt-5 sm:text-[0.9375rem]">
              {site.tagline}
            </p>
            <p className="mt-4 text-xs text-muted sm:mt-6 sm:text-sm">
              Craig Ross Muller · University of KwaZulu-Natal · 2020
            </p>
            <Link
              href="/learn/start"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
            >
              Start free baseline
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 md:col-span-8">
            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Main menu
              </h3>
              <ul className="mt-4 space-y-2.5">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-ink transition hover:underline hover:underline-offset-4"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-ink transition hover:underline hover:underline-offset-4"
                  >
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Six faces
              </h3>
              <ul className="mt-4 space-y-2.5">
                {constructs.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/constructs#${c.id}`}
                      className="text-sm text-slate transition hover:text-ink"
                    >
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                        aria-hidden
                      />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                More
              </h3>
              <ul className="mt-4 space-y-2.5">
                {moreNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate transition hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.06] pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>© {new Date().getFullYear()} Super-Cube® Leadership Model.</p>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/privacy" className="hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-ink">
                Terms
              </Link>
              <Link href="/media" className="hover:text-ink">
                Media kit
              </Link>
            </p>
          </div>
          <p className="max-w-md sm:text-right">
            Journals private · scores shared only with consent.
          </p>
        </div>
      </div>
    </footer>
  );
}
