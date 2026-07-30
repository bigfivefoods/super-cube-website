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
            light ? "text-white/50" : ""
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`heading-lg mt-3 ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg leading-relaxed tracking-tight ${
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
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  const variants = {
    primary: "bg-ink text-white hover:bg-ink-soft",
    secondary: "bg-ink text-white hover:bg-ink-soft",
    ghost:
      "border border-black/[0.12] bg-white text-ink hover:border-black/25 hover:bg-black/[0.02]",
    light:
      "border border-white/25 bg-transparent text-white hover:bg-white/10",
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
    <section className="relative overflow-hidden border-b border-black/[0.06] bg-white pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-site relative">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="heading-xl mt-5 max-w-4xl animate-fade-up delay-1 text-ink">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl animate-fade-up delay-2 text-lg leading-relaxed tracking-tight text-slate md:text-xl">
          {description}
        </p>
        {children && (
          <div className="mt-10 animate-fade-up delay-3 flex flex-wrap gap-3">
            {children}
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
        <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-14 text-white md:px-16 md:py-20">
          <div className="relative grid items-center gap-10 md:grid-cols-[1.5fr_auto]">
            <div>
              <p className="eyebrow text-white/45">Next step</p>
              <h2 className="heading-md mt-4 text-white md:text-[2rem]">
                Build leadership capacity from the centre outward.
              </h2>
              <p className="mt-4 max-w-xl text-[0.975rem] leading-relaxed text-white/60">
                Whether you are designing a personal development plan or a
                multi-level organisational programme, Super-Cube® provides a
                human-centric, evidence-informed path.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-white/90"
              >
                Begin a conversation
              </Link>
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
