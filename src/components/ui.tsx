import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-2xl min-w-0 ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p
          className={`eyebrow ${align === "center" ? "justify-center" : ""} ${
            light ? "text-white/50" : ""
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`heading-lg mt-2.5 sm:mt-3 ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 text-base leading-relaxed tracking-tight sm:mt-4 sm:text-[1.0625rem] md:text-lg ${
            light ? "text-white/65" : "text-slate"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
}) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition sm:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  const variants = {
    primary: "bg-ink text-white hover:bg-ink-soft",
    secondary: "bg-ink text-white hover:bg-ink-soft",
    ghost:
      "border border-black/[0.12] bg-white text-ink hover:border-black/25 hover:bg-black/[0.02]",
    light:
      "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  visual,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  /** Optional right-column content (e.g. Super-Cube®) */
  visual?: ReactNode;
}) {
  return (
    <section className="page-hero page-hero--full border-b border-black/[0.06] bg-white">
      <div className="container-site page-hero__inner relative z-[1] w-full">
        {visual ? (
          <div className="grid items-start gap-8 sm:gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12 xl:gap-14">
            <div className="page-hero__copy order-2 min-w-0 md:order-1">
              <p className="eyebrow animate-fade-up">{eyebrow}</p>
              <h1 className="page-hero__title heading-xl mt-3 animate-fade-up delay-1 text-ink sm:mt-4">
                {title}
              </h1>
              <p className="page-hero__lede mt-4 animate-fade-up delay-2 text-[0.9375rem] leading-relaxed tracking-tight text-slate sm:mt-5 sm:text-base md:text-lg lg:text-xl">
                {description}
              </p>
              {children && (
                <div className="mt-6 flex w-full max-w-md animate-fade-up delay-3 flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
                  {children}
                </div>
              )}
            </div>
            <div className="animate-fade-up delay-2 relative z-[1] order-1 mx-auto w-full max-w-[15rem] min-w-0 sm:max-w-[18rem] md:order-2 md:mx-0 md:max-w-[19rem] lg:max-w-none lg:justify-self-end">
              {visual}
            </div>
          </div>
        ) : (
          <div className="page-hero__copy min-w-0">
            <p className="eyebrow animate-fade-up">{eyebrow}</p>
            <h1 className="page-hero__title heading-xl mt-3 animate-fade-up delay-1 text-ink sm:mt-4">
              {title}
            </h1>
            <p className="page-hero__lede mt-4 animate-fade-up delay-2 text-[0.9375rem] leading-relaxed tracking-tight text-slate sm:mt-5 sm:text-base md:text-lg lg:text-xl">
              {description}
            </p>
            {children && (
              <div className="mt-6 flex w-full max-w-md animate-fade-up delay-3 flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="section-pad pt-0">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-xl bg-ink px-5 py-9 text-white sm:rounded-2xl sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <div className="relative grid items-center gap-6 sm:gap-8 md:grid-cols-[1.5fr_auto] md:gap-10">
            <div className="min-w-0">
              <p className="eyebrow text-white/45">Next step</p>
              <h2 className="heading-md mt-3 text-white sm:mt-4 md:text-[2rem]">
                Measure growth in your first 10 minutes.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:mt-4 sm:text-[0.975rem]">
                Free baseline on this device—or book a school/company pilot with
                facilitator calendar, consented roster, and verify certificates.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3 md:w-auto md:flex-col">
              <Link
                href="/learn/start"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-white/90 sm:w-auto"
              >
                Start free baseline
              </Link>
              <Button href="/pricing#pilot" variant="light" className="w-full sm:w-auto">
                Book a pilot
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
