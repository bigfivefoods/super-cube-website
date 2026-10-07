"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { breadcrumbJsonLd, breadcrumbTone, breadcrumbTrail } from "@/lib/breadcrumbs";

/**
 * Breadcrumbs (Home › Section › Page) on every public page except home.
 *
 * Overlaid just below the fixed header, inside the hero's top padding, so it
 * never changes a hero's height. Rendered on the server too (usePathname works
 * during SSR), so the row and its BreadcrumbList JSON-LD are in the first HTML.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useLocale();
  const trail = breadcrumbTrail(pathname);
  if (!trail) return null;

  const tone = breadcrumbTone(pathname);
  const linkCls =
    tone === "dark" ? "text-white/70 hover:text-white" : "text-slate hover:text-ink";
  const currentCls = tone === "dark" ? "text-white" : "text-ink";
  const sepCls = tone === "dark" ? "text-white/40" : "text-muted";
  const json = JSON.stringify(breadcrumbJsonLd(trail)).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <nav aria-label={t("bc.label")} className={`site-breadcrumbs site-breadcrumbs--${tone}`}>
        <ol className="site-breadcrumbs__list">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            const label = crumb.i18n ? t(crumb.i18n) : crumb.label;
            return (
              <li key={crumb.href} className={last ? "min-w-0" : "shrink-0"}>
                {i > 0 && (
                  <span aria-hidden className={`site-breadcrumbs__sep ${sepCls}`}>
                    ›
                  </span>
                )}
                {last ? (
                  <span aria-current="page" title={label} className={`site-breadcrumbs__current ${currentCls}`}>
                    {label}
                  </span>
                ) : (
                  <Link href={crumb.href} className={`site-breadcrumbs__link ${linkCls}`}>
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
