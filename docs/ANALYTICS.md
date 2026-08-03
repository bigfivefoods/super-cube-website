# Site visit analytics

## Google Analytics 4 (recommended)

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com/)
2. Add a **Web** data stream for `https://www.super-cube.me`
3. Copy **Measurement ID** (`G-XXXXXXXX`)
4. Vercel → **super-cube-website** → Settings → Environment Variables  
   - `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXX` (Production)
5. **Redeploy** production
6. Open GA → **Reports → Realtime** after visiting the site once

### Conversion events to mark as key events in GA4

| Event | Meaning |
|-------|---------|
| `demo_start` | Free demo unlocked |
| `guided_start_open` | 10-minute guided start |
| `orient_complete` | Orientation done |
| `pre_complete` | Baseline assessment |
| `lesson_complete` | Session completed |
| `mid_complete` | Mid-pathway check-in |
| `post_complete` | Post assessment |
| `report_view` | Growth report |
| `certificate_download` | Certificate PDF |
| `contact_submit` | Contact form |
| `pilot_click` | Book a pilot CTA |

In GA4: **Admin → Events → mark as key event**.

## Local funnel debug (this browser only)

Open www.super-cube.me → DevTools → Application → Local Storage → `supercube_analytics_v1`

Or open **`/learn/account`** → Funnel snapshot (if signed in / local state present).

Or open **`/insights` is public**; product debug: **`/learn/analytics`** shows local counts.

## Vercel Analytics

Optional: Vercel project → **Analytics** tab (plan-dependent). Separate from GA4.
