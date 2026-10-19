import type { Metadata } from "next";
import { META, NewsIndex } from "@/components/pages/NewsIndex";
import { NEWS_FEED_PATH } from "@/lib/news/seo";
import { pageMeta } from "@/lib/seo";

/** ISR: refreshed at most every 5 minutes (publishing in the admin also revalidates). */
export const revalidate = 300;

const base = pageMeta(META);

export const metadata: Metadata = {
  ...base,
  alternates: {
    ...base.alternates,
    types: { "application/rss+xml": [{ url: NEWS_FEED_PATH, title: "Super-Cube® News" }] },
  },
};

export default function NewsPage() {
  return <NewsIndex />;
}
