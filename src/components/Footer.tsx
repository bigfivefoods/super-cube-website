"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useLocale } from "@/components/LocaleProvider";
import { constructs, site } from "@/lib/content";
import { faceI18n, mainNavI18n, moreLinkI18n, type I18nKey } from "@/lib/i18n";

/*
 * Footer: same design, layout and classes as the Big Five Group footer
 * (bigfivegroup.africa app/components/Footer.tsx), filled with Super-Cube® content.
 * Grey band → white rounded card → 12-col grid (brand column 4 / three link columns 8)
 * → legal bar. Every internal href below is a live route on super-cube.me.
 */

const sectionTitleClass = "text-sm font-semibold text-black dark:text-ink mb-4";

const groupLabelClass = "text-xs font-medium text-[#737373] dark:text-muted mb-2";

/** Links keep the site's 24px minimum target (.site-footer a), so list gaps are tightened to match BFG's rhythm. */
const linkClass =
  "block text-sm text-[#6b7280] hover:text-black dark:text-slate dark:hover:text-ink transition-colors leading-snug";

/** label: English fallback; key: optional dictionary key (otherwise the nav maps are used). */
type FooterLink = {
  href: string;
  label: string;
  key?: I18nKey;
  /** External site: plain <a>, opens in the same tab (same group of sites). */
  external?: boolean;
  /** Construct colour dot (six faces). */
  dot?: string;
};
type FooterGroup = { label: string; key?: I18nKey; links: FooterLink[] };

