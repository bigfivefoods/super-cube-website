import type { Metadata } from "next";
import { NewsPostView } from "@/components/pages/NewsPost";
import { site } from "@/lib/content";
import {
  NEWS_FEED_PATH,
  clampDescription,
  newsShareImage,
  newsTitleTag,
  newsUrl,
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
    title: { absolute: newsTitleTag(post) },
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
  return <NewsPostView slug={slug} />;
}
