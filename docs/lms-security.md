# Security hardening (LMS Phase 1 · stage 8)

## Content-Security-Policy

Built in `src/lib/csp.ts`, sent on every page by `next.config.ts`.

- `CSP_MODE` is read **at build time**: `report-only` (default) or `enforce`.
- Violations are POSTed to `/api/csp-report` and logged as `[csp] {…}` lines in
  the Vercel runtime logs (query strings stripped, nothing stored).
- Allowed hosts: this site; the Supabase project (https + wss); Google
  Analytics/Tag Manager; Sentry CDN and ingest; Vercel Live (previews);
  YouTube/Vimeo frames; `NEXT_PUBLIC_VIDEO_CDN` and
  `NEXT_PUBLIC_FOUNDER_VIDEO_URL` origins when set. Forms may post only here
  and to `checkout.paystack.com`; the Paystack redirect itself is a normal
  navigation.
- Still allowed: `'unsafe-inline'` scripts and styles. Next.js inlines its bootstrap
  on static pages, and removing it needs per-request nonces (dynamic rendering).
- To add a new third-party host, add it in `buildCsp` and extend
  `tests/unit/security.spec.ts`.

## RPC helpers (`20261007180000_security_hardening.sql`)

- `is_org_admin|member|staff`, `is_team_manager|member` moved to schema
  `private`. Their RLS policies keep working (policies bind by OID), but they
  are no longer callable at `/rest/v1/rpc/*`. Execute: `authenticated` and `service_role`
  only. `search_path = public, pg_temp`.
- `handle_new_user` search_path pinned the same way; trigger functions are no
  longer executable by `anon` or `authenticated`.
- Rollback: `supabase/rollback/20261007180000_security_hardening.down.sql`.

## Rate limits

`src/lib/server/rate-limit.ts`. These are fixed windows, counted in Postgres
(`lms_rate_hit`, service role only, keys SHA-256 hashed) with a per-instance memory
fallback. If the limiter itself fails, requests are allowed through.

| Bucket | Limit | Keyed by |
| --- | --- | --- |
| admin sign-in (newsletter/admin console) | 5 / 15 min | IP and email |
| auth callback | 30 / 10 min | IP |
| checkout initialise | 20 / 10 min | IP |
| contact, newsletter | 5, 10 / 10 min | IP |
| org join, guardian consent, account delete | 10/10 min, 10/h, 5/h | account |
| assessment attempts, claim | 30, 10 / 10 min | account |
| habit events | 120 / 10 min | account (plus 200/day cap) |
| share links create / view | 20/h per account, 60/10 min per IP |
| CSP reports | 60 / 10 min | IP |

Signed-in routes count per account, not IP, because a whole class can share
one school IP. Learner sign-in and sign-up go straight to Supabase Auth, whose
own rate limits apply (Dashboard → Auth → Rate limits).

The `rate_limit_hits` table only grows (one row per key per window). Nothing
prunes it yet, because pruning is a delete and needs Craig's go-ahead. A weekly
`delete from rate_limit_hits where window_start < now() - interval '1 day'`
is safe.

## Auth callback

`/auth/callback?next=` accepts only same-site paths (`/x`, never `//host`,
`/\host` or `@host`). Anything else falls back to `/learn`.

## CI

The `e2e` job in `.github/workflows/ci.yml` builds with `CSP_MODE=enforce` and a
placeholder (unreachable) Supabase URL, then runs every Playwright spec that
doesn't need the Supabase stack: smoke, the localStorage learner journey,
checkout up to the stubbed Paystack redirect, axe WCAG 2.2 AA, CSP, access rules
and rate limits.
