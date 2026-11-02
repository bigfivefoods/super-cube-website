import { Button, PageHero } from "@/components/ui";
import { site } from "@/lib/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  path: "/accessibility",
  title: "Accessibility",
  description:
    "How Super-Cube® works toward WCAG 2.2 Level AA, and how to tell us when a page gets in the way.",
} satisfies PageMetaInput;

const measures = [
  "Pages use headings, landmarks and link names that describe where they go.",
  "You can reach the main content with a skip link, and move through Super-Cube® Learn with a keyboard.",
  "Text is written to meet a contrast of at least 4.5:1 against its background.",
  "The language of each page is set in the HTML, including right-to-left layout for Arabic.",
  "Images that carry meaning have a text alternative. Decorative images are hidden from assistive technology.",
  "Forms name their fields, and errors are written in text, not by colour alone.",
];

export async function AccessibilityView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero
        t={t}
        theme="none"
        eyebrow="Legal"
        title="Accessibility statement"
        description="Super-Cube® aims to meet WCAG 2.2 Level AA so people can use this website and Super-Cube® Learn."
      >
        <Button href={L("/privacy")} variant="ghost">
          {t("Privacy")}
        </Button>
        <Button href={L("/contact")} variant="primary">
          {t("Contact")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site max-w-3xl space-y-8 text-slate">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Our commitment")}</h2>
            <p className="mt-3">
              {t(
                "Super-Cube® is committed to an accessible website and learning app. We want people to read, navigate and use Super-Cube® Learn with a keyboard, a screen reader, or their own display settings.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("The standard we use")}</h2>
            <p className="mt-3">
              {t(
                "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. Those guidelines explain how to make web content more usable for people with disabilities, and they are the standard we test against.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("How we build for access")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {measures.map((item) => (
                <li key={item}>{t(item)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Compatibility")}</h2>
            <p className="mt-3">
              {t(
                "Super-Cube® is built for current versions of Chrome, Edge, Firefox and Safari, including screen readers commonly used with those browsers. Pages adapt to phones and larger screens.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Known limits")}</h2>
            <p className="mt-3">
              {t(
                "The rotating Super-Cube® is a picture of the six faces, and the same labels are written as text for screen readers. If a PDF is hard to read, email us and we will help.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Tell us if something blocks you")}</h2>
            <p className="mt-3">
              {t("If you cannot use any part of Super-Cube®, email")}{" "}
              <a className="font-semibold text-ink" href={`mailto:${site.email}`}>
                {site.email}
              </a>{" "}
              {t(
                "and describe the page and what you were trying to do. We aim to reply within five business days.",
              )}
            </p>
          </div>

          <p className="text-sm text-muted">
            {t("This statement was prepared for WCAG 2.2 Level AA. Last updated: 2 November 2026.")}
          </p>
        </div>
      </section>
    </>
  );
}
