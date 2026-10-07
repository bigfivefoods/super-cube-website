import type { Metadata } from "next";
import Link from "next/link";
import { BrandText } from "@/components/news/BrandText";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsImage } from "@/components/news/NewsImage";
import { PageHero } from "@/components/ui";
import { NEWS_FEED_PATH, formatNewsDate } from "@/lib/news/seo";
import { listPublishedNews } from "@/lib/news/store";
import { pageMeta } from "@/lib/seo";

/** ISR: refreshed at most every 5 minutes (publishing in the admin also revalidates). */
export const revalidate = 300;

const base = pageMeta({
  title: "News",
  description:
    "Super-Cube® news: launches, programme updates and research from the Super-Cube® Leadership Model. Read, share, or get each post by email.",
  path: "/news",
  keywords: ["Super-Cube® news", "leadership development news", "Super-Cube® LMS"],
});

export const metadata: Metadata = {
  ...base,
  alternates: {
    ...base.alternates,
    types: { "application/rss+xml": [{ url: NEWS_FEED_PATH, title: "Super-Cube® News" }] },
  },
};

const HERO_FALLBACK = "/news/super-cube-lms-cover-wide.jpg";

export default async function NewsPage() {
  const posts = await listPublishedNews();
  const [featured, ...rest] = posts;
  const heroImage = featured?.coverWide && featured.coverWide.startsWith("/") ? featured.coverWide : HERO_FALLBACK;

  return (
    <>
      <PageHero
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
          Get the newsletter
        </Link>
        <a
          href={NEWS_FEED_PATH}
          className="sc-btn inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6"
        >
          RSS feed
        </a>
      </PageHero>

      <section className="section-pad border-t border-line bg-surface" aria-label="Posts">
        <div className="container-site">
          {!featured ? (
            <p className="text-slate">No posts yet. Subscribe below to hear first.</p>
          ) : (
            <>
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Latest</h2>
              <article
                className="group relative mt-4 grid overflow-hidden sc-card sc-card--link md:grid-cols-2 has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink"
                data-news-featured={featured.slug}
              >
                <div className="relative aspect-square overflow-hidden bg-paper md:aspect-auto md:min-h-[24rem]">
                  <NewsImage
                    src={featured.coverImage}
                    alt=""
                    priority
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {featured.tag}
                    <span aria-hidden> · </span>
                    <time dateTime={featured.publishedAt}>{formatNewsDate(featured.publishedAt)}</time>
                  </p>
                  <h3 className="heading-md mt-3 text-ink">
                    <Link
                      href={`/news/${featured.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
                    >
                      <BrandText text={featured.title} />
                    </Link>
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate">{featured.excerpt}</p>
                  <p aria-hidden className="mt-6 text-sm font-semibold text-ink">
                    Read more →
                  </p>
                </div>
              </article>

              {rest.length > 0 && (
                <>
                  <h2 className="mt-12 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">All posts</h2>
                  <ul role="list" className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p) => (
                      <li key={p.slug}>
                        <NewsCard post={p} />
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
            title="Get Super-Cube® News by email"
            description="New posts, programme updates and one practical leadership idea at a time. You can unsubscribe from any email."
          />
        </div>
      </section>
    </>
  );
}
