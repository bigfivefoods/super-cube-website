# Super-Cube® enhancement plan

## Phase 1 — Monetize (implemented in product code)

- [x] Paystack initialize / verify / webhook  
- [x] HMAC webhook signature  
- [x] Device unlock after verify (`activatePaidSubscription`)  
- [x] Idempotent cloud subscription activate  
- [x] Pricing checkout with email capture  
- [x] Soft paywall card when `DEMO_LMS_OPEN=false`  
- [x] ZAR default currency + USD option  
- [x] Receipt email via Resend when configured  
- [x] Docs: `docs/PAYSTACK.md`  

**Your ops:** add live/test keys on Vercel, set webhook, run test card, then set `NEXT_PUBLIC_DEMO_LMS_OPEN=false` when ready.

## Phase 2 — School pilots

- Seat packs (10/20/50) via Paystack metadata  
- Auto cohort code after pack purchase  
- Coach roster heat map + CSV  

## Phase 3 — Daily habit

- Check-in → practice handoff  
- Weekly email + reminders  

## Phase 4 — Trust & scale

- GA4 funnel, Search Console, case studies  
- Capacitor store, Sentry, e2e  
