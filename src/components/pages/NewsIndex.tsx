import Link from "next/link";
import { BrandText } from "@/components/news/BrandText";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsImage } from "@/components/news/NewsImage";
import { PageHero } from "@/components/ui";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { NEWS_HERO } from "@/lib/news/hero";
import { NEWS_FEED_PATH, formatNewsDate } from "@/lib/news/seo";
import { listPublishedNews } from "@/lib/news/store";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  title: "News",
  description:
    "Super-Cube® news: launches, programme updates and research from the Super-Cube® Leadership Model. Read, share, or get each post by email.",
  path: "/news",
  keywords: ["Super-Cube® news", "leadership development news", "Super-Cube® LMS"],
} satisfies PageMetaInput;

/** News index. Refreshed with the route's revalidate (publishing in the admin also revalidates). */
export async function NewsIndex({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  const posts = await listPublishedNews();
  const [featured, ...rest] = posts;
  const heroImage = NEWS_HERO.wide;

  return (
    <>
      <PageHero
        t={t}
        eyebrow="Super-Cube® News"
        title="News and updates"
        description="Launches, programme updates and research from Super-Cube®. Read the latest, share it, or get every new post by email."
        image={heroImage}
        imageAlt=""
      >
        <Link
          href="#subscribe"
          className="sc-btn inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6"
        >
          {t("Get the newsletter")}
        </Link>
        <a
          href={NEWS_FEED_PATH}
          hrefLang={locale === DEFAULT_LOCALE ? undefined : "en"}
          className="sc-btn inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6"
        >
          {t("RSS feed")}
        </a>
      </PageHero>

      <section className="section-pad border-t border-line bg-surface" aria-label={t("Posts")}>
        <div className="container-site">
          {!featured ? (
            <p className="text-slate">{t("No posts yet. Subscribe below to hear first.")}</p>
          ) : (
            <>
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{t("Latest")}</h2>
              <article
                className="group relative mt-4 grid overflow-hidden sc-card sc-card--link md:grid-cols-2 has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink"
                data-news-featured={featured.slug}
              >
                <div className="relative aspect-square overflow-hidden bg-paper md:aspect-auto md:min-h-[24rem]">
                  <NewsImage
                    src={featured.featureHero?.card ?? featured.coverImage}
                    alt=""
                    priority
                    sizes="(max-width: 768px) 100vw, 560px"
                    className={`${featured.featureHero ? "bg-void object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.03]`}
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {t(featured.tag)}
                    <span aria-hidden> · </span>
                    <time dateTime={featured.publishedAt}>{formatNewsDate(featured.publishedAt, locale)}</time>
                  </p>
                  <h3 className="heading-md mt-3 text-ink">
                    <Link
                      href={L(`/news/${featured.slug}`)}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
                    >
                      <BrandText text={t(featured.title)} />
                    </Link>
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate">{t(featured.excerpt)}</p>
                  <p aria-hidden className="mt-6 text-sm font-semibold text-ink">
                    {t("Read more")} <span className="rtl:-scale-x-100">→</span>
                  </p>
                </div>
              </article>

              {rest.length > 0 && (
                <>
                  <h2 className="mt-12 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{t("All posts")}</h2>
                  <ul role="list" className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p) => (
                      <li key={p.slug}>
                        <NewsCard post={p} locale={locale} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section id="subscribe" className="section-pad scroll-mt-24 border-t border-line bg-paper">
        <div className="container-site max-w-2xl">
          <NewsletterSignup
            source="news"
            title={t("Get Super-Cube® News by email")}
            description={t(
              "New posts, programme updates and one practical leadership idea at a time. We email you a link to confirm first, and you can unsubscribe from any email.",
            )}
          />
        </div>
      </section>
    </>
  );
}
