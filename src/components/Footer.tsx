import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, primaryNav, secondaryNav, site } from "@/lib/content";
import { programmes } from "@/lib/programmes";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white text-ink">
      <div className="container-site section-pad pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* Story strip */}
        <div className="mb-8 grid gap-3 sm:mb-12 sm:grid-cols-3 sm:gap-4">
          {primaryNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-black/[0.07] bg-[#fafafa] p-4 transition hover:border-black/15 hover:bg-white hover:shadow-sm sm:rounded-2xl sm:p-5"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">
                {String(i + 1).padStart(2, "0")} · {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold tracking-tight text-ink group-hover:underline group-hover:underline-offset-4 sm:text-base">
                {item.blurb}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid gap-10 sm:gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <BrandWordmark height={26} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate sm:mt-5 sm:text-[0.9375rem]">
              {site.tagline} Why leadership matters · How education works · What
              programmes we offer.
            </p>
            <p className="mt-4 text-xs text-muted sm:mt-6 sm:text-sm">
              Craig Ross Muller · University of KwaZulu-Natal · 2020
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 md:col-span-8">
            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Why · How · What
              </h3>
              <ul className="mt-4 space-y-2.5">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-ink transition hover:underline hover:underline-offset-4"
                    >
                      {item.label}
                      <span className="mt-0.5 block text-xs font-normal text-muted">
                        {item.blurb}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Programmes
              </h3>
              <ul className="mt-4 space-y-2.5">
                {programmes.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/what#${p.id}`}
                      className="text-sm text-slate transition hover:text-ink"
                    >
                      {p.name.replace("Super-Cube® ", "")}
                      <span className="text-muted"> · {p.ageLabel}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-slate transition hover:text-ink"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5">
                {secondaryNav.map((item) => (
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

        <div className="mt-12 flex flex-wrap gap-2">
          {constructs.map((c) => (
            <Link
              key={c.id}
              href={`/constructs#${c.id}`}
              className="rounded-full px-2.5 py-1 text-[0.65rem] font-semibold text-white transition hover:opacity-90"
              style={{ background: c.color }}
            >
              {c.shortName}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.06] pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Super-Cube® Leadership Model.</p>
          <p className="max-w-md sm:text-right">
            Research-informed leadership education for a world that needs the
            SDGs delivered.
          </p>
        </div>
      </div>
    </footer>
  );
}
