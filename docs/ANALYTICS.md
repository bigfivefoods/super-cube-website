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

Vercel Web Analytics is already on (`@vercel/analytics` in the root layout). Daily page-view totals feed the Investors Website Insights on bigfivegroup.africa. Private links are stripped first (`src/lib/vercel-analytics.ts`). This stays cookieless.

## First-party Website Insights

`WebsiteInsights` posts a visit batch to `POST /api/insights/collect` on this site. The server adds device, browser and operating system family, the visitor cookie (new versus returning, frequency, recency), and — only when `IPINFO_TOKEN` is set — coarse network location and an organisation label. The batch is then posted to the Big Five Group insights store at `https://bigfivegroup.africa/api/insights/collect`. That URL is fixed in code. The site tag on every batch is `super-cube.me`.

Set on Vercel (Production). Do not commit the values:

| Variable | Role |
| --- | --- |
| `INSIGHTS_INGEST_KEY` | Sent as the `x-insights-key` header. Already saved on the Vercel project. If it is missing, the browser beacon is accepted and dropped. The value is never written to the payload, a log line, or this repository. |
| `IPINFO_TOKEN` | Optional and server-side only. Without it, city, region, country, timezone, organisation, industry, size and network type are omitted. The raw IP is not written to the payload, the database, the cache or our logs. |

Do Not Track and `Sec-GPC: 1` record nothing and set no cookie. There is no cookie banner.

The forwarded body is `{ v: 1, site: "super-cube.me", e: [...] }` with at most 10 events. Each event has `k`, `p` and `id` (a UUID or 32 hex characters). Kinds are `pageview`, `engage`, `pdf`, `outbound` and `click` (a button click is stored as `click`). An `engage` event is kept only when time on the page is at least 500 ms or scroll depth is above 0. Email, the raw IP, GPS and form contents are not included. The batch is not tagged `bigfivegroup.africa`.
