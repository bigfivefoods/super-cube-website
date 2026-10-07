"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { PaystackCheckout } from "@/components/PaystackCheckout";
import { SeatPackCheckout } from "@/components/SeatPackCheckout";
import { PageHero, Button } from "@/components/ui";
import { PROGRAMME_THEME, programmeBandStyle } from "@/lib/programme-theme";
import { track } from "@/lib/analytics";
import { loadLmsState, unlockDemo, hasPaidAccess } from "@/lib/lms/store";
import {
  COURSE_PRICE_USD,
  COURSE_PRICE_ZAR,
  programmes,
  type ProgrammeId,
} from "@/lib/programmes";

export default function PricingPage() {
  const router = useRouter();
  // Checkout opens in a dialog for whichever card was chosen; nothing is
  // pre-selected (no link or query pre-selects a programme).
  const [checkoutFor, setCheckoutFor] = useState<ProgrammeId | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  function openCheckout(id: ProgrammeId, opener: HTMLElement) {
    openerRef.current = opener;
    setCheckoutFor(id);
    track("programme_selected", { programmeId: id, mode: "checkout_open" });
  }

  function closedCheckout() {
    setCheckoutFor(null);
    openerRef.current?.focus();
  }
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  useEffect(() => {
    setAlreadyPaid(hasPaidAccess(loadLmsState()));
    track("page_view", { path: "/pricing" });
  }, []);

  function startDemo(programmeId: ProgrammeId) {
    const next = unlockDemo(programmeId);
    track("checkout_demo", { programmeId });
    track("programme_selected", { programmeId, mode: "demo" });
    const email = next.user?.email;
    if (
      email &&
      !email.includes("@demo.local") &&
      email !== "demo@super-cube.me"
    ) {
      void fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: next.user?.fullName,
          programmeId,
          mode: "demo",
        }),
      });
    }
    router.push(`/learn/onboarding?mode=demo&programme=${programmeId}`);
  }

  return (
    <>
      <PageHero
        theme="leadership"
        eyebrow="Pricing"
        title="Start free. Unlock the full pathway once."
        description={`Kids (5–12), Adolescents (13–21), and Adults (22+). Free baseline on this device—then pay once with Paystack (R${COURSE_PRICE_ZAR} / $${COURSE_PRICE_USD} USD) for lifetime access. No subscription.`}
      />

      <section className="relative z-0 border-t border-line bg-surface">
        <div className="section-pad">
          <div className="container-site">
            {alreadyPaid && (
              <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
                <p className="text-sm font-semibold text-emerald-900">
                  You already have paid access on this device.
                </p>
                <Link
                  href="/learn"
                  className="mt-2 inline-flex text-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Open Learn →
                </Link>
              </div>
            )}

            <div className="mx-auto mb-8 max-w-2xl sc-card px-5 py-5 sm:mb-10 sm:px-8 sm:py-6">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Simple terms
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate sm:text-[0.9375rem]">
                <li>
                  <strong className="text-ink">Free baseline</strong> — orient +
                  six-face measure without paying.
                </li>
                <li>
                  <strong className="text-ink">
                    R{COURSE_PRICE_ZAR} once (≈ ${COURSE_PRICE_USD} USD)
                  </strong>{" "}
                  — lifetime access to the full programme, report and certificate via{" "}
                  <strong className="text-ink">Paystack</strong>.
                </li>
                <li>
                  <strong className="text-ink">No monthly fee</strong> — one
                  payment per programme on this path.
                </li>
              </ul>
            </div>

            <div className="mx-auto mb-8 max-w-xl sc-card px-6 py-6 text-center shadow-sm sm:mb-10 sm:px-10 sm:py-8">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Launch price · one-time · Paystack
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                R{COURSE_PRICE_ZAR}
                <span className="text-lg font-medium text-muted"> ZAR</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                or ${COURSE_PRICE_USD} USD
              </p>
            </div>

            {/* Cards share row tracks on desktop (CSS subgrid), so the
                description, price, features and buttons line up across all
                three whatever the copy length. */}
            <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-y-0">
              {programmes.map((p) => (
                <article
                  key={p.id}
                  id={p.id}
                  className="flex flex-col overflow-hidden sc-card shadow-sm lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
                  data-testid={`programme-card-${p.id}`}
                >
                  {/* Programme colour band (src/lib/programme-theme.ts) */}
                  <div
                    className="relative flex min-h-[7.5rem] items-start justify-between gap-3 px-6 pb-5 pt-6 sm:min-h-[8.5rem] sm:px-8"
                    style={programmeBandStyle(p.id)}
                    data-testid={`programme-band-${p.id}`}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: PROGRAMME_THEME[p.id].accent }}
                      >
                        {p.ageLabel}
                      </p>
                      <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                        {p.name}
                      </h2>
                    </div>
                    <ProgrammeIcon id={p.id} />
                    {p.id === "adults" && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, #E9CF97, transparent)" }}
                      />
                    )}
                  </div>

                  <div className="px-6 pt-6 sm:px-8">
                    <p className="text-sm font-medium text-ink">{p.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate">
                      {p.description}
                    </p>
                  </div>

                  <div className="mx-6 mt-6 border-t border-line pt-6 sm:mx-8" data-testid="programme-price">
                    <p className="text-3xl font-semibold tracking-tight text-ink">
                      R{p.priceZar}
                      <span className="text-sm font-medium text-muted"> · lifetime access</span>
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2 px-6 text-sm text-slate sm:px-8">
                    <li className="font-medium text-ink">· Lifetime access</li>
                    <li>· Pre-assessment baseline</li>
                    <li>· 6 construct courses (age-adapted)</li>
                    <li>· Practice labs & checks</li>
                    <li>· Post-assessment & personal report</li>
                  </ul>

                  <div className="mt-6 flex flex-col gap-2 px-6 pb-6 sm:px-8 sm:pb-8">
                    <button
                      type="button"
                      onClick={(e) => openCheckout(p.id, e.currentTarget)}
                      aria-haspopup="dialog"
                      className="min-h-11 rounded-full sc-btn-primary px-4 py-2.5 text-sm font-semibold hover:opacity-90"
                    >
                      Buy with Paystack · R{COURSE_PRICE_ZAR}
                    </button>
                    <button
                      type="button"
                      onClick={() => startDemo(p.id)}
                      className="min-h-11 text-center text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                    >
                      Start free on this device (no payment)
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <CheckoutDialog
              dialogRef={dialogRef}
              programmeId={checkoutFor}
              onClosed={closedCheckout}
              onDemo={startDemo}
            />

            <div
              id="pilot"
              className="mx-auto mt-10 max-w-3xl scroll-mt-24 sc-card p-6 sm:mt-12 sm:p-8"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Schools · companies · cohorts · Phase 2
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Seat packs — pay once, get a cohort code
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                Buy 10, 20, or 50 learner seats. Each seat is lifetime access to
                the programme for that learner. We create a cohort code after
                payment. Learners join under Learn → Org. Coaches see scores and
                completion only when learners consent—never journal text.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <SeatPackCheckout />
              </div>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
                Tip: <strong className="text-ink">sign up / sign in</strong>{" "}
                with the same email before paying so admin rights attach to your
                account. Then open Learn → Coach tools.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button href="/learn/coach" variant="ghost">
                  Coach tools
                </Button>
                <Button href="/facilitator" variant="ghost">
                  Facilitator kit
                </Button>
                <Button href="/signup" variant="ghost">
                  Create coach account
                </Button>
                <a
                  href={
                    process.env.NEXT_PUBLIC_PILOT_CALENDAR_URL?.trim() ||
                    "mailto:hello@super-cube.me?subject=Book%20a%20Super-Cube%20pilot"
                  }
                  onClick={() => track("pilot_click", { source: "pricing" })}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Prefer a guided pilot call →
                </a>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
              <p className="text-sm leading-relaxed text-muted">
                Payments are processed securely by{" "}
                <strong className="text-ink">Paystack</strong>. We never see or
                store your full card details.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/learn" variant="ghost">
                  Learning dashboard →
                </Button>
                <Button href="/learn/start" variant="primary">
                  Start free baseline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Small decorative mark per programme: sparkle (Kids), bolt (Adolescents), compass (Adults). */
function ProgrammeIcon({ id }: { id: ProgrammeId }) {
  const common = {
    width: 36,
    height: 36,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "shrink-0 opacity-90",
  };
  if (id === "kids")
    return (
      <svg {...common}>
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        <path d="M19 15.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" />
      </svg>
    );
  if (id === "adolescents")
    return (
      <svg {...common}>
        <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" />
      </svg>
    );
  return (
    <svg {...common} style={{ color: PROGRAMME_THEME.adults.accent }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  );
}

/**
 * Checkout for one programme in a native modal dialog: focus moves in and is
 * kept there, Esc or the close button dismisses it, and focus returns to the
 * card's Buy button. Opening it never moves the page layout.
 */
function CheckoutDialog({
  dialogRef,
  programmeId,
  onClosed,
  onDemo,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  programmeId: ProgrammeId | null;
  onClosed: () => void;
  onDemo: (id: ProgrammeId) => void;
}) {
  const p = programmes.find((x) => x.id === programmeId);
  // Open once the chosen programme's form has rendered, then put the cursor
  // in the first field (email) so buyers can type straight away.
  useEffect(() => {
    const d = dialogRef.current;
    if (!programmeId || !d) return;
    if (!d.open) d.showModal();
    d.querySelector<HTMLInputElement>("input")?.focus();
  }, [programmeId, dialogRef]);
  return (
    <dialog
      ref={dialogRef}
      onClose={onClosed}
      onClick={(e) => {
        // Click on the backdrop (outside the panel) closes it.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      aria-labelledby="checkout-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border border-line bg-elevated p-0 text-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px]"
      data-testid="checkout-dialog"
    >
      {p && (
        <div>
          <div
            className="flex items-start justify-between gap-3 px-6 pb-5 pt-5"
            style={programmeBandStyle(p.id)}
          >
            <div className="min-w-0">
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
                style={{ color: PROGRAMME_THEME[p.id].accent }}
              >
                Checkout · {p.ageLabel}
              </p>
              <h2 id="checkout-title" className="mt-1 text-lg font-semibold tracking-tight">
                {p.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close checkout"
              className="-mr-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none hover:bg-black/10"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          <div className="p-6">
            <PaystackCheckout
              programmeId={p.id}
              programmeName={p.name}
              onDemoFallback={() => onDemo(p.id)}
            />
            <button
              type="button"
              onClick={() => onDemo(p.id)}
              className="mt-3 min-h-11 w-full text-center text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Start free on this device instead (no payment)
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}