/** Understand: what the model is and the proof behind it. */
const understandLinks: FooterLink[] = [
  { href: "/the-model", label: "The model" },
  { href: "/constructs", label: "Six faces" },
  { href: "/how", label: "How it works" },
  { href: "/why", label: "Why leadership" },
  { href: "/leadership-challenges", label: "Leadership challenges" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

/** Work with us: one link per next step. */
const workLinks: FooterLink[] = [
  { href: "/organisations", label: "Organisations" },
  { href: "/schools", label: "Schools" },
  { href: "/speaking", label: "Speaking" },
  { href: "/pilot-pack", label: "Pilot pack" },
  { href: "/pricing#pilot", label: "Book a pilot" },
  { href: "/contact", label: "Contact" },
];

/** Programmes, grouped (the BFG "Pillars" column). */
const programmeGroups: FooterGroup[] = [
  {
    label: "Learn",
    key: "footer.groupLearn",
    links: [
      { href: "/what", label: "Programmes" },
      { href: "/pricing", label: "Pricing" },
      { href: "/learn/start", label: "Learn" },
      { href: "/sample-report", label: "Sample report" },
    ],
  },
  {
    label: "Practice",
    key: "footer.practice",
    links: [
      { href: "/practices", label: "Practices" },
      { href: "/team", label: "Team cube" },
      { href: "/facilitator", label: "Facilitator kit" },
      { href: "/certify", label: "Certification" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    label: "Six faces",
    key: "footer.sixFaces",
    links: constructs.map((c) => ({
      href: `/constructs#${c.id}`,
      label: c.shortName,
      key: faceI18n[c.id],
      dot: c.color,
    })),
  },
];

/** Resources, grouped (the BFG "Resources" column). */
const resourceGroups: FooterGroup[] = [
  {
    label: "Research & media",
    key: "footer.groupRead",
    links: [
      { href: "/research", label: "Research" },
      { href: "/impact", label: "Impact" },
      { href: "/insights", label: "Insights" },
      { href: "/media", label: "Media kit" },
    ],
  },
  {
    label: "Sign in",
    key: "nav.signIn",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Create account", key: "footer.createAccount" },
    ],
  },
  {
    // Brand names: never translated.
    label: "Big Five Group",
    links: [
      { href: "https://bigfivegroup.africa", label: "Big Five Group™", external: true },
      { href: "https://bigfivegroup.africa/leadership", label: "Big Five Learn", external: true },
      { href: "https://www.supplieradvisor.com", label: "SupplierAdvisor®", external: true },
    ],
  },
];

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
] as const satisfies readonly { href: string; key: I18nKey }[];

const socialLinks = [
  {
    href: "https://za.linkedin.com/in/craigmuller",
    label: "Dr Craig Muller on LinkedIn",
    icon: LinkedInIcon,
  },
  {
    href: site.researchGateUrl,
    label: "Dr Craig Muller on ResearchGate",
    icon: ResearchGateIcon,
  },
] as const;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function ResearchGateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6">
      <rect x="1" y="1" width="22" height="22" rx="3" fill="currentColor" />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        className="fill-white dark:fill-black"
      >
        RG
      </text>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

const noopSubscribe = () => () => {};

/**
 * Copyright year that stays current without a rebuild: the server/prerendered year is
 * replaced by the visitor's year right after hydration.
 */
function CurrentYear() {
  const year = useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span suppressHydrationWarning>{year ?? new Date().getFullYear()}</span>;
}

function FooterNav({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className={sectionTitleClass}>{title}</div>
      {children}
    </div>
  );
}

type TFn = (key: I18nKey) => string;
type LabelFn = (l: FooterLink) => string;

function linkLabel(l: FooterLink, t: TFn) {
  if (l.key) return t(l.key);
  const fromMap = mainNavI18n[l.href] || moreLinkI18n[l.href];
  return fromMap ? t(fromMap) : l.label;
}

function SimpleNav({ links, label }: { links: FooterLink[]; label: LabelFn }) {
  return (
    <div className="flex flex-col gap-1.5">
      {links.map((l) => (
        <Link prefetch={false} key={l.href} href={l.href} className={linkClass}>
          {label(l)}
        </Link>
      ))}
    </div>
  );
}

function GroupedNav({
  groups,
  ariaLabel,
  label,
  t,
}: {
  groups: FooterGroup[];
  ariaLabel: string;
  label: LabelFn;
  t: TFn;
}) {
  return (
    <nav className="space-y-4 sm:space-y-5" aria-label={ariaLabel}>
      {groups.map((group) => (
        <div key={group.label}>
          <div className={groupLabelClass}>{group.key ? t(group.key) : group.label}</div>
          <ul className="space-y-0.5 sm:space-y-1">
            {group.links.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} className={linkClass}>
                    <span className="whitespace-nowrap">{l.label}</span>
                  </a>
                ) : (
                  <Link href={l.href} prefetch={false} className={linkClass}>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {l.dot && (
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: l.dot }}
                        />
                      )}
                      {label(l)}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Footer() {
  const { t } = useLocale();

  const label: LabelFn = (l) => linkLabel(l, t);

  return (
    <footer className="site-footer bg-[#f3f4f6] text-black dark:bg-surface dark:text-ink">
      <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="rounded-[28px] border border-black/[0.06] bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-line dark:bg-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-4 min-w-0">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2.5 group"
                aria-label="Super-Cube® home"
              >
                <Image
                  src="/brand/logo.png"
                  alt=""
                  width={151}
                  height={32}
                  className="h-8 w-auto shrink-0 object-contain group-hover:opacity-70 transition-opacity dark:brightness-0 dark:invert"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#6b7280] dark:text-slate">
                {t("footer.tagline")}
              </p>
              <p className="mt-2 max-w-xs text-sm text-[#6b7280] dark:text-slate">
                {t("footer.credit")}
              </p>
              {/* 24px icons in 44×44 tap targets; -ms-2.5 keeps the first icon's ink aligned with the copy above */}
              <nav className="mt-4 -ms-2.5 flex items-center gap-1" aria-label={t("footer.social")}>
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-black dark:text-ink transition-opacity hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
                  >
                    <item.icon />
                  </a>
                ))}
              </nav>
              <div className="mt-8 space-y-2.5 text-sm text-[#6b7280] dark:text-slate">
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-black dark:hover:text-ink">
                  <MailIcon />
                  <span className="break-all">{site.email}</span>
                </a>
                <Link href="/contact" prefetch={false} className="flex items-center gap-2 hover:text-black dark:hover:text-ink">
                  <MessageIcon />
                  {t("footer.contactUs")}
                </Link>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold text-black dark:text-ink mb-3">{t("footer.newsletter")}</p>
                <p className="text-sm text-[#6b7280] dark:text-slate leading-relaxed mb-3">
                  {t("footer.newsletterBlurb")}
                </p>
                {/* The newsletter form is English-only, as on bigfivegroup.africa */}
                <div lang="en">
                  <NewsletterSignup source="footer" variant="footer" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10">
              {/* One "Explore" landmark for both lists (headings are visual) */}
              <nav className="min-w-0 space-y-8" aria-label={t("nav.group.explore")}>
                <FooterNav title={t("footer.understand")}>
                  <SimpleNav links={understandLinks} label={label} />
                </FooterNav>
                <FooterNav title={t("footer.workWithUs")}>
                  <SimpleNav links={workLinks} label={label} />
                </FooterNav>
              </nav>
              <FooterNav title={t("footer.programmes")}>
                <GroupedNav groups={programmeGroups} ariaLabel={t("footer.programmes")} label={label} t={t} />
              </FooterNav>
              <FooterNav title={t("footer.resources")}>
                <GroupedNav groups={resourceGroups} ariaLabel={t("footer.resources")} label={label} t={t} />
              </FooterNav>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-black/[0.06] dark:border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#6b7280] dark:text-slate">
            <div className="space-y-1">
              <p>
                © <CurrentYear /> {t("footer.copyright")}. {t("footer.rights")}
              </p>
              <p>
                <a
                  href="https://bigfivegroup.africa"
                  className="underline underline-offset-2 hover:text-black dark:hover:text-ink"
                >
                  {t("footer.partOf")}
                </a>
              </p>
              <p>{t("footer.journals")}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label={t("footer.legal")}>
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} prefetch={false} className="underline underline-offset-2 hover:text-black dark:hover:text-ink">
                  {t(l.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
