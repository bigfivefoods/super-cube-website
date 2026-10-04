# LMS Phase 0: "safe and honest" (preview)

Status: draft PR, preview only. Nothing here has been applied to production
Supabase, production env vars or the production deployment.

## What changed

1. **Database security**: `supabase/migrations/007_phase0_security.sql` (idempotent).
   - Fixes the recursive `org_members` policy with SECURITY DEFINER helpers.
   - Organisations, members, snapshots, certificates, shares and subscriptions are
     no longer readable or writable by anonymous or unrelated users.
   - Coaches/admins join only with a hashed, expiring invite from an org admin (`org_invites`).
   - New tables: `lms_attempts` (immutable, one pre and one post per programme),
     `lms_lesson_completions`, `guardian_consents`, `data_deletion_log`.
   - Test: `supabase/tests/rls_phase0.sql` (run with psql against a dev database).
2. **Server-side scoring and writes**: `/api/lms/status`, `/api/lms/attempts`,
   `/api/lms/progress`, `/api/certificates/issue`, `/api/org/invites`,
   `/api/consent/guardian`, `/api/account/delete`. `/api/certificates/register` POST now returns 410.
3. **Payments**: verify and webhook share `src/lib/lms/server/paystack-fulfil.ts`.
   Product, programme and seats come only from Paystack metadata; amount and
   currency must match the server price list; the buyer's user id is bound at initialize.
   "Try free" no longer creates an active subscription: it unlocks two sample sessions only.
4. **Honest measurement**: baseline locked (no retake), after-test needs
   `NEXT_PUBLIC_LMS_POST_MIN_DAYS` (default 21) days, at least
   `NEXT_PUBLIC_LMS_POST_MIN_SESSION_SHARE` (default 0.5) of sessions and one per face.
   Report shows change bands (real / possible / noise) using a provisional reliable-change index.
5. **Certificates**: issued and verified by the server; fake IDs show "not found"; PDF arrow glyph fixed.
6. **Media**: session intro videos hidden until produced (`NEXT_PUBLIC_SESSION_VIDEOS=true` to re-enable);
   the mismatched shared sample captions were removed.
7. **Privacy**: guardian consent for under-18s (`/learn/consent`, draft wording
   `guardian-2026-10-draft-1`) and "Delete my data" on the You page.

## Before production

- Apply 007 to production Supabase (after review) and run the RLS test against a branch first.
- Fix the misnamed production env vars (see PR description).
- Set Paystack keys and confirm prices.
- Approve consent wording and method.
