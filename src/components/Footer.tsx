import Link from "next/link";
import { constructs, nav, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-site section-pad pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-[0.65rem] font-semibold tracking-wider text-ink">
                SC
              </span>
              <span className="font-display text-2xl font-medium text-cream">
                Super-Cube<span className="text-gold">®</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-cream/70">
              {site.tagline} An empirically validated, Africa-centric leadership
              skills development framework—placing you at the centre of growth.
            </p>
            <p className="mt-6 text-sm text-cream/50">
              Developed by Craig Ross Muller · University of KwaZulu-Natal · 2020
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-cream/75 transition hover:text-cream"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-cream/75 transition hover:text-cream"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Constructs
              </h3>
              <ul className="mt-4 space-y-2.5">
                {constructs.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/constructs#${c.id}`}
                      className="text-sm text-cream/75 transition hover:text-cream"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Get started
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                Ready to build leadership capacity from the core outward?
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-bright"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Super-Cube® Leadership Model.</p>
          <p className="max-w-md sm:text-right">
            Content informed by the Super-Cube® Leadership Model research and
            public scholarship on the framework.
          </p>
        </div>
      </div>
    </footer>
  );
}
