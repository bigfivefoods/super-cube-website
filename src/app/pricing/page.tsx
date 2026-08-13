"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaystackCheckout } from "@/components/PaystackCheckout";
import { SeatPackCheckout } from "@/components/SeatPackCheckout";
import { PageHero, Button } from "@/components/ui";
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
  const [expanded, setExpanded] = useState<ProgrammeId | null>("adults");
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
        description={`Kids (5–12), Adolescents (13–21), and Adults (22+). Free baseline on this device—then pay once with Paystack (R${COURSE_PRICE_ZAR} / $${COURSE_PRICE_USD} USD). No subscription.`}
      />

      <section className="relative z-0 border-t border-black/[0.06] bg-[#fafafa]">
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

            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-black/[0.08] bg-white px-5 py-5 sm:mb-10 sm:px-8 sm:py-6">
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
                  — full programme, report, certificate via{" "}
                  <strong className="text-ink">Paystack</strong>.
                </li>
                <li>
                  <strong className="text-ink">No monthly fee</strong> — one
                  payment per programme on this path.
                </li>
              </ul>
            </div>

            <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-black/[0.08] bg-white px-6 py-6 text-center shadow-sm sm:mb-10 sm:px-10 sm:py-8">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Launch price · one-time · Paystack
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                R{COURSE_PRICE_ZAR}
                <span className="text-lg font-medium text-muted"> ZAR</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                or ${COURSE_PRICE_USD} USD · set{" "}
                <code className="text-ink">PAYSTACK_CURRENCY</code>
              </p>
            </div>

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
              {programmes.map((p) => {
                const open = expanded === p.id;
                return (
                  <article
                    key={p.id}
                    id={p.id}
                    className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      {p.ageLabel}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                      {p.name}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate">
                      {p.tagline}
                    </p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
                      {p.description}
                    </p>

                    <div className="mt-6 border-t border-black/[0.06] pt-6">
                      <p className="text-3xl font-semibold tracking-tight text-ink">
                        R{p.priceZar}
                        <span className="text-sm font-medium text-muted">
                          {" "}
                          once
                        </span>
                      </p>
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-slate">
                      <li>· Pre-assessment baseline</li>
                      <li>· 6 construct courses (age-adapted)</li>
                      <li>· Practice labs & checks</li>
                      <li>· Post-assessment & personal report</li>
                    </ul>

                    <div className="mt-6 flex flex-col gap-2">
                      {!open ? (
                        <button
                          type="button"
                          onClick={() => setExpanded(p.id)}
                          className="min-h-11 rounded-full sc-btn-primary px-4 py-2.5 text-sm font-semibold hover:opacity-90"
                        >
                          Buy with Paystack · R{COURSE_PRICE_ZAR}
                        </button>
                      ) : (
                        <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-4">
                          <p className="mb-3 text-[0.75rem] font-semibold text-ink">
                            Checkout · {p.name}
                          </p>
                          <PaystackCheckout
                            programmeId={p.id}
                            programmeName={p.name}
                            onDemoFallback={() => startDemo(p.id)}
                          />
                          <button
                            type="button"
                            onClick={() => setExpanded(null)}
                            className="mt-2 w-full text-center text-[0.7rem] font-semibold text-muted hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => startDemo(p.id)}
                        className="text-center text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        Start free on this device (no payment)
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div
              id="pilot"
              className="mx-auto mt-10 max-w-3xl scroll-mt-24 rounded-2xl border border-black/[0.08] bg-white p-6 sm:mt-12 sm:p-8"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Schools · companies · cohorts · Phase 2
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Seat packs — pay once, get a cohort code
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                Buy 10, 20, or 50 learner seats. We create a cohort code after
                payment. Learners join under Learn → Org. Coaches see scores and
                completion only when learners consent—never journal text.
              </p>
              <div className="mt-6 rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5">
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
                Payments run on <strong className="text-ink">Paystack</strong>.
                Set <code className="text-ink">PAYSTACK_SECRET_KEY</code>,{" "}
                <code className="text-ink">
                  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
                </code>
                , optional{" "}
                <code className="text-ink">PAYSTACK_CURRENCY=ZAR|USD</code>.
                Webhook: <code className="text-ink">/api/paystack/webhook</code>
                . See <code className="text-ink">docs/PAYSTACK.md</code>.
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
