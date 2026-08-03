/**
 * Optional founder / model explainer embed.
 * Set NEXT_PUBLIC_FOUNDER_VIDEO_URL to a YouTube/Vimeo embed URL.
 */
export function FounderVideo({
  className = "",
  title = "Meet Super-Cube® (2–3 min)",
}: {
  className?: string;
  title?: string;
}) {
  const url = process.env.NEXT_PUBLIC_FOUNDER_VIDEO_URL?.trim();
  if (!url) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-black/[0.12] bg-[#fafafa] p-6 text-center ${className}`}
      >
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Video
        </p>
        <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs text-muted">
          Set <code className="text-[0.65rem]">NEXT_PUBLIC_FOUNDER_VIDEO_URL</code>{" "}
          to your YouTube/Vimeo embed URL (e.g.{" "}
          <code className="text-[0.65rem]">
            https://www.youtube.com/embed/…
          </code>
          ).
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-black/[0.08] bg-black shadow-sm ${className}`}
    >
      <div className="relative aspect-video w-full">
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <p className="bg-white px-3 py-2 text-center text-xs font-medium text-muted">
        {title}
      </p>
    </div>
  );
}
