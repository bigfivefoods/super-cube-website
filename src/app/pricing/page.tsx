"use client";

import { useRouter } from "next/navigation";
import { PageHero, Button } from "@/components/ui";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";
import {
  COURSE_PRICE_USD,
  programmes,
  type ProgrammeId,
} from "@/lib/programmes";

export default function PricingPage() {
  const router = useRouter();

  function startDemo(programmeId: ProgrammeId) {
    const state = loadLmsState();
    state.user = {
      email: state.user?.email || "learner@demo.local",
      fullName: state.user?.fullName || "Demo Learner",
      programmeId,
    };
    state.subscription = {
      programmeId,
      planId: `${programmeId}_once`,
      status: "active",
      activatedAt: new Date().toISOString(),
    };
    saveLmsState(state);
    router.push("/learn");
  }

  async function startPaystack(programmeId: ProgrammeId) {
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
        eyebrow="Pricing"
        title="Three programmes. One price."
        description={`Kids (5–12), Adolescents (13–21), and Adults (22+). Each Super-Cube® pathway is $${COURSE_PRICE_USD} once—assessment, six construct courses, practice, and your personal report.`}
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

            <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
              <p className="text-sm leading-relaxed text-muted">
                Production payments use{" "}
                <strong className="text-ink">Paystack</strong> in{" "}
                <strong className="text-ink">USD</strong> (${COURSE_PRICE_USD} =
                600 cents). Set keys in{" "}
                <code className="text-ink">.env.local</code>. Until then, use
                demo access to explore the LMS.
              </p>
              <div className="mt-6">
                <Button href="/learn" variant="ghost">
                  Go to learning dashboard →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
