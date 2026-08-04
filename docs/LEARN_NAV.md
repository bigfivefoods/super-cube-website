# Learn navigation (IA)

## Primary navigation (5 tabs)

| Tab | Route | Purpose |
|-----|--------|---------|
| **Today** | `/learn` | Multi-section hub (hero → journey → check-in → learn → progress) |
| **Learn** | `/learn/courses` | Courses / sessions |
| **Check-in** | `/learn/pulse` | Full daily check-in + patterns + peer |
| **Progress** | `/learn/report` | Growth report |
| **You** | `/learn/account` | Profile & tools |

## Today hub design

Vertical “pages” on one scroll, with sticky section chips:

1. **Start (hero)** — mood, cube, primary CTA  
2. **Journey** — step N of 6 strip (where you are)  
3. **Check-in** — week/month calendar, 3 sliders × 6 faces, free-text journal  
4. **Learn** — continue session, weekly plan, face courses  
5. **Progress** — sparkline + report links  

`LearnShell` uses `wide` mode on Today / Check-in (no competing side journey rail).

## Daily check-in instrument

- 3 key questions per construct (sliders 1–5)  
- Face score = mean of answered questions  
- Optional journal note  
- Calendar: week strip + full month  
- Stored in `facePulses` (`scores` + optional `questions`)

## Daily loop

1. **Today** → hero CTA  
2. **Check-in** (calendar day)  
3. **Learn** session or micro-practice  
4. **Progress** when curious about growth  

## Files

- `src/lib/lms/nav.ts`  
- `src/lib/lms/daily-checkin.ts`  
- `src/components/learn/DailyCheckInPanel.tsx`  
- `src/components/learn/LearnJourneyStrip.tsx`  
- `src/components/learn/LearnSectionNav.tsx`  
- `src/app/learn/page.tsx` · `pulse/page.tsx`  
