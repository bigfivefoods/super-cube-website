import { BrandText } from "@/components/news/BrandText";
import { HeroPicture } from "@/components/news/HeroPicture";
import { NewsBody } from "@/components/news/NewsBody";
import { ShareButtons } from "@/components/news/ShareButtons";
import { clampDescription, formatNewsDate, newsUrl, readingMinutes, stripMarks } from "@/lib/news/seo";
import type { NewsPost } from "@/lib/news/types";

/**
 * A news post: full-width hero (the same size as the landing hero), share row, body,
 * closing share row. Used by /news/[slug] and the admin preview.
 */
export function NewsArticle({ post }: { post: NewsPost }) {
  const share = { url: newsUrl(post.slug), title: stripMarks(post.title), summary: clampDescription(post.excerpt) };
  const minutes = readingMinutes(post.body);
  return (
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
  );
}
