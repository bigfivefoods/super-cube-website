import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { listPublishedNews } from "@/lib/news/store";
import { NewsCard } from "./NewsCard";

/** Homepage "Latest" strip: the three newest News posts. Renders nothing without posts. */
export async function LatestNews() {
  const posts = (await listPublishedNews()).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="section-pad border-t border-line bg-paper" data-testid="latest-news">
      <div className="container-site">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Latest" title="News from Super-Cube®" />
          <Link
            href="/news"
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            All news →
          </Link>
        </div>
        <ul role="list" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <NewsCard post={p} />
            </li>
          ))}
          {posts.length < 3 && (
            <li>
              <Link
                href="/news#subscribe"
                className="group flex h-full min-h-[18rem] flex-col justify-between rounded-2xl bg-void p-6 text-void-fg sm:p-8 dark:bg-elevated dark:ring-1 dark:ring-white/10"
              >
                <span>
                  <span className="spectrum-rule mb-6 block h-0.5 max-w-16 rounded-full" aria-hidden />
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-void-fg/70">Newsletter</span>
                  <span className="mt-3 block text-2xl font-semibold leading-tight tracking-tight">Get every new post by email.</span>
                  <span className="mt-3 block text-sm leading-relaxed text-void-fg/80">
                    Launches, programme updates and practical leadership ideas. Unsubscribe any time.
                  </span>
                </span>
                <span className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-semibold text-black group-hover:bg-white/90">
                  Subscribe →
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
