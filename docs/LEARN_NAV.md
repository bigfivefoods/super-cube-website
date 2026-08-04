# Learn UX — page-by-page

## Principle

Clear-cut **pages**, not one infinite scroll. Each screen has:

1. Header (kicker · title · optional page steps)  
2. One job (card content)  
3. Primary / secondary actions at the bottom  

Shared components: `LearnPage`, `LearnPageHeader`, `LearnCard`, `LearnPageActions`, `LearnNavTile`.

## Bottom tabs (primary map)

| Tab | Route | Job |
|-----|--------|-----|
| **Today** | `/learn` | Status + next action + links to other pages |
| **Learn** | `/learn/courses` | Courses & sessions |
| **Check-in** | `/learn/pulse` | 4-step daily pulse wizard |
| **Progress** | `/learn/report` | Growth report |
| **You** | `/learn/account` | Profile & tools |

## Check-in wizard (page-by-page)

1. **Day** — week strip + calendar  
2. **Faces** — one construct at a time, 3 sliders each  
3. **Journal** — optional note + save  
4. **Done** — next pages (practice / learn / today)  

## Coherence rules

- Soft grey canvas `#f7f7f8`, white cards, ink CTAs  
- Max content width ~ `max-w-lg` / `max-w-xl`  
- No competing side journey rail except on **Courses** (session tree)  
- Sticky mobile CTA only when not already on a focused flow  
