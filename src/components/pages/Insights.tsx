import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { fill } from "@/lib/i18n/pages/format";
import { pageI18n } from "@/lib/i18n/pages/t";
import { getInsight, insightPosts } from "@/lib/insights";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  path: "/insights",
  title: "Insights",
  description: "Essays on learnable leadership, Super-Cube® constructs, I–Thou practice, and SDG-linked development.",
} satisfies PageMetaInput;

export function InsightsIndex({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  return (
    <>
      <PageHero
        t={t}
        theme="research"
        eyebrow="Content"
        title="Insights"
        description="Short, research-informed essays for leaders, L&D, and educators. Continuous publishing keeps Super-Cube® a living authority—not a static brochure."
      >
        <Button href={L("/research")} variant="ghost">
          {t("Research")}
        </Button>
        <Button href={L("/media")} variant="ghost">
          {t("Media kit")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site">
          <SectionHeading title={t("Latest")} />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {insightPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={L(`/insights/${p.slug}`)}
                  className="block h-full sc-card p-5 transition hover:border-black/15 dark:hover:border-white/20 hover:shadow-sm sm:p-6"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    <span dir="ltr">{p.date}</span>
                    {" · "}
                    {fill(t("{n} min"), { n: p.readingMinutes })}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">{t(p.title)}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{t(p.excerpt)}</p>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {t("Read")} <span aria-hidden className="rtl:-scale-x-100">→</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function InsightArticle({ slug, locale = DEFAULT_LOCALE }: { slug: string; locale?: Locale }) {
  const post = getInsight(slug);
  if (!post) notFound();
  const { t, L } = pageI18n(locale);
  return (
    <article>
      <header className="border-b border-line bg-bg">
        <div className="container-site max-w-3xl pb-12 pt-28 sm:pb-16 lg:pt-32">
          <p className="eyebrow">{t("Insights")}</p>
          <h1 className="heading-lg mt-3 text-ink">{t(post.title)}</h1>
          <p className="mt-3 text-sm text-muted">
            <span dir="ltr">{post.date}</span>
            {" · "}
            {fill(t("{n} min read"), { n: post.readingMinutes })}
            {" · "}
            {post.tags.map((tag) => t(tag)).join(" · ")}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate">{t(post.excerpt)}</p>
        </div>
      </header>
      <div className="section-pad bg-surface">
        <div className="container-site prose-site max-w-3xl space-y-5">
          {post.body.map((para) => (
            <p key={para.slice(0, 48)}>{t(para)}</p>
          ))}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button href={L("/learn/start")} variant="primary">
              {t("Start free baseline")}
            </Button>
            <Button href={L("/insights")} variant="ghost">
              {t("All insights")}
            </Button>
          </div>
          <p className="text-sm text-muted">
            <Link href={L("/research")} className="font-semibold text-ink">
              {t("Research")}
            </Link>{" "}
            ·{" "}
            <Link href={L("/practices")} className="font-semibold text-ink">
              {t("Practice library")}
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
