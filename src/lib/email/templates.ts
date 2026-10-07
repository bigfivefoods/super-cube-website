/**
 * Every email the site sends, built on the shared layout (layout.ts).
 * Copy only states what the product actually does (see /pricing, /learn/demo).
 */
import { COURSE_PRICE_ZAR, getProgramme, type ProgrammeId } from "@/lib/programmes";
import {
  bullets,
  button,
  callout,
  codeBox,
  details,
  emailSiteUrl,
  faceChips,
  FACE_COLOURS,
  heading,
  isProgrammeId,
  link,
  paragraph,
  renderEmail,
  rich,
  small,
  steps,
  strong,
  type EmailTheme,
  type RenderedEmail,
} from "@/lib/email/layout";

type Common = { site?: string; assetBase?: string };

function firstName(name?: string | null): string {
  const n = String(name ?? "").trim().split(/\s+/)[0] ?? "";
  return n && n.length <= 40 ? n : "";
}

function programmeName(id?: string | null): string {
  return getProgramme(String(id ?? ""))?.name ?? "Super-Cube®";
}

function themeFor(id?: string | null): EmailTheme {
  return isProgrammeId(id) ? id : "brand";
}

/** "R99.00" for rand, "$6.00 USD" for dollars, else "EUR 10.00". Amount in minor units. */
export function formatAmount(minor: number, currency: string): string {
  const major = (Number(minor) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const c = String(currency || "").toUpperCase();
  if (c === "ZAR") return `R${major}`;
  if (c === "USD") return `$${major} USD`;
  return `${c} ${major}`.trim();
}

/** Payment time in South African time, e.g. "7 October 2026, 13:05 SAST". */
export function formatPaidAt(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const date = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date}, ${time} SAST`;
}

// ---------------------------------------------------------------------------
// Welcome (free demo or paid)
// ---------------------------------------------------------------------------

export function welcomeEmail(
  o: Common & { name?: string | null; programmeId: ProgrammeId | string; mode: "demo" | "purchase"; continueUrl?: string },
): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const pid = isProgrammeId(o.programmeId) ? o.programmeId : "adults";
  const pname = programmeName(pid);
  const continueUrl = o.continueUrl ?? `${site}/learn/onboarding?mode=${o.mode}&programme=${pid}`;
  const hi = firstName(o.name);
  const purchase = o.mode === "purchase";

  const blocks = [
    paragraph(`Hi ${hi || "there"},`),
    paragraph(
      "You're on the ",
      strong(pname),
      " pathway. Leadership capacity grows through deliberate practice, not binge content: short sessions, real reflection, and a measure of where you started.",
    ),
    button({ href: continueUrl, label: purchase ? "Continue your pathway" : "Start your free demo", theme: pid }),
    heading(purchase ? "Your pathway" : "What's in your free demo", { eyebrow: "How it works" }),
    purchase
      ? steps([
          { title: "Orient", detail: "A short pre-pre orientation to the six faces." },
          { title: "Baseline assessment", detail: "Measure where you start, before any learning." },
          { title: "Six faces · eight-step sessions", detail: "Every face, one session at a time: idea, real-world example, reflection and practice." },
          { title: "Re-measure and see your growth", detail: "Take the after-test, then download your growth report and certificate." },
        ])
      : steps([
          { title: "Orient", detail: "A short pre-pre orientation to the six faces." },
          { title: "Baseline assessment", detail: "Your six-face self-assessment, free." },
          { title: "Two sample sessions", detail: "Free sessions from the Choices face, with reflections and your streak." },
        ]),
    purchase
      ? callout({
          title: "Lifetime access",
          body: "You paid once. Your access never expires and there is no subscription.",
          color: FACE_COLOURS[4].color,
        })
      : callout({
          title: "Ready for the full pathway?",
          body: rich(
            `Unlock all six faces, the after-test, your growth report and certificate for R${COURSE_PRICE_ZAR} once: lifetime access, no subscription. `,
            link(`${site}/pricing`, "See pricing"),
          ),
          color: FACE_COLOURS[0].color,
        }),
    small("Your demo stays private to this browser until you sync it with your account."),
  ];
  if (purchase) blocks.pop();

  return renderEmail({
    subject: purchase ? "You're in — Super-Cube® Learn is unlocked" : "Welcome to Super-Cube® Learn (free demo)",
    preheader: purchase
      ? `${pname} is unlocked for life. Here's how to make the most of your pathway.`
      : `Your free ${pname} demo is ready: orientation, your baseline and two sample sessions.`,
    theme: pid,
    label: "Learn",
    eyebrow: pname,
    title: purchase ? "You're in. Your pathway is unlocked." : "Welcome. Your free demo is ready.",
    intro: purchase
      ? "Thank you for joining Super-Cube® Learn. Everything you need to grow all six faces is waiting for you."
      : "Start with a short orientation and your baseline, then try two sample sessions. No card required.",
    blocks,
    signoff: rich("Grow well,", { html: "<br />", text: "\n" }, "The Super-Cube® team"),
    site,
    assetBase: o.assetBase,
    footer: {
      reason: purchase
        ? "You're receiving this because you bought Super-Cube® Learn with this address."
        : "You're receiving this because you started a free Super-Cube® demo while signed in with this address.",
      preferencesUrl: `${site}/learn/account`,
      preferencesLabel: "Your account",
    },
  });
}

