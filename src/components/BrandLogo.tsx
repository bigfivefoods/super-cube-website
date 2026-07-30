import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  /** Use white logo mark on dark backgrounds */
  variant?: "default" | "white";
  /** Show wordmark text next to mark (if only using logo-mark) */
  showWordmark?: boolean;
  className?: string;
  /** Height of the logo mark in pixels */
  size?: number;
};

/**
 * Site logo. Replace files under public/brand/ to update branding:
 * - logo.svg / logo-white.svg  — full wordmark
 * - logo-mark.svg              — icon only
 */
export function BrandLogo({
  variant = "default",
  showWordmark = false,
  className = "",
  size = 28,
}: BrandLogoProps) {
  const src =
    variant === "white" ? "/brand/logo-white.svg" : "/brand/logo-mark.svg";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Super-Cube® home"
    >
      <Image
        src={src}
        alt="Super-Cube®"
        width={size}
        height={size}
        className="h-7 w-7 object-contain"
        priority
        unoptimized
      />
      {showWordmark && (
        <span
          className={`text-[0.95rem] font-semibold tracking-tight ${
            variant === "white" ? "text-white" : "text-ink"
          }`}
        >
          Super-Cube
          <span className={variant === "white" ? "text-white/50" : "text-muted"}>
            ®
          </span>
        </span>
      )}
    </Link>
  );
}

/** Full wordmark logo (replaces public/brand/logo.svg) */
export function BrandWordmark({
  variant = "default",
  className = "",
  height = 28,
}: {
  variant?: "default" | "white";
  className?: string;
  height?: number;
}) {
  const src = variant === "white" ? "/brand/logo-white.svg" : "/brand/logo.svg";
  // Wordmark is ~200×40 aspect in placeholder
  const width = Math.round((height / 40) * 200);

  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Super-Cube® home"
    >
      <Image
        src={src}
        alt="Super-Cube®"
        width={width}
        height={height}
        className="h-7 w-auto object-contain object-left"
        style={{ height }}
        priority
        unoptimized
      />
    </Link>
  );
}
