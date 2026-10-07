# LMS admin console (`/admin`)

Phase 1 · Stage 1. Lets Super-Cube run pilots without Paystack.

**Who can open it:** the existing admin role only: a Super-Cube account whose email is on
`NEWSLETTER_ADMIN_EMAILS` (default craig@bigfivegroup.africa), signed in through the admin
form (signed, httpOnly, 12-hour cookie). Learners, coaches and organisation admins never
qualify. Every server action re-checks the session before it reads or writes.

| Tab | What it does |
|---|---|
| Overview | Accounts, seats used, minors waiting for consent, open enquiries, and "where learners are" (pathway stage counts) |
| Learners | One row per account with its stage (no baseline, no seat, learning, waiting for day 21, after-test open/done, certified), sessions, cohort and inactivity. Never shows answers, scores or journals; minors' emails are masked |
| Cohorts & seats | Create a cohort (company, school, open cohort, network) with a join code and link; add seats by invoice, EFT or complimentary grant (reference required for invoice/EFT); revoke a grant; pause/reopen a cohort |
| Invites | Coach / org-admin invite links (shown once, SHA-256 stored, optional email lock, expiry, max uses); revoke |
| Consents | Under-18 accounts waiting for guardian consent, and every consent record (method, wording version, status). Guardian emails masked |
| Certificates | Revoke with a reason (public `/verify/[id]` then shows "revoked"); reinstate |
| Audit log | Append-only log of every admin change (trigger blocks update/delete) |
| Enquiries | Same as `/newsletter/admin` |

## Data

Migration `supabase/migrations/20261007100000_lms_admin_console.sql` (additive; rollback in
`supabase/rollback/`):

* `admin_audit_log`: append-only, RLS on, no client access.
* `org_seat_grants`: one row per grant; `organisations.seat_limit` remains the number the
  entitlement check reads. `admin_grant_seats()` / `admin_revoke_seat_grant()` update the
  limit, the grant and the audit log in one transaction and are executable by `service_role` only.
* `certificates.revoked_at`, `certificates.revoked_reason`.

## Tests

`e2e/lms-admin.spec.ts` runs against a local Supabase-compatible stack (`LMS_STACK=1`): a
learner can't sign in to the console; an admin creates a cohort with invoiced seats, adds
complimentary seats, issues a coach invite, sees the audit trail, sees consent gaps without
journal text, and revokes/reinstates a certificate (checked on `/verify`).
