"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useLocale } from "@/components/LocaleProvider";
import { constructs, facePosition, modelMenuLinks, type ConstructId } from "@/lib/content";
import { faceI18n, type I18nKey } from "@/lib/i18n";

const color = Object.fromEntries(constructs.map((c) => [c.id, c.color])) as Record<ConstructId, string>;

const positionKey: Record<"top" | "bottom" | "side", I18nKey> = {
  top: "model.top",
  bottom: "model.bottom",
  side: "model.side",
};

/**
 * Static isometric Super-Cube®: Choices on top, with Physical (left) and
 * Mental (front) facing the viewer, the same resting view as the 3D cube.
 */
export function MiniCube({ className = "", label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d="M60 8 106 34 60 60 14 34Z" fill={color.choices} />
      <path d="M14 34 60 60v52L14 86Z" fill={color.physical} />
      <path d="M60 60 106 34v52l-46 26Z" fill={color.mental} />
      <path d="M14 34 60 60v52L14 86Z" fill="#000" opacity="0.06" />
      <path d="M60 60 106 34v52l-46 26Z" fill="#000" opacity="0.16" />
      <path d="M60 8 106 34 60 60 14 34Z" fill="#fff" opacity="0.06" />
      <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" opacity="0.92">
        <path d="M60 8 106 34v52l-46 26-46-26V34Z" />
        <path d="M14 34 60 60l46-26M60 60v52" />
      </g>
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className={`rtl:-scale-x-100 ${className}`}>
      <path d="M3 8h9.5M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Every page in The Model menu is English-only: mark the links when reading another language. */
function useEnLang() {
  const { locale } = useLocale();
  return locale === "en" ? undefined : "en";
}

function useFaceLabels() {
  const { t } = useLocale();
  return constructs.map((c) => ({
    id: c.id,
    color: c.color,
    name: t(faceI18n[c.id] || "face.choices"),
    position: t(positionKey[facePosition[c.id]]),
    skills: t(`skills.${c.id}` as I18nKey),
  }));
}

/** Six faces: colour, cube position and the one-line skill list. */
function FaceList({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const faces = useFaceLabels();
  const hrefLang = useEnLang();
  return (
    <ul className={compact ? "grid gap-1" : "grid gap-0.5"}>
      {faces.map((f) => (
        <li key={f.id}>
          <Link
            href={`/constructs#${f.id}`}
            hrefLang={hrefLang}
            onClick={onNavigate}
            className={`model-face group grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3.5 rounded-xl transition-colors hover:bg-surface ${
              compact ? "-mx-2 px-2 py-2" : "px-3 py-2"
            }`}
          >
            <span
              className="h-8 w-8 rounded-[0.6rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.12)]"
              style={{ background: f.color }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="text-[0.875rem] font-semibold tracking-tight text-ink">{f.name}</span>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  {f.position}
                </span>
              </span>
              <span
                className={`block text-[0.8125rem] leading-snug text-slate ${compact ? "" : "truncate"}`}
                title={compact ? undefined : f.skills}
              >
                {f.skills}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Desktop "The Model" mega-menu: a disclosure button plus a full-width panel
 * under the header. Opens on hover (mouse), click/tap, Enter/Space or ArrowDown;
 * Esc closes and returns focus to the button; tabbing or clicking away closes.
 * The panel is absolutely positioned, so opening it never shifts the layout.
 */
export function ModelMegaMenu({
  open,
  onOpenChange,
  buttonClassName,
  active,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonClassName: string;
  active: boolean;
}) {
  const { t } = useLocale();
  const hrefLang = useEnLang();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const source = useRef<"hover" | "click" | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const close = useCallback(() => {
    source.current = null;
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== "Escape") return;
      const hadFocus = wrapRef.current?.contains(document.activeElement);
      close();
      if (hadFocus) buttonRef.current?.focus();
    }
    function onPointerDown(e: globalThis.PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  function onPointerEnter(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    if (!open) {
      source.current = "hover";
      onOpenChange(true);
    }
  }

  function onPointerLeave(e: PointerEvent) {
    if (e.pointerType !== "mouse" || source.current !== "hover") return;
    clearTimer();
    closeTimer.current = window.setTimeout(close, 180);
  }

  function onButtonClick() {
    clearTimer();
    if (open && source.current === "hover") {
      // Hover already opened it: a click pins it open instead of closing it.
      source.current = "click";
      return;
    }
    source.current = open ? null : "click";
    onOpenChange(!open);
  }

  function focusFirstLink() {
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus());
  }

  function onButtonKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      source.current = "click";
      onOpenChange(true);
      focusFirstLink();
    }
  }

  function onBlur(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (next && !wrapRef.current?.contains(next)) close();
  }

  const [overview, sixFaces, research, assessment] = modelMenuLinks;

  return (
    <div
      ref={wrapRef}
      className="flex h-full items-center"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        id="model-menu-button"
        aria-expanded={open}
        aria-controls="model-menu"
        onClick={onButtonClick}
        onKeyDown={onButtonKeyDown}
        className={`${buttonClassName} gap-1`}
        data-active={active ? "true" : undefined}
      >
        {t("nav.theModel")}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`-mr-0.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        ref={panelRef}
        id="model-menu"
        role="region"
        aria-labelledby="model-menu-button"
        hidden={!open}
        className="mega-panel absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_28px_56px_-32px_rgba(0,0,0,0.35)]"
      >
        <div className="container-site grid gap-8 py-7 lg:grid-cols-[16.5rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10">
          <div className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <MiniCube
              className="h-[4.75rem] w-[4.75rem] drop-shadow-[0_8px_14px_rgba(0,0,0,0.16)]"
              label={t("model.cubeAlt")}
            />
            <p className="mt-4 text-[0.9375rem] font-semibold leading-snug tracking-tight text-ink">
              {t("model.menuTitle")}
            </p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-slate">{t("model.menuBlurb")}</p>
            <ul className="mb-4 mt-3 divide-y divide-line border-t border-line">
              {[overview, research].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    hrefLang={hrefLang}
                    onClick={close}
                    className="group flex min-h-11 items-center justify-between text-[0.875rem] font-medium tracking-tight text-ink"
                  >
                    {t(l.i18n)}
                    <Arrow className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={assessment.href}
              hrefLang={hrefLang}
              onClick={close}
              className="sc-btn-primary mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[0.8125rem] font-semibold tracking-tight"
            >
              {t(assessment.i18n)}
              <Arrow />
            </Link>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4 px-3">
              <p className="eyebrow">{t("model.facesHeading")}</p>
              <Link
                href={sixFaces.href}
                hrefLang={hrefLang}
                onClick={close}
                className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold tracking-tight text-ink hover:underline hover:underline-offset-4"
              >
                {t(sixFaces.i18n)}
                <Arrow className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-2.5">
              <FaceList onNavigate={close} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile menu: "The Model" as an expandable section (same content, stacked). */
export function MobileModelSection({
  expanded,
  onToggle,
  onNavigate,
}: {
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { t } = useLocale();
  const hrefLang = useEnLang();
  // Research and the free baseline already have their own rows in the mobile
  // menu (main list and bottom CTA), so the section keeps to the model itself.
  const [overview, sixFaces] = modelMenuLinks;
  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="mobile-model"
        onClick={onToggle}
        className="flex min-h-14 w-full items-center justify-between text-start text-[1.375rem] font-semibold tracking-[-0.02em] text-ink"
      >
        <span className="flex items-center gap-3">
          <MiniCube className="h-7 w-7 shrink-0" />
          {t("nav.theModel")}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`opacity-40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div id="mobile-model" hidden={!expanded} className="pb-5">
        <p className="text-[0.875rem] leading-snug text-slate">{t("model.menuBlurb")}</p>
        <p className="eyebrow mt-4">{t("model.facesHeading")}</p>
        <div className="mt-2">
          <FaceList onNavigate={onNavigate} compact />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[overview, sixFaces].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              hrefLang={hrefLang}
              onClick={onNavigate}
              className="flex min-h-11 items-center justify-center rounded-full border border-line-strong px-3 text-center text-[0.8125rem] font-semibold leading-tight tracking-tight text-ink"
            >
              {t(l.i18n)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
