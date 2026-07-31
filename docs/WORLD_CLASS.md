# Super-Cube® Learn — world-class product layer

This note tracks the **learner-experience** upgrades that turn the LMS from a content library into a deliberate leadership practice system.

## Shipped (product)

| Capability | Why it matters |
|------------|----------------|
| **6-step linear pathway** | Reduces drop-off; always clear next action |
| **Pre → post growth report + dual radar** | Evidence of change, not activity theatre |
| **PDF growth report + certificate** | Shareable outcomes for HR, coaches, self |
| **Session video + VO** | Multimodal entry into each session |
| **Session reflection journal** | Reflection is the transfer mechanism |
| **Practice streak + resume** | Habit formation; reduce re-orientation cost |
| **Progress backup / restore** | Trust and multi-device before full cloud |
| **PWA + Capacitor path** | App-like distribution without dual codebases |

## Shipped — cloud sync

| Piece | Path |
|--------|------|
| SQL table + RLS | `supabase/migrations/002_learner_state.sql` |
| Merge + pull/push | `src/lib/lms/sync.ts` |
| Auto sync on Learn | `LmsSyncProvider` in `learn/layout.tsx` |
| Debounced push | `saveLmsState` → `scheduleCloudPush` |
| Account controls | Sync now / sign-in status |

**Ops:** run `002_learner_state.sql` in Supabase if the table is missing.

## Recommended next (engineering / ops)

1. ~~**Supabase progress sync**~~ ✅  
2. **Coach / org dashboards** — cohort progress (with consent)  
3. **Push notifications** — Capacitor Push + web push for streaks  
4. **Offline lesson packs** — IndexedDB snapshot of curriculum text  
5. **Accessibility audit** — WCAG on assessments and video controls  
6. **Analytics** — funnel: orient → pre → first lesson → 50% → post  

## Design principles we keep

1. **Linear before flexible** — unlock freedom after mastery of the path  
2. **Measure before and after** — growth is the product, not content hours  
3. **Whole-person faces** — six constructs, never a single fad skill  
4. **Private by default** — journal and scores on-device until user shares  
5. **One model across life** — Kids → Adults, same cube, deeper context  
