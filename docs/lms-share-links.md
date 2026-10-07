# Growth-report share links (LMS Phase 1 · Stage 3)

* **Server-backed.** `POST /api/lms/shares` creates a link for the signed-in learner. The URL carries a random 32-byte token (`/share/report/<43 chars>`). Only its SHA-256 hash is stored in `report_share_links`. Scores are read from `lms_attempts` when the link is opened, so **no scores or names are in the URL**.
* **Expiring and revocable.** Links last 7, 30 or 90 days (30 by default). `DELETE /api/lms/shares/:id` turns a link off; this can't be undone. Learners see their active and past links, view counts and expiry dates on **Progress → Share your growth** (also on Coach tools).
* **Limits.** 10 new links per hour and 20 active links per learner.
* **Children.** Under-18s need a parent or guardian's granted consent with the `progress_reports` scope to create a link. A link stops working if consent is withdrawn. The name is hidden by default and shows the first name only. A learner counts as a minor if their profile says so **or** a guardian consent was ever recorded for them.
* **Viewer page** (server-rendered, `noindex`, `Referrer-Policy: no-referrer`, `Cache-Control: private, no-store`) states: shared report, expired, turned off, not found, older format, unavailable.
* **Old links degrade gracefully.** The retired base64-JSON format is recognised and gets an "older format, ask for a new link" page. Its contents are never decoded for display.
* **Database:** `supabase/migrations/20261007140000_report_share_links.sql` (additive). Rollback is in `supabase/rollback/`.
* **Tests:** `tests/unit/share.spec.ts` and `e2e/lms-share.spec.ts` (local stack).
