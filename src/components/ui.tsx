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
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p
          className={`eyebrow ${align === "center" ? "justify-center" : ""} ${
            light ? "text-gold-bright" : ""
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`heading-lg mt-3 ${light ? "text-cream" : "text-ink"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            light ? "text-cream/70" : "text-slate"
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
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
  const variants = {
    primary: "bg-ink text-cream hover:bg-ink-soft shadow-sm",
    secondary:
      "bg-gold text-ink hover:bg-gold-bright shadow-sm",
    ghost:
      "border border-[var(--line-strong)] bg-paper/60 text-ink hover:bg-paper",
    light:
      "border border-white/20 bg-white/10 text-cream backdrop-blur hover:bg-white/15",
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-paper pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="pointer-events-none absolute inset-0 grain" />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-site relative">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="heading-xl mt-4 max-w-3xl animate-fade-up delay-1 text-ink">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl animate-fade-up delay-2 text-lg leading-relaxed text-slate md:text-xl">
          {description}
        </p>
        {children && (
          <div className="mt-8 animate-fade-up delay-3 flex flex-wrap gap-3">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink px-8 py-12 text-cream shadow-[var(--shadow)] md:px-14 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_auto]">
            <div>
              <p className="eyebrow text-gold-bright">Next step</p>
              <h2 className="heading-md mt-3 text-cream">
                Build leadership capacity from the centre outward.
              </h2>
              <p className="mt-4 max-w-xl text-cream/70 leading-relaxed">
                Whether you are designing a personal development plan or a
                multi-level organisational programme, Super-Cube® provides a
                human-centric, evidence-informed path.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button href="/contact" variant="secondary">
                Begin a conversation
              </Button>
              <Button href="/programs" variant="light">
                Explore programs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
