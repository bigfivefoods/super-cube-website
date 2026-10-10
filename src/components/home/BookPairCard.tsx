import Image from "next/image";
import type { ReactNode } from "react";

/**
 * One of the two home book cards (the free book and the comprehensive edition), built on the free-book card's
 * design: spectrum rule, cover on the left, eyebrow, heading, English book title, body, then the buttons along the
 * bottom. Both cards share this shell, so they are the same size side by side (lg) and stack the same way on phones.
 */
export function BookPairCard({
  testId,
  cover,
  eyebrow,
  heading,
  title,
  body,
  actions,
}: {
  testId?: string;
  cover: { src: string; width: number; height: number; alt: string };
  eyebrow: ReactNode;
  /** The card's heading element (h2 for the section's first card, h3 for the second), already styled with BOOK_CARD_HEADING. */
  heading: ReactNode;
  /** The book's own title (English in every language). */
  title: ReactNode;
  body: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="sc-card relative flex h-full min-w-0 flex-col overflow-hidden p-6 sm:p-8" data-testid={testId}>
      <span className="spectrum-rule absolute inset-x-0 top-0 h-1" aria-hidden />
      <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:gap-7">
        <div className="mx-auto w-32 sm:mx-0 sm:w-full">
          <Image
            src={cover.src}
            width={cover.width}
            height={cover.height}
            alt={cover.alt}
            sizes="128px"
            className="h-auto w-full rounded-md shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)] ring-1 ring-black/10 dark:ring-white/10"
          />
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          {heading}
          <p className="mt-2 text-base font-semibold tracking-tight text-ink">{title}</p>
          <p className="mt-3 text-base leading-relaxed text-slate">{body}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
    </div>
  );
}

/** Heading style shared by both book cards. */
export const BOOK_CARD_HEADING = "heading-md mt-2.5 text-ink text-balance";