// ---------------------------------------------------------------------------
// Payment receipt (single programme)
// ---------------------------------------------------------------------------

export function receiptEmail(
  o: Common & {
    programmeId: ProgrammeId | string;
    amountMinor: number;
    currency: string;
    reference: string;
    paidAt?: string | null;
    email?: string;
    name?: string | null;
  },
): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const pname = programmeName(o.programmeId);
  const theme = themeFor(o.programmeId);
  const amount = formatAmount(o.amountMinor, o.currency);
  const hi = firstName(o.name);
  const rows: { label: string; value: string; emphasis?: boolean }[] = [
    { label: "Programme", value: pname },
    { label: "Access", value: "Lifetime access · never expires" },
    { label: "Date", value: formatPaidAt(o.paidAt) },
    { label: "Paid with", value: "Paystack" },
    { label: "Reference", value: o.reference },
  ];
  if (o.email) rows.push({ label: "Account email", value: o.email });
  rows.push({ label: "Amount paid", value: amount, emphasis: true });

  return renderEmail({
    subject: `Payment confirmed · ${pname}`,
    preheader: `Receipt ${o.reference}: ${amount} for ${pname}. Lifetime access, paid once.`,
    theme,
    label: "Receipt",
    eyebrow: "Payment confirmed",
    title: `${pname} is unlocked.`,
    intro: `Thank you${hi ? `, ${hi}` : ""}. Your one-off payment of ${amount} gives you lifetime access: no subscription, and it never expires.`,
    blocks: [
      details(rows, { title: "Payment receipt" }),
      button({ href: `${site}/learn`, label: "Open Super-Cube® Learn", theme }),
      heading("What's included", { eyebrow: "Lifetime access" }),
      bullets([
        "The full programme: eight-step sessions for all six faces",
        "Your baseline and after-test, and your personal growth report",
        "Your Super-Cube® certificate when you complete the pathway",
      ]),
      small(
        "Keep this email as your receipt. If anything looks wrong, reply with your reference and we'll help.",
      ),
    ],
    site,
    assetBase: o.assetBase,
    footer: {
      reason: "You're receiving this receipt because a payment was made for Super-Cube® Learn with this address.",
      preferencesUrl: `${site}/learn/account`,
      preferencesLabel: "Your account",
    },
  });
}

// ---------------------------------------------------------------------------
// Seat pack (organisations): cohort code or claim instructions
// ---------------------------------------------------------------------------

