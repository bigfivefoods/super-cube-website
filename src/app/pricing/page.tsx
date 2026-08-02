"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHero, Button } from "@/components/ui";
import { track } from "@/lib/analytics";
import { loadLmsState, saveLmsState, unlockDemo } from "@/lib/lms/store";
import {
  COURSE_PRICE_USD,
  programmes,
  type ProgrammeId,
} from "@/lib/programmes";

export default function PricingPage() {
  const router = useRouter();

  function startDemo(programmeId: ProgrammeId) {
    const next = unlockDemo(programmeId);
    track("checkout_demo", { programmeId });
    track("programme_selected", { programmeId, mode: "demo" });
    const email = next.user?.email;
    if (email && !email.includes("@demo.local") && email !== "demo@super-cube.me") {
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

  async function startPaystack(programmeId: ProgrammeId) {
    track("checkout_start", { programmeId });
    track("programme_selected", { programmeId, mode: "paystack" });
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId,
          planId: `${programmeId}_once`,
          email: loadLmsState().user?.email || "learner@demo.local",
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      startDemo(programmeId);
    } catch {
      startDemo(programmeId);
    }
  }

  return (
    <>
      <PageHero
        theme="leadership"
        eyebrow="Pricing"
        title="Start free. Go deep for $6."
        description={`Kids (5–12), Adolescents (13–21), and Adults (22+). Try Super-Cube® free on this device, then unlock full paid access for $${COURSE_PRICE_USD} once—assessment, six faces, practice, report, and certificate.`}
      />

      {/* Separate band so pricing content never sits “on” the hero */}
      <section className="relative z-0 border-t border-black/[0.06] bg-[#fafafa]">
        <div className="section-pad">
          <div className="container-site">
            <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-black/[0.08] bg-white px-6 py-6 text-center shadow-sm sm:mb-10 sm:px-10 sm:py-8">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Launch price
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                ${COURSE_PRICE_USD}
                <span className="text-lg font-medium text-muted"> USD</span>
              </p>
              <p className="mt-2 text-sm text-slate">
                One-time access per programme · Paystack checkout when keys are
                configured
              </p>
            </div>

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
              {programmes.map((p) => (
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
                  <p className="mt-2 text-sm font-medium text-slate">{p.tagline}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
                    {p.description}
                  </p>

                  <div className="mt-6 border-t border-black/[0.06] pt-6">
                    <p className="text-3xl font-semibold tracking-tight text-ink">
                      ${p.priceUsd}
                      <span className="text-sm font-medium text-muted">
                        {" "}
                        USD once
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
                    <button
                      type="button"
                      onClick={() => startPaystack(p.id)}
                      className="min-h-11 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
                    >
                      Buy access · ${COURSE_PRICE_USD}
                    </button>
                    <button
                      type="button"
                      onClick={() => startDemo(p.id)}
                      className="text-center text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                    >
                      Start demo access (no payment)
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Schools / teams */}
            <div
              id="pilot"
              className="mx-auto mt-10 max-w-3xl scroll-mt-24 rounded-2xl border border-black/[0.08] bg-white p-6 sm:mt-12 sm:p-8"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Schools · companies · cohorts
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Team & school pilots
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                For classrooms, leadership pipelines, or multi-entity networks we
                set up a cohort code, facilitator guidance, and consented growth
                summaries—without exposing private journals.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate">
                <li>· Individual seats from ${COURSE_PRICE_USD} USD</li>
                <li>· Cohort codes via Learn → Org · coach heat map + CSV</li>
                <li>· 8-week facilitator calendar · practice library</li>
                <li>· Certificate verify IDs · sample report for stakeholders</li>
                <li>· Custom pricing for 20+ seats / school licences</li>
              </ul>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  href="mailto:hello@super-cube.me?subject=Book%20a%20Super-Cube%20pilot&body=Organisation%3A%0AAudience%20(kids%2Fadolescents%2Fadults)%3A%0AApprox%20seats%3A%0APreferred%20dates%3A%0A"
                  variant="primary"
                >
                  Book a pilot (email)
                </Button>
                <Button href="/contact" variant="ghost">
                  Contact form
                </Button>
                <Button href="/facilitator" variant="ghost">
                  Facilitator kit
                </Button>
                <Button href="/learn/start" variant="ghost">
                  Try free baseline first
                </Button>
                <Link
                  href="/learn/org"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Join with a cohort code →
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
              <p className="text-sm leading-relaxed text-muted">
                Production payments use{" "}
                <strong className="text-ink">Paystack</strong> in{" "}
                <strong className="text-ink">USD</strong> (${COURSE_PRICE_USD} =
                600 cents). Set{" "}
                <code className="text-ink">PAYSTACK_SECRET_KEY</code> and{" "}
                <code className="text-ink">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code>{" "}
                in Vercel. Until then, free demo unlocks the full Learn path on
                this device.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/learn" variant="ghost">
                  Go to learning dashboard →
                </Button>
                <Button href="/learn/demo" variant="primary">
                  Start free demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
