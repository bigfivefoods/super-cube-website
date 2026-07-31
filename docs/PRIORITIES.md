# Seven priorities — implementation status

| # | Priority | Status |
|---|----------|--------|
| 1 | Keys live (Paystack, Vercel env, orgs SQL, CDN) | **Code + CDN ready** · You paste Paystack keys + run orgs SQL |
| 2 | Onboarding email after demo/purchase | **Shipped** `/learn/onboarding` + `/api/email/welcome` |
| 3 | Weakest-face weekly plan | **Shipped** Learn dashboard card |
| 4 | Coach admin create org, CSV, consent | **Shipped** create + export + consent toggle |
| 5 | Sample report + case study | **Shipped** `/sample-report` + `/impact` |
| 6 | Sentry + smoke tests | **Shipped** `SentryInit` + Playwright `e2e/smoke.spec.ts` |
| 7 | Store apps | **Shipped docs/scripts** `docs/STORE.md` (build on Mac) |

## Commands

```bash
# Orgs tables
# → paste SUPABASE_RUN_THIS_ORGS_COACH.sql in Supabase

npm run supabase:orgs
npm run videos:upload:courses   # already done once
npm run test:e2e:install
npm run build && npm run start
npm run test:e2e
BASE_URL=https://www.super-cube.me npm run test:e2e:prod
```
