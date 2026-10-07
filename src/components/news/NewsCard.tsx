import Link from "next/link";
import { BrandText } from "@/components/news/BrandText";
import { formatNewsDate } from "@/lib/news/seo";
import type { NewsPost } from "@/lib/news/types";
import { NewsImage } from "./NewsImage";

/** Card with a square cover: the /news grid and the homepage "Latest" strip. */
export function NewsCard({ post, headingLevel = "h3" }: { post: NewsPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden sc-card sc-card--link has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink" data-news-card={post.slug}>
      <div className="relative aspect-square overflow-hidden bg-surface">
        <NewsImage
          src={post.coverImage}
          alt=""
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
          {post.tag}
          <span aria-hidden> · </span>
          <time dateTime={post.publishedAt}>{formatNewsDate(post.publishedAt)}</time>
        </p>
        <H className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink">
          {/* The whole card is clickable through this link's ::after overlay. */}
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline">
            <BrandText text={post.title} />
          </Link>
        </H>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate">{post.excerpt}</p>
        <p aria-hidden className="mt-auto pt-4 text-sm font-semibold text-ink">
          Read more <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </p>
      </div>
    </article>
  );
}
