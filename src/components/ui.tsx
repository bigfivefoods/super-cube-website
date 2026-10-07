import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { heroThemes, type HeroTheme } from "@/lib/hero-media";

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
      className={`reveal max-w-2xl min-w-0 ${align === "center" ? "mx-auto text-center" : ""}`}
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
    "sc-btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink touch-manipulation";
  const variants = {
    primary: "sc-btn-primary",
    secondary: "sc-btn-primary",
    ghost:
      "border border-line-strong bg-transparent text-ink hover:border-black/30 hover:bg-black/[0.03] dark:hover:border-white/30 dark:hover:bg-white/[0.05]",
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
  theme = "leadership",
  image,
  imageAlt,
  full,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  visual?: ReactNode;
  theme?: HeroTheme;
  image?: string;
  imageAlt?: string;
  full?: boolean;
}) {
  const preset = theme !== "none" && !image ? heroThemes[theme] : null;
  const mediaSrc = image ?? preset?.src;
  const mediaAlt = imageAlt ?? preset?.alt ?? "";
  const objectPos = preset?.position ?? "object-center";
  const isMedia = Boolean(mediaSrc);
  // Every photo hero renders exactly like the landing-page hero (HomeLanding): full
  // viewport height (100svh/100dvh), object-cover, the same overlays and copy placement.
  // Text-only heroes (theme "none") keep the shorter band.
  const useFull = full ?? isMedia;
  const lightTone = isMedia && preset?.tone === "light";
  const darkTone = isMedia && !lightTone;

  const actionsClass = lightTone
    ? "mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3"
    : darkTone
      ? "mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3 [&>a:first-of-type]:!bg-white [&>a:first-of-type]:!text-ink [&>a:first-of-type]:hover:!bg-white/90 [&>a:not(:first-of-type)]:!border-white/35 [&>a:not(:first-of-type)]:!bg-white/10 [&>a:not(:first-of-type)]:!text-white [&>a:not(:first-of-type)]:hover:!bg-white/15"
      : "mt-5 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3";

  const eyebrowCls = lightTone
    ? "text-slate"
    : darkTone
      ? "text-white/75"
      : "";
  const titleCls = lightTone
    ? "text-ink"
    : darkTone
      ? "text-white"
      : "text-ink";
  const ledeCls = lightTone
    ? "text-slate"
    : darkTone
      ? "text-white/80"
      : "text-slate";

  return (
    <section
      className={`page-hero relative isolate flex w-full flex-col overflow-hidden ${
        isMedia ? "" : "border-b border-line"
      } ${
        useFull ? "page-hero--full" : "page-hero--band"
      } ${
        isMedia
          ? lightTone
            ? "page-hero--media page-hero--media-light bg-[#e8e8e8] dark:bg-surface"
            : "page-hero--media bg-void"
          : "bg-paper"
      }`}
    >
      {isMedia && mediaSrc && (
        <>
          <Image
            src={mediaSrc}
            alt={mediaAlt}
            fill
            priority
            className={`object-cover ${objectPos}`}
            sizes="100vw"
          />
          {lightTone ? (
            <>
              <div
                className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 to-transparent sm:from-white/55 sm:via-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent"
                aria-hidden
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/65 to-black/35 sm:via-black/55 sm:to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"
                aria-hidden
              />
            </>
          )}
        </>
      )}

      <div className="container-site page-hero__inner relative z-[1] w-full pb-2">
        {visual ? (
          <div className="grid w-full items-center gap-6 sm:gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12 xl:gap-16">
            <div className="page-hero__copy order-2 min-w-0 md:order-1">
              <p className={`eyebrow ${eyebrowCls}`}>
                {eyebrow}
              </p>
              <h1
                className={`page-hero__title heading-xl mt-3 sm:mt-4 ${titleCls}`}
              >
                {title}
              </h1>
              <p
                className={`page-hero__lede mt-4 max-w-xl text-[0.9375rem] leading-relaxed tracking-tight sm:mt-5 sm:text-base md:max-w-2xl md:text-lg lg:text-xl ${ledeCls}`}
              >
                {description}
              </p>
              {children && <div className={actionsClass}>{children}</div>}
            </div>
            <div className=" relative z-[1] order-1 mx-auto w-full max-w-[min(100%,15rem)] min-w-0 sm:max-w-[17rem] md:order-2 md:mx-0 md:max-w-[18rem] lg:max-w-[20rem] lg:justify-self-end">
              {visual}
            </div>
          </div>
        ) : (
          <div className="page-hero__copy min-w-0 max-w-2xl md:max-w-[38rem] lg:max-w-[42rem]">
            <p className={`eyebrow ${eyebrowCls}`}>{eyebrow}</p>
            <h1
              className={`page-hero__title heading-xl mt-3 sm:mt-4 ${titleCls}`}
            >
              {title}
            </h1>
            <p
              className={`page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight sm:mt-5 sm:text-base md:text-lg lg:text-xl ${ledeCls}`}
            >
              {description}
            </p>
            {children && <div className={actionsClass}>{children}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="section-pad pt-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-xl bg-void px-5 py-9 text-void-fg sm:rounded-2xl sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 dark:bg-elevated dark:ring-1 dark:ring-white/10">
          <div className="relative grid items-center gap-6 sm:gap-8 md:grid-cols-[1.5fr_auto] md:gap-10">
            <div className="min-w-0">
              <p className="eyebrow eyebrow--on-dark">Next step</p>
              <h2 className="heading-md mt-3 text-void-fg sm:mt-4 md:text-[2rem]">
                Measure growth in your first 10 minutes.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-void-fg/60 sm:mt-4 sm:text-[0.975rem]">
                Free baseline on this device—or book a school/company pilot with
                facilitator calendar, consented roster, and verify certificates.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3 md:w-auto md:flex-col">
              <Link
                href="/learn/start"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 touch-manipulation sm:w-auto dark:bg-white dark:text-black"
              >
                Start free baseline
              </Link>
              <Button
                href="/pricing#pilot"
                variant="light"
                className="w-full sm:w-auto"
              >
                Book a pilot
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
