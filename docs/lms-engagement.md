# LMS engagement (Phase 1 · stage 5)

**Migration:** `20261007160000_engagement.sql`, applied as `lms_p1_engagement`. It is additive; the rollback is in `supabase/rollback/`.

## Streaks and streak freezes

These live on the server, in `practice_streaks` and `learning_events` from migration 008.

**What counts towards a streak**
- a check-in (pulse) for today
- a micro-practice
- the first completion of a session
- an assessment

**How an event is recorded**
- `lms_record_activity()` does the work in one transaction: it appends the event and moves the streak.
- The day is the learner's local day. The server works it out from `practice_streaks.timezone` (default Africa/Johannesburg), so the browser can't backdate activity.
- Only the service role can execute the function, and its `search_path` is fixed.

**Freezes**
- Every 7 days in a row earns a freeze. A learner can hold at most 2.
- A freeze covers one missed day automatically, and the event's `meta` records that it was used.
- An event for a day that is already counted leaves the streak unchanged.

**Routes**
- `POST /api/lms/events` takes `pulse` or `practice_complete` only. Sessions and assessments are recorded by their own routes. The limit is 200 events per 24 hours.
- `GET /api/lms/engagement` returns the streak, freezes, badges and push status.

## Badges

- The catalogue rows are in `badges`. Awards go into `learner_badges` with a public `SCB-…` id.
- The server awards badges after any recorded activity, and also when a device baseline is claimed.
- The criteria are in `src/lib/lms/badges.ts` and are unit-tested.
- Learners can only read their own badges.

## Web Push (stubbed behind a flag)

- The opt-in UI, the `push_subscriptions` table (no client access), `POST`/`DELETE /api/lms/push` and the service-worker `push`/`notificationclick` handlers are all in place.
- **Push is off** until the following are set through the Vercel env flow:
  - `NEXT_PUBLIC_LMS_PUSH=1`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - for sending, a server-only `VAPID_PRIVATE_KEY` plus a sender job, which is not built yet
- While push is off, the API answers 501 and the You page says push is coming soon.
- Under-18s need a granted guardian consent with the `learning` scope. `notification_prefs.guardian_approved` records that.

## Day-21 calendar invite

`src/lib/lms/ics.ts` builds an RFC 5545 invite:
- 09:00–09:30 SAST on the day the after-test opens (`POST_MIN_DAYS` after the baseline)
- a reminder 12 hours before

The invite is offered on the You page and on the "after-test not open yet" screen. It is generated on the device, so no data leaves the browser.
