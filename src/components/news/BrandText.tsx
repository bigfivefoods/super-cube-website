import { Fragment } from "react";

/** Keeps "Super-Cube®" on one line in headings (no break at the hyphen); the text is unchanged. */
export function BrandText({ text }: { text: string }) {
  const parts = text.split(/(Super-Cube®)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "Super-Cube®" ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
