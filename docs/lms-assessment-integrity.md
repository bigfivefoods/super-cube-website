# Assessment integrity (LMS Phase 1 · Stage 2)

## What changed
| Area | Behaviour |
| --- | --- |
| Signed-out baselines | A baseline taken before signing in is kept on the device and **claimed** by the account on first sign-in (`POST /api/lms/attempts/claim`). First one wins: if the account already has a baseline, it stays and the device copy is replaced by it. The server re-scores the answers and keeps the original completion time (clamped to the last 180 days) so the day-21 gate stays honest. This closes the "take it anonymously, sign up, retake" loophole. |
| Item order | Statements are shuffled **within each face** with a per-attempt seed (`mulberry32`). Faces keep their order. The seed is saved with drafts so resuming shows the same order. |
| Attention check | One instructed item ("choose 4 · Agree") is placed on a seed-chosen face, never first. It is stored, never scored. |
| Quality flags | `lms_attempts.flags`: `attention_failed`, `attention_missing`, `straight_lining` (≥90 % identical answers, n ≥ 6), `too_fast` (< 1.5 s per statement). Attempts are **never rejected** for flags; learners who give nearly identical answers get a gentle "take another look" prompt they can dismiss. |
| Item-level storage | `lms_item_responses`: one immutable row per answer (attempt, face, value 1–5, position shown). Learners can read their own rows (RLS); only the server writes. Existing attempts are backfilled. |
| Reliability | `/admin?tab=assessment` shows Cronbach's alpha per face and overall, per programme and phase, from unflagged attempts. Labelled **Provisional** below 50 usable attempts. |

## Tests
* `npm run test:unit` – alpha (checked against a hand calculation), shuffle, attention placement, flags, reliability.
* `e2e/lms-assessment.spec.ts` (local stack only) – signed-out baseline → sign in → claimed once with flags and item rows → page locked → API refuses a second baseline.

## Notes
* The legacy `assessment_attempts` / `assessment_responses` tables from `001_lms.sql` are unused by the app; `lms_item_responses` belongs to the live `lms_attempts`.
* Rollback: `supabase/rollback/20261007120000_assessment_integrity.down.sql`.
