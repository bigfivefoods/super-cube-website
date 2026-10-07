import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NewsBody } from "@/components/news/NewsBody";
import { NewsCard } from "@/components/news/NewsCard";
import { BrandText } from "@/components/news/BrandText";
import { HeroPicture } from "@/components/news/HeroPicture";
import { ShareButtons } from "@/components/news/ShareButtons";
import { site } from "@/lib/content";
import {
  NEWS_FEED_PATH,
  clampDescription,
  formatNewsDate,
  newsArticleJsonLd,
  newsShareImage,
  newsUrl,
  readingMinutes,
  stripMarks,
} from "@/lib/news/seo";
import { getPublishedNews, listPublishedNews } from "@/lib/news/store";
import { pageLanguages } from "@/lib/seo";

/** ISR: rendered once, then refreshed in the background at most every 5 minutes. */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listPublishedNews()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedNews(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: true } };
  const title = stripMarks(post.title);
  const description = clampDescription(post.excerpt);
  const share = newsShareImage(post);
  const url = newsUrl(post.slug);
  return {
    // Short <title>; the on-page headline keeps the full title with ®.
    title: { absolute: `${clampDescription(title, 60)} | Super-Cube®` },
    description,
    alternates: {
      canonical: url,
      languages: pageLanguages(url),
      types: { "application/rss+xml": [{ url: NEWS_FEED_PATH, title: "Super-Cube® News" }] },
    },
    openGraph: {
      siteName: site.name,
      locale: "en_ZA",
      type: "article",
      title,
      description,
      url,
      images: [share],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: [{ url: share.url, alt: share.alt }] },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedNews(slug);
  if (!post) notFound();

  const share = { url: newsUrl(post.slug), title: stripMarks(post.title), summary: clampDescription(post.excerpt) };
  const others = (await listPublishedNews()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const minutes = readingMinutes(post.body);
  const json = JSON.stringify(newsArticleJsonLd(post)).replace(/</g, "\\u003c");

  return (
    <>
      {/* Home › News › <title>: the layout's copy steps aside for post pages (it can't know the title). */}
      <Breadcrumbs leafLabel={post.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <article data-news-post={post.slug}>
        {/* Full-width hero, the same size as the landing hero (page-hero--full). */}
        <header className="page-hero page-hero--full page-hero--media relative isolate flex w-full flex-col overflow-hidden bg-void">
          <HeroPicture square={post.coverImage} wide={post.coverWide} alt={post.coverAlt} />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 sm:via-black/60 sm:to-black/10"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" aria-hidden />
          <div className="container-site page-hero__inner relative z-[1] w-full pb-2">
            <div className="page-hero__copy min-w-0 max-w-2xl md:max-w-[38rem] lg:max-w-[42rem]">
              <p className="eyebrow eyebrow--on-dark">{post.tag}</p>
              <h1 className="page-hero__title heading-lg mt-3 text-white sm:mt-4">
                <BrandText text={post.title} />
              </h1>
              <p className="page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight text-white/85 sm:mt-5 sm:text-base md:text-lg lg:text-xl">
                {post.excerpt}
              </p>
              <p className="mt-4 text-sm text-white/75">
                <time dateTime={post.publishedAt}>{formatNewsDate(post.publishedAt)}</time>
                <span aria-hidden> · </span>
                {minutes} min read
              </p>
              <div className="mt-6">
                <ShareButtons {...share} tone="dark" position="top" />
              </div>
            </div>
          </div>
        </header>

        <div className="section-pad bg-paper">
          <div className="container-site max-w-3xl">
            <div className="spectrum-rule mb-8 max-w-16 rounded-full" aria-hidden />
            <NewsBody body={post.body} />
            <div className="mt-12 border-t border-line pt-8">
              <ShareButtons {...share} position="bottom" label="Found this useful? Share it" />
            </div>
          </div>
        </div>
      </article>

      <section className="section-pad border-t border-line bg-surface" aria-label="Newsletter">
        <div className="container-site max-w-2xl">
          <NewsletterSignup
            source={`news/${post.slug}`.slice(0, 40)}
            title="Get Super-Cube® News by email"
            description="New posts and programme updates, straight to your inbox. You can unsubscribe from any email."
          />
        </div>
      </section>

      {others.length > 0 && (
        <section className="section-pad border-t border-line bg-paper" aria-labelledby="more-news">
          <div className="container-site">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="more-news" className="heading-md text-ink">
                More news
              </h2>
              <Link href="/news" className="inline-flex min-h-11 items-center text-sm font-semibold text-ink hover:underline">
                All news →
              </Link>
            </div>
            <ul role="list" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <NewsCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
