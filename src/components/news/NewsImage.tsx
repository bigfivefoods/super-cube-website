import Image from "next/image";

/**
 * Post images: files in /public go through next/image; uploaded covers (https, Supabase
 * Storage) render as a plain <img> so no remote-image config is needed.
 */
export function NewsImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  fill = true,
  width,
  height,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (src.startsWith("/")) {
    return fill ? (
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
    ) : (
      <Image src={src} alt={alt} width={width ?? 1600} height={height ?? 1000} sizes={sizes} priority={priority} className={className} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={`${fill ? "" : "h-auto w-full"} ${className}`}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined}
    />
  );
}
