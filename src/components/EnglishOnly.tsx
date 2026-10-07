import type { ReactNode } from "react";

/**
 * A section that stays in English on a translated page (as on bigfivegroup.africa): a one-line
 * note in the page language, then the English section marked lang="en" dir="ltr" so screen readers
 * and the Arabic layout treat it correctly. On English pages it renders the section unchanged.
 */
export function EnglishOnly({
  note,
  children,
  className = "",
  inline = false,
}: {
  /** null on English pages */
  note: string | null;
  children: ReactNode;
  className?: string;
  /** Note without the page container (inside a card) */
  inline?: boolean;
}) {
  if (!note) return <>{children}</>;
  return (
    <div data-english-only className={className}>
      <div className={inline ? "" : "container-site pt-6"}>
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
          <span className="font-semibold text-ink" aria-hidden>
            EN
          </span>
          <span>{note}</span>
        </p>
      </div>
      <div lang="en" dir="ltr">
        {children}
      </div>
    </div>
  );
}
