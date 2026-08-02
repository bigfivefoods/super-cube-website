import Link from "next/link";
import { BrandWordmark } from "@/components/BrandLogo";
import { constructs, site } from "@/lib/content";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/the-model", label: "The model" },
      { href: "/constructs", label: "Six faces" },
      { href: "/what", label: "Programmes" },
      { href: "/learn/start", label: "Learn" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Proof",
    links: [
      { href: "/sample-report", label: "Sample report" },
      { href: "/impact", label: "Impact" },
      { href: "/research", label: "Research" },
      { href: "/practices", label: "Practices" },
      { href: "/insights", label: "Insights" },
    ],
  },
  {
    title: "Organisations",
    links: [
      { href: "/facilitator", label: "Facilitator kit" },
      { href: "/team", label: "Team cube" },
      { href: "/certify", label: "Certification" },
      { href: "/community", label: "Community" },
      { href: "/pricing#pilot", label: "Book a pilot" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/why", label: "Why leadership" },
      { href: "/how", label: "How it works" },
      { href: "/contact", label: "Contact" },
      { href: "/media", label: "Media kit" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white text-ink">
      <div className="container-site section-pad pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Brand row */}
        <div className="flex flex-col gap-6 border-b border-black/[0.06] pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <BrandWordmark height={24} />
            <p className="mt-3 text-sm leading-relaxed text-slate">
              {site.tagline}
            </p>
            <p className="mt-2 text-xs text-muted">
              Craig Ross Muller · UKZN · 2020
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/learn/start"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
            >
              Start free
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 text-sm font-semibold text-ink hover:border-black/25"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Four neat columns */}
        <div className="mt-10 grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {col.title}
              </h3>
              <ul className="mt-3.5 space-y-2">
                {col.links.map((item) => (
                  <li key={item.href + item.label}>
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
          ))}
        </div>

        {/* Six faces — compact chips */}
        <div className="mt-10 border-t border-black/[0.06] pt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Six faces
            </h3>
            <Link
              href="/constructs"
              className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
            >
              All constructs →
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {constructs.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/constructs#${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#fafafa] px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition hover:border-black/15 hover:bg-white"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.color }}
                    aria-hidden
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="mt-10 flex flex-col gap-2 border-t border-black/[0.06] pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>© {new Date().getFullYear()} Super-Cube® Leadership Model</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
            <span className="text-muted/80">
              Journals private · consent for coach share
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
