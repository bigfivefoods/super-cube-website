Super-Cube® — SQL for Supabase (read this)
==========================================

Files in THIS folder (same place as ENV_FOR_VERCEL.txt):

1) SUPABASE_RUN_THIS_FULL.sql
   → Use this first. Creates profiles + full LMS + cloud sync.
   → Safe to re-run if a previous attempt failed.

2) SUPABASE_RUN_THIS_LEARNER_STATE_ONLY.sql
   → Only profiles + learner_state (cloud sync).
   → Use if FULL already succeeded and you only need sync.

3) SUPABASE_SEED_OPTIONAL.sql
   → Optional. App works without it.

How to run
----------
1. Open SUPABASE_RUN_THIS_FULL.sql in the explorer
2. Select ALL (Ctrl/Cmd+A) → Copy
3. Supabase → SQL Editor → New query
   https://supabase.com/dashboard/project/scsgmmyjrulwoymegsid/sql/new
4. Paste → click Run
5. You should see "Success" with no red errors

If you still see errors, paste the exact error message back.

Why you saw "profiles does not exist"
-------------------------------------
The short "learner state only" script tried to add a policy on
profiles before that table existed. Files are fixed now:
FULL creates profiles first; LEARNER_STATE_ONLY also creates profiles.
