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

`WebsiteInsights` posts a visit batch to `POST /api/insights/collect` on this site. The server adds device, browser and operating system family, the visitor cookie (new versus returning, frequency, recency), and — only when `IPINFO_TOKEN` is set — coarse network location and an organisation label. A signed-in session email is included only on that forwarded batch. The batch is then sent to the existing insights store.

Set on Vercel (Production), and do not commit either value:

| Variable | Role |
| --- | --- |
| `WEBSITE_INSIGHTS_INGEST_URL` | **Still required.** HTTPS URL of the insights collect endpoint the investor-portal report already reads. Events are not stored until this is set. It must not be this site’s own `/api/insights/collect` (that would loop). |
| `WEBSITE_INSIGHTS_INGEST_SECRET` | Optional. Sent as `Authorization: Bearer` when the store expects one. |
| `IPINFO_TOKEN` | Optional. Without it, city, region, country, timezone, organisation, industry, size and network type are omitted. The token must not be committed. The raw IP is not written to the payload, the database, the cache or our logs. |

Do Not Track and `Sec-GPC: 1` record nothing and set no cookie. There is no cookie banner.

The forwarded body is `{ v: 1, site: "super-cube", host: "www.super-cube.me", e: [...] }` using the same event keys as bigfivegroup.africa (`k`, `p`, `a`, `r`, `u`, `l`, `ms`) plus the metadata fields (`screen`, `scroll`, `landing`, `exit`, `pages`, `organisation`, `returning`, and the rest listed on `/privacy`).
