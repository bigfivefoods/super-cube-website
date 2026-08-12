# Paystack — Phase 1 (single-learner unlock)

## Flow

1. Learner opens `/pricing`, picks programme, enters **email**
2. `POST /api/paystack/initialize` → Paystack authorization URL
3. Pay on Paystack (ZAR by default)
4. Redirect to `/learn/account?paid=1&programme=…&reference=…`
5. Client calls `POST /api/paystack/verify`
6. On success: **device unlock** (`activatePaidSubscription`) + optional Supabase subscription if auth user exists
7. Webhook `charge.success` repeats cloud activate (idempotent)

## Environment (Vercel)

| Variable | Required | Notes |
|----------|----------|--------|
| `PAYSTACK_SECRET_KEY` | Yes | `sk_test_…` then `sk_live_…` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Yes | `pk_test_…` / `pk_live_…` |
| `PAYSTACK_CURRENCY` | No | `ZAR` (default) or `USD` |
| `NEXT_PUBLIC_COURSE_PRICE_ZAR` | No | Default `99` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.super-cube.me` |
| `NEXT_PUBLIC_DEMO_LMS_OPEN` | Soft paywall | `true` = all free; `false` = need paid/demo unlock for full path |
| `RESEND_API_KEY` | No | Payment receipt emails |
| `PAYSTACK_SKIP_VERIFY` | Dev only | Skip webhook HMAC (never in production) |

## Paystack dashboard

- **Webhook URL:** `https://www.super-cube.me/api/paystack/webhook`
- Events: `charge.success`
- Callback URL is set per transaction (account page)

## Apple Pay domain verification

Paystack requires the Apple merchant domain association file to be publicly reachable so Apple Pay can be enabled for the site domain.

| Item | Value |
|------|--------|
| **URL** | `https://www.super-cube.me/.well-known/apple-developer-merchantid-domain-association` |
| **File** | `public/.well-known/apple-developer-merchantid-domain-association` (no extension) |
| **Content-Type** | `text/plain` (set in `next.config.ts` + `vercel.json`) |
| **Source** | Payload from Paystack (hex → UTF-8 JSON with `pspId`, `version`, `createdOn`, `signature`) |

### Checklist

1. After deploy, open the URL above — body should start with `{"pspId":…` and `Content-Type` should be `text/plain`.
2. In Paystack Dashboard → Settings → Apple Pay (or domain verification), verify/register `www.super-cube.me` (and apex if used).
3. Re-verify if you replace the association file or change the production domain.

This file is **public by design** (not a secret).

## Test checklist

1. Test keys on Vercel Preview or Production  
2. Pricing → Buy → complete test card  
3. Land on account with `reference` → see unlock + onboarding  
4. Repeat same reference → no double-charge / no crash  
5. Webhook delivers 200 in Paystack logs  
6. Set `NEXT_PUBLIC_DEMO_LMS_OPEN=false` and confirm free baseline still works, courses show paywall without pay  

## Files

- `src/lib/paystack.ts`
- `src/lib/lms/entitlements.ts`
- `src/lib/lms/activate-subscription-server.ts`
- `src/app/api/paystack/initialize|verify|webhook`
- `src/components/PaystackCheckout.tsx`
- `src/app/pricing/page.tsx`

## Phase 2 (not this sprint)

- Multi-seat packs + auto cohort codes  
- Subscriptions / monthly billing  
