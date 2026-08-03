# Super-Cube® — go live checklist

## 1. Supabase (required for sync + coach)

1. SQL Editor → run **`SUPABASE_RUN_THIS_FULL.sql`** (if not already).
2. SQL Editor → run **`SUPABASE_RUN_THIS_ORGS_COACH.sql`** (orgs, roster, certificates).
3. Confirm: `npm run supabase:verify` and `npm run supabase:orgs`.
4. Auth → URL config:
   - Site URL: `https://www.super-cube.me`
   - Redirect: `https://www.super-cube.me/auth/callback`

## 2. Vercel environment variables

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.super-cube.me` |
| `NEXT_PUBLIC_DEMO_LMS_OPEN` | `true` (or `false` when only paid) |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (server only) |
| `PAYSTACK_SECRET_KEY` | `sk_live_…` or `sk_test_…` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_…` or `pk_test_…` |
| `NEXT_PUBLIC_VIDEO_CDN` | after upload (see §3) |
| `NEXT_PUBLIC_GA_ID` | optional `G-…` — see `docs/ANALYTICS.md` |
| `NEXT_PUBLIC_FOUNDER_VIDEO_URL` | optional YouTube/Vimeo **embed** URL |
| `NEXT_PUBLIC_PILOT_CALENDAR_URL` | optional Cal.com / Calendly booking link |
| `CONTACT_WEBHOOK` | optional Zapier/Make URL |
| `RESEND_API_KEY` | optional Resend for welcome emails |
| `EMAIL_FROM` | e.g. `Super-Cube Learn <onboarding@yourdomain>` |
| `NEXT_PUBLIC_SENTRY_DSN` | optional browser Sentry |

Redeploy after saving env.

### Paystack dashboard

- Webhook: `https://www.super-cube.me/api/paystack/webhook`
- Callback uses `/learn/account?paid=1&programme=…` + `reference`

## 3. Session videos → Supabase Storage CDN

Local sessions are ~1.8GB and **not** in git. Upload:

```bash
# Courses only (~250MB) — done when bucket exists
npm run videos:upload:courses

# All sessions (long — 1.8GB+)
npm run videos:upload
```

Then set on Vercel:

```
NEXT_PUBLIC_VIDEO_CDN=https://scsgmmyjrulwoymegsid.supabase.co/storage/v1/object/public/videos
```

App paths: `/videos/courses/...` locally → CDN maps to `{CDN}/courses/...` (bucket is named `videos`).

## 4. Capacitor native apps

```bash
npm run cap:add:ios      # macOS + Xcode
npm run cap:add:android
export CAPACITOR_SERVER_URL=https://www.super-cube.me
npx cap sync
npx cap open ios
npx cap open android
```

Optional push:

```bash
npm run cap:add:push
```

See `docs/APP.md`.

## 5. Smoke test production

1. `/learn/demo` → onboarding → orientation  
2. Complete one session → win of the day  
3. Pre assessment → weakest-face weekly plan on `/learn`  
4. Report → share link + certificate download  
5. `/verify/SC-…` · `/sample-report` · `/impact`  
6. Pricing → Paystack (with keys) or demo  
7. Sign in → `/learn/org` DEMO2026 → `/learn/coach` (create org + CSV export)  
8. Consent checkbox on Learn dashboard before coach progress push  

```bash
npm run test:e2e:install
BASE_URL=https://www.super-cube.me npm run test:e2e:prod
```

See also `docs/PRIORITIES.md` and `docs/STORE.md`.

## Local env note

`.env.local` may still have empty Paystack placeholders and `SITE_URL=http://localhost:3000`.  
Production must use **www.super-cube.me** and real `sk_` / `pk_` keys in **Vercel**, not only Codespace.
