import { BrandText } from "@/components/news/BrandText";
import { HeroPicture } from "@/components/news/HeroPicture";
import { NewsBody } from "@/components/news/NewsBody";
import { NewsImage } from "@/components/news/NewsImage";
import { ShareButtons } from "@/components/news/ShareButtons";
import { NEWS_HERO } from "@/lib/news/hero";
import { clampDescription, formatNewsDate, newsUrl, readingMinutes, stripMarks } from "@/lib/news/seo";
import type { NewsPost } from "@/lib/news/types";

/**
 * A news post: full-width hero (the same size as the landing hero), share row, body,
 * closing share row. Used by /news/[slug] and the admin preview.
 */
export function NewsArticle({ post }: { post: NewsPost }) {
  const share = { url: newsUrl(post.slug), title: stripMarks(post.title), summary: clampDescription(post.excerpt) };
  // The hero is always calm artwork (never the cover, which may carry charts or screenshots).
  const hero = post.heroImage ? { square: post.heroImage, wide: post.heroWide } : NEWS_HERO;
  // Admin posts don't repeat their cover in the body, so show it once at the top of the article.
  const coverInBody =
    post.source === "code" || post.body.includes(post.coverImage) || (!!post.coverWide && post.body.includes(post.coverWide));
  const minutes = readingMinutes(post.body);
  return (
    <article data-news-post={post.slug}>
      {/* Full-width hero, the same size as the landing hero (page-hero--full). */}
      <header className="page-hero page-hero--full page-hero--media relative isolate flex w-full flex-col overflow-hidden bg-void">
        <HeroPicture square={hero.square} wide={hero.wide} alt="" />
        {/* Lighter scrims than a photo needs: the hero art is already dark and calm behind the text. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15 sm:via-black/40 sm:to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" aria-hidden />
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
          {!coverInBody && (
            <figure className="mb-8 overflow-hidden rounded-2xl border border-line bg-surface" data-news-cover>
              <NewsImage
                src={post.coverWide || post.coverImage}
                alt={post.coverAlt}
                fill={false}
                width={post.coverWide ? 1600 : 1440}
                height={post.coverWide ? 1000 : 1440}
                sizes="(max-width: 768px) 100vw, 720px"
                className="h-auto w-full"
              />
            </figure>
          )}
          <NewsBody body={post.body} />
          <div className="mt-12 border-t border-line pt-8">
            <ShareButtons {...share} position="bottom" label="Found this useful? Share it" />
          </div>
        </div>
      </div>
    </article>
  );
}
