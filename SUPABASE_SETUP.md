# Wire real Supabase + Paystack ($6 course)

## Your project (already linked)

- Dashboard: https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid  
- URL: `https://scsgmmyjrulwoymegsid.supabase.co`  
- **anon key**: saved in `.env.local`  
- **service_role key**: still missing (optional for webhooks/admin; run SQL in dashboard instead)

## 1. Create tables (required — one paste)

1. Open **[SQL Editor](https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid/sql/new)**  
2. Open the file `supabase/SETUP_ALL.sql` in this repo (or `001_lms.sql` then `seed.sql`)  
3. **Paste all** → click **Run**  
4. You should see success (no red errors)

This creates programmes, plans ($6), courses tables, assessments, RLS, and profile trigger.

## 2. Auth URLs (required for login)

**[Authentication → URL configuration](https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid/auth/url-configuration)**

- **Site URL:** `http://localhost:3000`  
- **Redirect URLs** add:
  - `http://localhost:3000/auth/callback`
  - `https://www.super-cube.com/auth/callback`

### Easier local testing (optional)

**[Authentication → Providers → Email](https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid/auth/providers)**  
- Turn **on** “Confirm email” off for testing, **or** keep confirm on and use the confirmation email.

## 3. API keys (you already did anon)

**[Settings → API](https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid/settings/api)**

| On the page | Env var | Status |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | ✅ set |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ set |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` | ⬜ paste if you want server webhooks later |

## 3. Copy API keys

Supabase → **Project Settings → API**:

| Env var | Where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (**secret**, server only) |

## 4. Auth URLs

Supabase → **Authentication → URL configuration**:

- Site URL: `http://localhost:3000` (local) and later `https://www.super-cube.com`
- Redirect URLs add:
  - `http://localhost:3000/auth/callback`
  - `https://www.super-cube.com/auth/callback`

## 5. Paystack ($6 USD)

1. [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys & Webhooks  
2. Copy **Secret** + **Public** test keys  
3. Ensure your account can charge **USD** (or convert to ZAR if you prefer—tell me and we’ll switch)  
4. Webhook URL (production): `https://www.super-cube.com/api/paystack/webhook`  
   Events: `charge.success`

## 6. Local `.env.local`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_LMS_OPEN=false

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

Restart `npm run dev` after saving.

## 7. Paste keys here

Reply with (or add to `.env.local` yourself):

- Project URL  
- anon key  
- service_role key (only if you’re comfortable; or put it in Vercel env yourself)  
- Paystack secret + public keys  

Then I can verify the connection and finish webhook → subscription rows.

## Price

All three programmes are **$6 USD once** (600 cents) in code (`COURSE_PRICE_USD` in `src/lib/programmes.ts`).
