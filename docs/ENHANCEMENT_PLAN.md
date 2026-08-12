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

## Phase 2 — School pilots (implemented in product code)

- [x] Seat packs (10/20/50) via Paystack metadata  
- [x] Auto cohort code after pack purchase  
- [x] Coach roster + CSV export + consent UX  
- [x] Docs: `docs/SEAT_PACKS.md` + migration `006_seat_packs.sql`  

**Your ops:** run org SQL + `006_seat_packs.sql`; coach signs in with checkout email before/after pay.

## Phase 3 — Daily habit

- Check-in → practice handoff  
- Weekly email + reminders  

## Phase 4 — Trust & scale

- GA4 funnel, Search Console, case studies  
- Capacitor store, Sentry, e2e  
