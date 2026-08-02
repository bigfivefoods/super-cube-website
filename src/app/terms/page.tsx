import type { Metadata } from "next";
import { Button, PageHero } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using Super-Cube® website and Learn platform.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        theme="none"
        eyebrow="Legal"
        title="Terms of use"
        description="By using super-cube.me and Super-Cube® Learn you agree to these terms. Super-Cube® is a trademark of its owner; the model is for educational and development use."
      >
        <Button href="/privacy" variant="ghost">
          Privacy
        </Button>
        <Button href="/contact" variant="primary">
          Questions
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site max-w-3xl space-y-8 text-slate">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              1. Service
            </h2>
            <p className="mt-3">
              We provide leadership education content, assessments, and tools for
              personal, school, and organisational development. Features may
              change as we improve the product.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              2. Not clinical or employment advice
            </h2>
            <p className="mt-3">
              Assessments are developmental self-report instruments, not clinical
              diagnostics, hiring tools, or medical advice. Organisations remain
              responsible for fair HR practice and POPIA compliance.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              3. Accounts & demos
            </h2>
            <p className="mt-3">
              Demo access may run on-device without payment. Paid programmes and
              cohort tools may require authentication and payment providers
              (e.g. Paystack). You are responsible for safeguarding your login.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              4. Intellectual property
            </h2>
            <p className="mt-3">
              Super-Cube® model, branding, course media, and software remain our
              intellectual property (or licensed to us). You may use outputs (e.g.
              your growth report) for personal and organisational development; you
              may not resell course content or rebrand the model without written
              permission.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              5. Acceptable use
            </h2>
            <p className="mt-3">
              Do not abuse APIs, scrape at scale, harass users, or upload unlawful
              content. School facilitators must follow safeguarding policies.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              6. Liability
            </h2>
            <p className="mt-3">
              The service is provided “as is.” To the fullest extent permitted by
              law we disclaim indirect damages. Nothing excludes liability that
              cannot be excluded under applicable South African law.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              7. Contact
            </h2>
            <p className="mt-3">
              <a className="font-semibold text-ink" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>
          </div>
          <p className="text-sm text-muted">Last updated: 2026-07-31</p>
        </div>
      </section>
    </>
  );
}
