# Super-Cube® — world-class product layer

Track of learner + marketing upgrades that turn Super-Cube® into a category-defining leadership development system.

## Shipped (this wave)

| Capability | Path |
|------------|------|
| Outcome-first homepage | `/` — free baseline CTA, proof strip, buyer paths |
| Privacy & terms | `/privacy` · `/terms` |
| Guided 10-minute start | `/learn/start` |
| Post-baseline narrative + lit cube | `/learn/feedback` · SuperCube `scores` |
| Assessment save/resume + instrument note | `/learn/assessment/[phase]` |
| Micro-practices + streak | `/learn/practice` |
| I–Thou practice library | `/practices` |
| Facilitator 8-week kit | `/facilitator` |
| Coach heat map | `/learn/coach` |
| Insights content engine | `/insights` · `/insights/[slug]` |
| Media kit + citation | `/media` |
| Research open abstract | `/research` |
| Certification ladder | `/certify` |
| Community of practice | `/community` |
| Team / network cube | `/team` |
| Weekly email hook | `POST /api/email/weekly` |
| Book pilot | `/pricing#pilot` |
| SDG impact framing | `/impact` |
| Sample report composite (0–100) | `/sample-report` |
| SEO JSON-LD | Organization + Course on home |
| EN / isiZulu UI scaffold | Learn dashboard locale toggle |
| a11y: reduced motion + focus-visible | `globals.css` |
| Face tracking + patterns | `/learn/pulse` |
| First-pulse delight + PWA install | Learn shell + pulse |
| Cube-forming dashboard theatre | `/learn` · `CubeTheatre` |

## Tier 3 — visual system, performance, accessibility (Aug 2026)

| Item | Detail |
|------|--------|
| Self-hosted Inter | `next/font` in `layout.tsx` — no render-blocking Google CSS |
| Skip to main content | `.skip-link` → `#main-content` |
| Contrast tokens | `--slate` / `--muted` darkened for secondary text legibility |
| Escape closes menus | Header mobile + More menu |
| Security headers | `next.config.ts` + `vercel.json` (frame, nosniff, referrer, permissions) |
| Image formats | AVIF/WebP via Next image config + long-cache static assets |
| poweredByHeader | Disabled |

## Design principles

1. **Linear before flexible** — unlock freedom after mastery of the path  
2. **Measure before and after** — growth is the product, not content hours  
3. **Whole-person faces** — six constructs, never a single fad skill  
4. **Private by default** — journal and scores on-device until user shares  
5. **One model across life** — Kids → Adults, same cube, deeper context  
6. **Outcome-first marketing** — prove change, then explain the model  

## Still ops / partner-dependent

- Live Paystack, Resend, Sentry, GA, VIDEO_CDN keys  
- Orgs SQL in Supabase  
- Real caption files for every video (add VTT when ready)  
- Full isiZulu course content (scaffold only)  
- Capacitor store builds on Mac  
- SSO / seat billing when enterprise revenue justifies  
- Compress oversized hero JPG (`leadership-hero.jpg` ~2.6MB) in asset pipeline  

## Funnel events

`guided_start_open` → `pre_complete` → `micro_practice_complete` → `lesson_complete` → `post_complete` → `certificate_download` / `report_share` / `weekly_email_request` / `first_pulse_complete`
