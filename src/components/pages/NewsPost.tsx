import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NewsArticle } from "@/components/news/NewsArticle";
import { NewsCard } from "@/components/news/NewsCard";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { newsArticleJsonLd } from "@/lib/news/seo";
import { getPublishedNews, listPublishedNews } from "@/lib/news/store";

/** One news post, in `locale` (English when omitted). */
export async function NewsPostView({ slug, locale = DEFAULT_LOCALE }: { slug: string; locale?: Locale }) {
  const post = await getPublishedNews(slug);
  if (!post) notFound();
  const { t, L } = pageI18n(locale);
  const others = (await listPublishedNews()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const json = JSON.stringify(newsArticleJsonLd(post)).replace(/</g, "\\u003c");

  return (
    <>
      <Breadcrumbs leafLabel={t(post.title)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <NewsArticle post={post} locale={locale} />

      <section className="section-pad border-t border-line bg-surface" aria-label={t("Newsletter")}>
        <div className="container-site max-w-2xl">
          <NewsletterSignup
            source={`news/${post.slug}`.slice(0, 40)}
            title={t("Get Super-Cube® News by email")}
            description={t("New posts and programme updates, straight to your inbox. You can unsubscribe from any email.")}
          />
        </div>
      </section>

      {others.length > 0 && (
        <section className="section-pad border-t border-line bg-paper" aria-labelledby="more-news">
          <div className="container-site">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="more-news" className="heading-md text-ink">
                {t("More news")}
              </h2>
              <Link href={L("/news")} className="inline-flex min-h-11 items-center text-sm font-semibold text-ink hover:underline">
                {t("All news")} <span aria-hidden className="rtl:-scale-x-100">→</span>
              </Link>
            </div>
            <ul role="list" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <NewsCard post={p} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
