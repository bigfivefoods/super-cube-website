# Learn navigation (IA)

## Problem we fixed

Learners saw **three competing systems**:

1. Site header (marketing)
2. Journey rail (Choose → Orient → Baseline → Learn → Re-measure → Report)
3. Bottom tabs (Home / Courses / Assess / Report / You)

Daily habits (**pulse / check-in**, **micro-practice**) were buried under “Home” cards and “Face tracking” labels. “Assess” mixed orientation, baseline, mid, and post.

## Model (current)

### Primary navigation (5 tabs — mobile bottom + desktop side)

| Tab | Route | Purpose |
|-----|--------|---------|
| **Today** | `/learn` | Next best action, daily check-in + practice status, weekly plan |
| **Learn** | `/learn/courses` | Six-face courses and sessions only |
| **Check-in** | `/learn/pulse` | Daily face pulse (habit loop) |
| **Progress** | `/learn/report` | Scores, growth report, assessments context |
| **You** | `/learn/account` | Profile, reminders, cohort, export |

### Secondary (under “More tools”)

Micro-practice, narrative, mid/post assessments, programme, cohort, coach, pricing.

### Pathway (not primary nav)

Formal programme steps stay as a **compact progress strip** (sidebar) and full timeline on Today. They answer “where am I in the programme?” — not “what do I open every day?”

## Daily loop (target behaviour)

1. Open **Today**
2. Do **Next best action** (or sticky CTA on mobile)
3. **Check-in** if not done (30–60s)
4. **Micro-practice** (3–5 min) when nudged
5. **Learn** only when the pathway step is courses

## Further improvements (recommended next)

1. **Onboarding coach marks** once: “These 5 tabs are all you need”
2. **Deep-link mid/post** only when journey status unlocks them (grey secondary until then)
3. **Merge practice into Check-in** as a second step after save (“Practice now”)
4. **Hide site marketing header** inside Learn PWA / Capacitor (already partially via `.site-chrome`)
5. **Coach-only routes** (`/learn/coach`) never appear in primary nav
6. **Analytics**: funnel `today_open` → `pulse_save` → `practice_complete` → `lesson_complete`

## Files

- `src/lib/lms/nav.ts` — single source of truth for primary/secondary links
- `src/components/learn/LearnBottomNav.tsx`
- `src/components/learn/LearnShell.tsx`
- `src/components/learn/StickyContinue.tsx` — uses `getNextBestAction`
- `src/app/learn/page.tsx` — Today hub
- `src/app/learn/pulse/page.tsx` — “Daily check-in” copy
