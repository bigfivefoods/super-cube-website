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

/**
 * Site logo in the header.
 * - Default: full colour wordmark graphic
 * - onDark: cube keeps natural colours; “Super-Cube®” is white text
 *   (avoids invert filter that washes the cube to pure white)
 */
export function BrandWordmark({
  className = "",
  height = 32,
  onDark = false,
}: {
  className?: string;
  height?: number;
  /** Dark hero / inverted chrome — keep cube colours, white wordmark text */
  onDark?: boolean;
}) {
  const width = Math.round(height * 3.2);
  const mark = Math.round(height * 1.05);

  if (onDark) {
    return (
      <Link
        href="/"
        className={`inline-flex min-w-0 items-center gap-2 ${className}`}
        aria-label="Super-Cube® home"
      >
        {/* Crop left of wordmark asset → cube mark, full colour (no invert) */}
        <span
          className="relative shrink-0 overflow-hidden"
          style={{ width: mark, height: mark }}
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={width}
            height={height}
            className="absolute left-0 top-0 h-full w-auto max-w-none object-cover object-left"
            style={{ height: mark }}
            priority
          />
        </span>
        <span
          className="truncate text-[0.9rem] font-semibold tracking-tight text-white sm:text-[0.95rem]"
          style={{ lineHeight: 1.1 }}
        >
          Super-Cube
          <span className="text-white/55">®</span>
        </span>
      </Link>
    );
  }

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
