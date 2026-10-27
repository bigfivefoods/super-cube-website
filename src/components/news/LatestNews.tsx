import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { DEFAULT_LOCALE, localizedPath, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { listPublishedNews } from "@/lib/news/store";
import { NewsCard } from "./NewsCard";

/** Homepage "Latest" strip: the three newest News posts. Renders nothing without posts. */
export async function LatestNews({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const posts = (await listPublishedNews()).slice(0, 3);
  if (!posts.length) return null;
  const { t, L } = await pageI18n(locale);
  return (
    <section className="section-pad border-t border-line bg-paper" data-testid="latest-news">
      <div className="container-site">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t("Latest")} title={t("News from Super-Cube®")} />
          <Link
            href={L("/news")}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            {t("All news")} <span aria-hidden className="rtl:-scale-x-100">→</span>
          </Link>
        </div>
        <ul role="list" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <NewsCard post={p} locale={locale} />
            </li>
          ))}
          {posts.length < 3 && (
            <li>
              <Link
                href={localizedPath(locale, "/news#subscribe")}
                className="group flex h-full min-h-[18rem] flex-col justify-between rounded-2xl bg-void p-6 text-void-fg sm:p-8 dark:bg-elevated dark:ring-1 dark:ring-white/10"
              >
                <span>
                  <span className="spectrum-rule mb-6 block h-0.5 max-w-16 rounded-full" aria-hidden />
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-void-fg/70">{t("Newsletter")}</span>
                  <span className="mt-3 block text-2xl font-semibold leading-tight tracking-tight">{t("Get every new post by email.")}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-void-fg/80">
                    {t("Launches, programme updates and practical leadership ideas. Unsubscribe any time.")}
                  </span>
                </span>
                <span className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-semibold text-black group-hover:bg-white/90">
                  {t("Subscribe")} <span aria-hidden className="rtl:-scale-x-100">→</span>
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
