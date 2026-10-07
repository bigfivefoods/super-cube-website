# Accessibility (WCAG 2.2 AA)

What is covered, and how it is tested.

## Automated checks

`e2e/a11y.spec.ts` runs axe-core (tags wcag2a, wcag2aa, wcag21a, wcag21aa,
wcag22aa) on the public home, pricing and login pages and every main Learn
page, at 1280×900 and 390×844, with a seeded learner. The suite fails on any
violation. It needs no Supabase stack:

```bash
BASE_URL=http://localhost:3000 npx playwright test e2e/a11y.spec.ts
AXE_DUMP=/tmp/axe.jsonl …   # also write every violating node to a file
```

## Contrast

- `src/lib/contrast.ts`: `inkFor(colour, bg)` keeps a face colour's hue but
  darkens it (or lightens it on dark backgrounds) until small text reaches 4.5:1.
  `faceInkStyle()` plus the `.face-ink` class give light- and dark-theme shades.
  `textOn(bg)` picks black or white text for coloured chips.
- `.learn-meta` is #595959 in the light theme (5.7:1 even on the pale face tints).
- Labels on dark cards use `text-white/65` (≈8:1) instead of /40 and /45.

### Known exception: the 3D cube

The Super-Cube faces keep white text on every face (Craig's rule, PR 11), with a
dark text shadow. The WCAG formula ignores the shadow, so the orange (Mental)
and teal (Physical) faces measure below 4.5:1. The cube has `role="img"`, an
`aria-label`, and repeats its skills (and scores, when shown) as screen-reader
text, so nothing is lost to assistive tech. The axe run excludes `.cube-face`.
Making the faces fully AA would need a design decision: dark text on the light
faces, or darker face colours.

## Keyboard and screen readers

- "Skip to main content" is the first Tab stop on every page (`#main-content`).
  Inside Learn, a second "Skip to page content" link passes the sidebar
  (`#learn-content`).
- Assessments: each statement shows "Strongly disagree" and "Strongly agree"
  under the 1–5 scale. Each button is named, e.g. "4, Agree", and is
  `aria-pressed`. Pressing keys 1–5 answers the statement that has focus.
- Focus is visible on every link and button (global `:focus-visible` ring).
- Reduced motion: the cube's auto-spin and every CSS animation stop under
  `prefers-reduced-motion: reduce`.
