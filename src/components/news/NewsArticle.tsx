import { getImageProps } from "next/image";
import { BrandText } from "@/components/news/BrandText";
import { HeroPicture } from "@/components/news/HeroPicture";
import { NewsBody } from "@/components/news/NewsBody";
import { NewsImage } from "@/components/news/NewsImage";
import { ShareButtons } from "@/components/news/ShareButtons";
import { PaidBookCard } from "@/components/book/PaidBook";
import { Button } from "@/components/ui";
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
  // Hero copy (eyebrow, headline, standfirst, date, call to action, share row): over the calm hero art, or under a feature image.
  const heroCopy = (
    <>
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
      {post.cta && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4" data-news-cta>
          {post.cta.external ? (
            <a
              href={post.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.cta.ariaLabel}
              data-insights={post.cta.insights}
              data-testid="news-cta"
              className="sc-btn sc-btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full !bg-white px-5 py-2.5 text-sm font-semibold tracking-tight !text-ink hover:!bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:!outline-white sm:w-auto sm:px-6"
            >
              {post.cta.label}
              <ExternalIcon />
            </a>
          ) : (
            <Button
              href={post.cta.href}
              download={post.cta.download}
              variant="primary"
              ariaLabel={post.cta.ariaLabel}
              className="w-full !bg-white !text-ink hover:!bg-white/90 focus-visible:!outline-white sm:w-auto"
            >
              {post.cta.download && <DownloadIcon />}
              {post.cta.label}
            </Button>
          )}
          {post.cta.note && <p className="text-sm text-white/75">{post.cta.note}</p>}
        </div>
      )}
      <div className="mt-6">
        <ShareButtons {...share} tone="dark" position="top" />
      </div>
    </>
  );
  const feature = post.featureHero;
  return (
    <article data-news-post={post.slug}>
      {feature ? (
        /*
         * Feature-image hero: the designed image (with its own words) shows whole, at a moderate size inside the
         * page container (not full-bleed), under the header and breadcrumbs; the hero copy follows underneath at the
         * normal news sizes.
         */
        <header
          className="page-hero relative isolate flex w-full flex-col overflow-hidden !pb-0"
          // The image's own dark ground (inline: .page-hero sets the page background), so header, breadcrumbs and image read as one.
          style={{ paddingTop: "calc(var(--hero-pad-top) + 2.5rem)", backgroundColor: "#0b0b0e" }}
          data-feature-hero
        >
          <div className="container-site w-full">
            <div className="max-w-[56rem] overflow-hidden rounded-2xl ring-1 ring-white/10">
              <FeaturePicture {...feature} />
            </div>
          </div>
          <div className="container-site relative z-[1] w-full pb-12 pt-8 sm:pb-16 sm:pt-10">
            <div className="min-w-0 max-w-3xl">{heroCopy}</div>
          </div>
        </header>
      ) : (
      // Full-width hero, the same size as the landing hero (page-hero--full).
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
            {heroCopy}
          </div>
        </div>
      </header>
      )}

      <div className="section-pad bg-paper">
        <div className="container-site">
          {/* A feature-image post keeps a comfortable reading measure (.container-site's own max-width beats max-w-3xl). */}
          <div className={feature ? "max-w-3xl" : undefined}>
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
          {post.bookCard === "paid" && (
            <div className="mt-10" data-news-book-card>
              <PaidBookCard testId="news-paid-book" eyebrow="Out now in paperback · Amazon" />
            </div>
          )}
          <div className="mt-12 border-t border-line pt-8">
            <ShareButtons {...share} position="bottom" label="Found this useful? Share it" />
          </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** The feature image, uncropped: landscape from 640px, square on phones (one <picture>, one download). */
function FeaturePicture({ wide, square, alt }: NonNullable<NewsPost["featureHero"]>) {
  const common = { alt, sizes: "(min-width: 960px) 896px, 100vw", quality: 80 } as const;
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: square, width: 1440, height: 1440, priority: true });
  const desktop = getImageProps({ ...common, src: wide, width: 2400, height: 1260, priority: true }).props.srcSet;
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktop} sizes="(min-width: 960px) 896px, 100vw" width={2400} height={1260} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in rest */}
      <img {...rest} srcSet={mobile} className="block h-auto w-full" data-feature-hero-image />
    </picture>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 11v6" />
      <path d="m9 14 3 3 3-3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
