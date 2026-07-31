# Super-Cube® — shipped product enhancements

This wave implements the roadmap items that can ship in code. Items that need third-party accounts remain **env-hooked**.

## Shipped in product

| Area | What |
|------|------|
| **Analytics funnel** | `src/lib/analytics.ts` + `AnalyticsProvider` — page + LMS events, local log, optional `NEXT_PUBLIC_GA_ID` |
| **Continue hero** | Learn dashboard primary CTA = resume/next session |
| **Win of the day** | After mark-complete, age-aware win line + continue |
| **Adaptive journal** | Reflection prompts by kids / adolescents / adults |
| **Streak reminders** | Opt-in browser notifications from dashboard |
| **Free demo** | `/learn/demo` unlocks full path on-device |
| **Share report** | Tokenized `/share/report/[token]` growth summary |
| **Certificate verify** | ID on PDF + `/verify/[id]` |
| **Coach tools** | `/learn/coach` generate share link |
| **Org cohort** | `/learn/org` join code |
| **Contact API** | `POST /api/contact` + form wiring; optional webhook |
| **Pricing** | Free demo + school/team pilot band |
| **Homepage proof** | Growth proof section + try free |
| **Video CDN** | `NEXT_PUBLIC_VIDEO_CDN` for course/session mp4s |
| **PWA offline** | Expanded SW precache (`supercube-learn-v2`) |
| **Error boundary** | Client catch + analytics `client_error` |

## Configure in Vercel (production)

```
NEXT_PUBLIC_SITE_URL=https://www.super-cube.me
NEXT_PUBLIC_DEMO_LMS_OPEN=true   # or false when only paid/demo unlock
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAYSTACK_SECRET_KEY=...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=...
NEXT_PUBLIC_GA_ID=G-XXXXXXXX    # optional
NEXT_PUBLIC_VIDEO_CDN=https://...  # optional CDN base for /videos/*
CONTACT_WEBHOOK=https://...     # optional Zapier/Make/email
```

## Ops still on you

1. Upload session mp4s to CDN if not in git; set `NEXT_PUBLIC_VIDEO_CDN`.
2. Run Supabase SQL (`SUPABASE_RUN_THIS_FULL.sql`) if not done.
3. Set Paystack live keys for real checkout.
4. Optional: Capacitor store builds (`docs/APP.md`).
5. Optional: Sentry snippet for `window.Sentry`.

## Funnel events to watch

`demo_start` → `orient_complete` → `pre_complete` → `lesson_complete` → `post_complete` → `report_view` → `certificate_download` / `report_share`
