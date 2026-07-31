import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "default" | "white";
  showWordmark?: boolean;
  className?: string;
  size?: number;
};

/**
 * Site logo mark. Files:
 * - public/brand/logo.png (preferred)
 * - public/brand/logo-mark.svg (fallback placeholder)
 */
export function BrandLogo({
  variant = "default",
  showWordmark = true,
  className = "",
  size = 32,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Super-Cube® home"
    >
      <Image
        src="/brand/logo.png"
        alt="Super-Cube®"
        width={size}
        height={size}
        className="h-8 w-8 object-contain"
        priority
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

/** Full logo image (wordmark graphic) */
export function BrandWordmark({
  className = "",
  height = 32,
}: {
  className?: string;
  height?: number;
}) {
  const width = Math.round(height * 3.2);

  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Super-Cube® home"
    >
      <Image
        src="/brand/logo.png"
        alt="Super-Cube®"
        width={width}
        height={height}
        className="h-8 w-auto max-w-[160px] object-contain object-left"
        style={{ height }}
        priority
      />
    </Link>
  );
}
