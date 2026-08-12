# Phase 2 — Seat packs & cohorts

## Buy flow

1. `/pricing#pilot` → choose 10 / 20 / 50 seats  
2. Enter school/company name + coach email  
3. Paystack payment (`product_type: seat_pack`)  
4. Verify creates **organisation** + **cohort code**  
5. Redirect to `/learn/coach?code=…&pack=1`  

## Requirements

- Coach must **sign up / sign in** with the **same email** used at checkout (so admin membership attaches).  
- Supabase orgs SQL: run `SUPABASE_RUN_THIS_ORGS_COACH.sql` + optional `006_seat_packs.sql` (`seat_limit`).  
- Paystack keys + webhook (same as Phase 1).

## Learner join

1. Learn → Org  
2. Enter cohort code  
3. Enable “share progress with coach” on dashboard if they want scores on roster  

## Pricing

Volume discount on list seat price (ZAR/USD from env/programmes):

| Pack | Discount |
|------|----------|
| 10 seats | 10% |
| 20 seats | 15% |
| 50 seats | 20% |

## Files

- `src/lib/seat-packs.ts`  
- `src/lib/org/create-from-payment.ts`  
- `src/components/SeatPackCheckout.tsx`  
- Paystack initialize / verify / webhook  
- `supabase/migrations/006_seat_packs.sql`  
