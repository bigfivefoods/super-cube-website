# Coach cohort impact (Phase 1 · stage 6)

The coach page (`/learn/coach?code=…`) shows a **Cohort impact** card. It is built from consented progress snapshots (`org_progress_snapshots`), which learners push only when they opt in to share with their coach. Journals are never included.

## Before and after, by face (`src/lib/lms/cohort-stats.ts`)

- Each face uses paired learners only, meaning learners who have both a baseline and a re-measure. Scores are on a 0–100 scale.
- **95% confidence intervals** are shown for the before mean, the after mean and the mean change, using Student's t (df = n − 1).
- **Cohen's d** is reported as d_av: the mean change divided by the average of the before and after SDs. It is labelled negligible (< 0.2), small, medium (0.5) or large (0.8).
- Any face or overall row with fewer than **3** paired learners is suppressed, so no individual can be identified.

## Completion funnel and check-ins

- **Funnel steps:** joined → sharing progress → baseline → started sessions → halfway → re-measured → certified. Learners only; coaches are not counted.
- **Check-in flags** apply only to learners who share progress. A learner is flagged for any of these:
  - no baseline 7 or more days after joining
  - quiet for 14 or more days
  - under 25% of sessions after 3 or more weeks
  - an overall score down 5 or more points
- The card words these as prompts for a supportive conversation.

## Exports

- **CSV:** aggregate only, with no names. Cells are protected against formula injection.
- **ROI pack (PDF):** aggregate only. It includes the headline effect, the per-face table with CIs and d, the funnel, the number of flagged learners, and the method and its caveats (self-report, no control group, reliability still being established).
- The per-learner research CSV (`/api/org/export`) is unchanged.
