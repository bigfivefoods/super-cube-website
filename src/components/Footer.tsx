import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, site } from "@/lib/content";

const discover = [
  { href: "/the-model", label: "The model" },
  { href: "/constructs", label: "Six faces" },
  { href: "/why", label: "Why leadership" },
  { href: "/how", label: "How it works" },
  { href: "/research", label: "Research" },
] as const;

const learn = [
  { href: "/learn/start", label: "Start free baseline" },
  { href: "/what", label: "Programmes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sample-report", label: "Sample report" },
  { href: "/practices", label: "Practice library" },
] as const;

const organisations = [
  { href: "/facilitator", label: "Facilitator kit" },
  { href: "/impact", label: "Impact" },
  { href: "/team", label: "Team cube" },
  { href: "/certify", label: "Certification" },
  { href: "/community", label: "Community" },
] as const;

const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/insights", label: "Insights" },
  { href: "/media", label: "Media kit" },
  { href: "/login", label: "Sign in" },
] as const;

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((item) => (
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
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#fafafa] text-ink">
      <div className="container-site section-pad pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* Brand + CTA */}
        <div className="flex flex-col gap-6 border-b border-black/[0.06] pb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-12">
          <div className="max-w-md">
            <BrandWordmark height={26} />
            <p className="mt-4 text-sm leading-relaxed text-slate sm:text-[0.9375rem]">
              {site.tagline}
            </p>
            <p className="mt-3 text-xs text-muted">
              Craig Ross Muller · University of KwaZulu-Natal · 2020
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href="/learn/start"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink-soft"
            >
              Start free baseline
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              Contact us →
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <FooterCol title="Discover" links={discover} />
          <FooterCol title="Learn" links={learn} />
          <FooterCol title="Organisations" links={organisations} />
          <FooterCol title="Company" links={company} />
        </div>

        {/* Six faces — full-width strip, easy to scan */}
        <div className="mt-10 border-t border-black/[0.06] pt-8 sm:mt-12 sm:pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Six faces
              </h3>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                Jump to a construct · Principles includes character components
              </p>
            </div>
            <Link
              href="/constructs"
              className="shrink-0 text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {constructs.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/constructs#${c.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-black/20 hover:shadow-sm"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: c.color }}
                    aria-hidden
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.06] pt-8 text-sm text-muted sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Super-Cube® Leadership Model.</p>
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
            aria-label="Legal"
          >
            {legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <span className="hidden text-black/15 sm:inline" aria-hidden>
              ·
            </span>
            <span className="text-xs sm:text-sm">
              Journals private · coach share by consent only
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
