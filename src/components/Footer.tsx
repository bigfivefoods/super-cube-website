import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, nav, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white text-ink">
      <div className="container-site section-pad pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BrandWordmark height={28} />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-slate">
              {site.tagline} Empirically validated leadership development—from
              the individual outward.
            </p>
            <p className="mt-6 text-sm text-muted">
              Craig Ross Muller · University of KwaZulu-Natal · 2020
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate transition hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-slate transition hover:text-ink"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Constructs
              </h3>
              <ul className="mt-4 space-y-2.5">
                {constructs.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/constructs#${c.id}`}
                      className="text-sm text-slate transition hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Get started
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate">
                Build leadership capacity from the core outward.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-soft"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-black/[0.06] pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Super-Cube® Leadership Model.</p>
          <p className="max-w-md sm:text-right">
            Research-informed framework for human-centric leadership development.
          </p>
        </div>
      </div>
    </footer>
  );
}
