"use client";

import { useActionState, useState } from "react";
import {
  continueCampaignAction,
  saveCampaignAction,
  sendCampaignAction,
  sendCampaignTestAction,
  type CampaignState,
} from "./campaign-actions";

const inputCls = "mt-1 block min-h-11 w-full rounded-xl border border-line-strong bg-elevated px-3 text-sm text-ink";
const primary = "sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-60";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink disabled:opacity-60";

function Err({ state }: { state: CampaignState }) {
  return state?.error ? (
    <p className="mt-3 text-sm font-medium text-red-700" role="alert">{state.error}</p>
  ) : null;
}

export function CampaignEditForm({ id, subject, preheader, intro }: { id: string; subject: string; preheader: string; intro: string }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(saveCampaignAction, undefined);
  const [s, setS] = useState(subject);
  const [p, setP] = useState(preheader);
  const [i, setI] = useState(intro);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="c-subject" className="text-sm font-medium text-ink">Subject line</label>
        <input id="c-subject" name="subject" value={s} onChange={(e) => setS(e.target.value)} maxLength={150} className={inputCls} />
      </div>
      <div>
        <label htmlFor="c-preheader" className="text-sm font-medium text-ink">Preview line</label>
        <input id="c-preheader" name="preheader" value={p} onChange={(e) => setP(e.target.value)} maxLength={200} className={inputCls} aria-describedby="c-preheader-hint" />
        <p id="c-preheader-hint" className="mt-1 text-xs text-muted">The grey text inboxes show after the subject. Defaults to the post summary.</p>
      </div>
      <div>
        <label htmlFor="c-intro" className="text-sm font-medium text-ink">Personal note (optional)</label>
        <textarea id="c-intro" name="intro" value={i} onChange={(e) => setI(e.target.value)} rows={4} maxLength={1200} className={`${inputCls} py-2`} aria-describedby="c-intro-hint" />
        <p id="c-intro-hint" className="mt-1 text-xs text-muted">Shown under the headline instead of the post summary. Plain text.</p>
      </div>
      <button type="submit" disabled={pending} className={secondary}>{pending ? "Saving…" : "Save"}</button>
      <Err state={state} />
    </form>
  );
}

export function CampaignTestForm({ id, adminEmail }: { id: string; adminEmail: string }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(sendCampaignTestAction, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className={primary}>{pending ? "Sending test…" : `Send a test to ${adminEmail}`}</button>
      <p className="mt-2 text-xs text-muted">Tests only ever go to your own admin address, marked [Test].</p>
      <Err state={state} />
    </form>
  );
}

export function CampaignSendForm({ id, count, ready, reason }: { id: string; count: number; ready: boolean; reason?: string }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(sendCampaignAction, undefined);
  const [typed, setTyped] = useState("");
  const [ticked, setTicked] = useState(false);
  const armed = ready && ticked && typed.replace(/\s/g, "") === String(count);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      {!ready && reason && <p className="text-sm text-slate">{reason}</p>}
      <div className="flex items-start gap-2">
        <input id="c-confirm" name="confirm" value="yes" type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} disabled={!ready} className="mt-1 size-5" />
        <label htmlFor="c-confirm" className="text-sm text-ink">
          I’ve checked the test email. Send this campaign to {count} confirmed {count === 1 ? "subscriber" : "subscribers"} now. This can’t be undone.
        </label>
      </div>
      <div>
        <label htmlFor="c-typed" className="text-sm font-medium text-ink">Type {count} to confirm</label>
        <input id="c-typed" name="typed" inputMode="numeric" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!ready} className={`${inputCls} max-w-40`} />
      </div>
      <button type="submit" disabled={!armed || pending} className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? "Sending…" : `Send to ${count} ${count === 1 ? "subscriber" : "subscribers"}`}
      </button>
      <Err state={state} />
    </form>
  );
}

export function CampaignContinueForm({ id, remaining }: { id: string; remaining: number }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(continueCampaignAction, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className={primary}>{pending ? "Sending…" : `Continue sending (${remaining} left)`}</button>
      <p className="mt-2 text-xs text-muted">Sends the next batch. Anyone who already got this email is skipped.</p>
      <Err state={state} />
    </form>
  );
}
