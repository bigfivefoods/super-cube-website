import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Inline } from "@/lib/news/markdown";
import { NewsImage } from "./NewsImage";

function renderInline(nodes: Inline[], keyPrefix = ""): ReactNode {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}${i}`;
    if (n.t === "text") return <Fragment key={key}>{n.v}</Fragment>;
    if (n.t === "strong") return <strong key={key} className="font-semibold text-ink">{renderInline(n.c, `${key}-`)}</strong>;
    if (n.t === "em") return <em key={key}>{renderInline(n.c, `${key}-`)}</em>;
    const cls = "font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink";
    return n.href.startsWith("/") || n.href.startsWith("#") ? (
      <Link key={key} href={n.href} className={cls}>
        {renderInline(n.c, `${key}-`)}
      </Link>
    ) : (
      <a key={key} href={n.href} className={cls} rel="noopener noreferrer">
        {renderInline(n.c, `${key}-`)}
      </a>
    );
  });
}

/** Article body for a News post (markdown → semantic HTML, no raw HTML). */
export function NewsBody({ body }: { body: string }) {
  const blocks = parseMarkdown(body);
  return (
    <div className="news-body">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} className="heading-md mt-10 text-ink first:mt-0">
                {renderInline(b.c)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-8 text-lg font-semibold tracking-tight text-ink">
                {renderInline(b.c)}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="mt-5 border-l-2 border-line-strong pl-4 text-lg leading-relaxed text-ink">
                {renderInline(b.c)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="mt-5 space-y-2.5 pl-5 text-[1rem] leading-relaxed text-slate marker:text-muted sm:text-[1.0625rem] list-disc">
                {b.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "img":
            return (
              <figure key={i} className="my-8 overflow-hidden rounded-2xl border border-line bg-surface">
                <NewsImage
                  src={b.src}
                  alt={b.alt}
                  fill={false}
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="h-auto w-full"
                />
              </figure>
            );
          default:
            return (
              <p key={i} className="mt-5 text-[1rem] leading-[1.75] tracking-[-0.01em] text-slate first:mt-0 sm:text-[1.0625rem]">
                {renderInline(b.c)}
              </p>
            );
        }
      })}
    </div>
  );
}