export function seatPackEmail(
  o: Common & {
    programmeId?: ProgrammeId | string | null;
    code?: string | null;
    seats: number;
    amountMinor: number;
    currency: string;
    reference: string;
    paidAt?: string | null;
  },
): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const theme = themeFor(o.programmeId);
  const pname = o.programmeId ? programmeName(o.programmeId) : "Super-Cube®";
  const amount = formatAmount(o.amountMinor, o.currency);
  const code = o.code?.trim() || "";
  const receipt = details(
    [
      { label: "Programme", value: pname },
      { label: "Seats", value: String(o.seats) },
      { label: "Seat access", value: "Lifetime, per learner" },
      { label: "Date", value: formatPaidAt(o.paidAt) },
      { label: "Reference", value: o.reference },
      { label: "Amount paid", value: amount, emphasis: true },
    ],
    { title: "Payment receipt" },
  );

  const blocks = code
    ? [
        paragraph("Share this code with your learners. They sign in and enter it in ", strong("Learn → Org"), " to take a seat."),
        codeBox(code, "Learner code"),
        steps([
          { title: "Share the learner code", detail: "Learners sign in and enter it under Learn → Org." },
          { title: "Invite your coaches", detail: "Create coach invites from Learn → Coach." },
          { title: "Follow progress", detail: "See your cohort in the coach tools." },
        ]),
        button({ href: `${site}/learn/coach`, label: "Open coach tools", theme }),
        receipt,
      ]
    : [
        callout({
          title: "One more step to create your cohort",
          body: `We couldn't create your cohort automatically because no Super-Cube® account matches this payment. Sign in, then write to hello@super-cube.me with reference ${o.reference} and we'll set it up.`,
          color: FACE_COLOURS[2].color,
        }),
        button({ href: `${site}/login`, label: "Sign in", theme }),
        receipt,
      ];

  return renderEmail({
    subject: code ? `Cohort ready · Super-Cube® code ${code}` : "Payment confirmed · Super-Cube® seat pack",
    preheader: code
      ? `Your learner code is ${code}. ${o.seats} seats, ready to share.`
      : `Seat pack paid (${amount}). One quick step to create your cohort.`,
    theme,
    label: "Receipt",
    eyebrow: "Seat pack confirmed",
    title: code ? "Your cohort is ready." : "Thank you. Your seats are paid.",
    intro: `${o.seats} seats for ${pname}. Thank you for bringing Super-Cube® to your people.`,
    blocks,
    site,
    assetBase: o.assetBase,
    footer: {
      reason: "You're receiving this receipt because a seat pack was bought for Super-Cube® Learn with this address.",
      preferencesUrl: `${site}/learn/account`,
      preferencesLabel: "Your account",
    },
  });
}

// ---------------------------------------------------------------------------
// Weekly progress
// ---------------------------------------------------------------------------

export function weeklyEmail(
  o: Common & {
    name?: string | null;
    weekLabel?: string;
    summary?: string;
    /** Focus faces: ids or names ("choices", "Emotional"…), or free text. */
    focus?: string;
    programmeId?: ProgrammeId | string | null;
    planUrl?: string;
  },
): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const theme = themeFor(o.programmeId);
  const weekLabel = (o.weekLabel || "This week").slice(0, 80);
  const hi = firstName(o.name);
  const focusText = (o.focus || "").slice(0, 160);
  const ids = focusText.split(/[,·&/]|\band\b/i).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const chips = faceChips(ids);
  const planUrl = o.planUrl ?? `${site}/learn`;

  return renderEmail({
    subject: `Super-Cube® · ${weekLabel}`,
    preheader: `${weekLabel}: your Super-Cube® weekly plan is ready${focusText ? `, with a focus on ${focusText}` : ""}.`,
    theme,
    label: "Weekly",
    eyebrow: weekLabel,
    title: hi ? `${hi}, your week in leadership.` : "Your week in leadership.",
    intro: (o.summary || "Your Super-Cube® weekly plan is ready.").slice(0, 400),
    blocks: [
      heading("Focus faces this week", { eyebrow: "Your stretch" }),
      chips.html ? chips : paragraph(strong(focusText || "Your stretch faces")),
      paragraph("Pick one of these faces and put it into practice today: small, deliberate steps are how leadership capacity grows."),
      button({ href: planUrl, label: "Open your weekly plan", theme }),
      callout({
        title: "Private by design",
        body: "Your journals stay private. This email never includes your reflection text.",
        color: FACE_COLOURS[5].color,
      }),
      paragraph("Short on time? Try a ", link(`${site}/learn/practice`, "micro-practice"), "."),
    ],
    site,
    assetBase: o.assetBase,
    footer: {
      reason: "You're receiving this because you asked Super-Cube® Learn for your weekly summary.",
      preferencesUrl: `${site}/learn/account`,
      preferencesLabel: "Your account",
    },
  });
}
