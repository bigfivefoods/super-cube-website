"use client";

import { useLocale } from "@/components/LocaleProvider";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

const MODE_LABEL_KEY: Record<
  ThemeMode,
  "theme.light" | "theme.dark" | "theme.system"
> = {
  light: "theme.light",
  dark: "theme.dark",
  system: "theme.system",
};

export function ThemeToggle({
  overDark = false,
  className = "",
}: {
  overDark?: boolean;
  className?: string;
}) {
  const { theme, cycleTheme } = useTheme();
  const { t } = useLocale();

  const modeLabel = t(MODE_LABEL_KEY[theme]);
  const aria = `${t("theme.toggle")}: ${modeLabel}`;

  const surface = overDark
    ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
    : "border-line-strong bg-elevated/80 text-ink hover:bg-black/[0.04] dark:border-white/15 dark:bg-elevated dark:hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition touch-manipulation ${surface} ${className}`}
      aria-label={aria}
      title={aria}
    >
      {theme === "light" && <SunIcon />}
      {theme === "dark" && <MoonIcon />}
      {theme === "system" && <SystemIcon />}
    </button>
  );
}
