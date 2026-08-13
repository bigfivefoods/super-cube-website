# Learn UX — dual-process model

Super-Cube Learn has **two distinct processes**. Navigation, Today, and sticky CTAs always label which process is active — never a single ambiguous priority list.

## The two processes

| Process | What it is | Primary destinations |
|--------|------------|----------------------|
| **Learning** | Course / programme pathway the learner selected | Learn (`/learn/courses`), Progress (`/learn/report`) |
| **Journaling** | Daily check-in loop: face pulse → micro-practice → reflection | Journal (`/learn/pulse`), Practice (`/learn/practice`) |

Hub destinations (outside either process):

- **Today** (`/learn`) — both processes at a glance  
- **You** (`/learn/account`) — profile & tools  

## Layout

```
┌──────────────────┬──────────────────────────┐
│  Super-Cube Learn│  Main content            │
│                  │                          │
│  TODAY           │  Screen / page 1         │
│  · Today         │  (fits neatly)           │
│                  │  ↓ scroll                │
│  LEARNING        │  Screen / page 2         │
│  · Learn         │  …                       │
│  · Progress      │                          │
│  [Pathway strip] │                          │
│                  │                          │
│  JOURNALING      │                          │
│  · Journal       │                          │
│  · Practice      │                          │
│                  │                          │
│  YOU             │                          │
│  · You           │                          │
│  [More tools…]   │                          │
└──────────────────┴──────────────────────────┘
```

- **Sidebar always on** (sticky desktop; horizontal chips on small screens)
- **Section headers** (`text-[0.65rem] uppercase tracking-wider text-muted`) separate Learning vs Journaling
- **Main column**: stacked `LearnScreen` blocks — each is roughly one viewport “page”
- Scroll down in main for the **next page** of information

## Bottom tabs (mobile)

Same five primaries: **Today · Learn · Journal · Progress · You**

- Learn / Progress: subtle blue process accent (construct blue `#26408C`)
- Journal: subtle teal accent (construct teal `#16979A`)
- Journal icon = notebook (distinct from Learn book and Progress chart)

## Today screens

1. **Status** — pathway strip + cube; thin “Suggested · Learning/Journal: …” line  
2. **Two process cards** (side-by-side on `md+`)  
   - **Learning** — current pathway step; CTA continues learning only (never pulse)  
   - **Journaling** — pulse done today? streak; CTA = check-in or practice  
3. **Destination map** — tiles labeled by process  

## Next-action helpers (`src/lib/lms/next-action.ts`)

- `getLearningAction(state)` — pathway / lesson / assessment / report only  
- `getJournalAction(state)` — pulse / practice / weekly review only  
- `getNextBestAction(state)` — thin wrapper for sticky coach / account; process field always set  
- `processLabel(process)` — `"Learning"` | `"Journal"` | `"Setup"` for prefixed CTAs  

## Sticky continue

Process-prefixed: e.g. `Learning · Continue` or `Journal · Check in`.  
When both processes are urgent, dual mini-CTAs. Hidden when nothing urgent.

## Journal wizard (pulse)

Day → Faces (one at a time) → Journal → Done  
Route remains `/learn/pulse` (minimal URL churn).

## Secondary links (More tools)

Grouped by process:

- **Learning:** Orientation, Baseline, Mid check-in, Post, Programme  
- **Journaling:** Micro-practice, Narrative + cube  
- **Account:** Cohort / coach code, Coach tools, Plans & pricing  

## Components

- `LearnShell` — dual-process sidebar + main  
- `LearnBottomNav` — 5 primaries with process-aware labels/icons  
- `LearnPage` / `LearnScreen` — neat scroll pages  
- `StickyContinue` — process-prefixed mobile CTA  
- `nav.ts` — `LEARN_PRIMARY_NAV`, secondary groups, accents  
