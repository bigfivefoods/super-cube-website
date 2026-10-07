import Link from "next/link";
import { campaignContentHash } from "@/lib/newsletter/campaign";
import {
  activeSubscriberCount,
  campaignPost,
  fieldsOf,
  getCampaign,
  listCampaigns,
  sendCounts,
} from "@/lib/newsletter/campaigns-db";
import { listPublishedNews } from "@/lib/news/store";
import { createCampaignAction } from "./campaign-actions";
import { CampaignContinueForm, CampaignEditForm, CampaignSendForm, CampaignTestForm } from "./CampaignForms";

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" });
}

const linkCls = "font-semibold text-ink underline underline-offset-2";
const card = "rounded-2xl border border-line bg-elevated p-5";
const STATUS = { draft: "Draft", sending: "Sending", sent: "Sent" } as const;
const DONE: Record<string, string> = {
  saved: "Saved. Send yourself a new test of this version before sending.",
  tested: "Test sent. Check your inbox (and spam) before sending to subscribers.",
  sending: "Sending has started.",
  sent: "All emails for this campaign have been sent.",
};

/** Admin › Campaigns: email a published post to confirmed subscribers. */
export async function CampaignsTab({ id, done, adminEmail }: { id?: string; done?: string; adminEmail: string }) {
  if (id) {
    const c = await getCampaign(id);
    if (!c) {
      return (
        <p className="mt-8 text-slate" role="alert">
          That campaign wasn’t found. <Link href="/newsletter/admin?tab=campaigns" className={linkCls}>All campaigns</Link>
        </p>
      );
    }
    const [post, count, counts] = await Promise.all([campaignPost(c), activeSubscriberCount(), sendCounts(c.id)]);
    const testedCurrent = Boolean(post && c.test_sent_at && c.test_content_hash === campaignContentHash(post, fieldsOf(c)));
    const total = count ?? 0;
    const reason = !post
      ? "The post isn’t published any more."
      : !testedCurrent
        ? "Send yourself a test of this version first."
        : total === 0
          ? "There are no confirmed subscribers yet."
          : undefined;
    const preview = `/api/newsletter/admin/campaign-preview?id=${c.id}`;
    return (
      <div className="mt-8">
        <p className="text-sm"><Link href="/newsletter/admin?tab=campaigns" className={linkCls}>← All campaigns</Link></p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">{c.subject}</h2>
        <p className="mt-1 text-sm text-slate">
          {STATUS[c.status]} · Post:{" "}
          {post ? <Link href={`/news/${post.slug}`} className={linkCls} target="_blank">{post.title}</Link> : c.post_slug}
        </p>
        {done && DONE[done] && (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900" role="status">{DONE[done]}</p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-ink">Preview</h3>
              <p className="flex gap-4 text-sm">
                <a href={preview} target="_blank" rel="noopener" className={linkCls}>Open in a new tab</a>
                <a href={`${preview}&format=text`} target="_blank" rel="noopener" className={linkCls}>Plain text</a>
              </p>
            </div>
            <iframe src={preview} title="Email preview" className="mt-3 h-[52rem] w-full rounded-2xl border border-line bg-white" sandbox="" />
          </div>

          <div className="space-y-5">
            {c.status === "draft" && (
              <div className={card}>
                <h3 className="text-base font-semibold text-ink">1. Write</h3>
                <div className="mt-3">
                  <CampaignEditForm id={c.id} subject={c.subject} preheader={c.preheader} intro={c.intro} />
                </div>
              </div>
            )}
            {c.status === "draft" && post && (
              <div className={card}>
                <h3 className="text-base font-semibold text-ink">2. Test</h3>
                <p className="mt-1 text-sm text-slate">
                  {c.test_sent_at
                    ? `Last test: ${fmt(c.test_sent_at)} to ${c.test_sent_to}${testedCurrent ? "" : " (an older version)"}.`
                    : "No test sent yet."}
                </p>
                <div className="mt-3"><CampaignTestForm id={c.id} adminEmail={adminEmail} /></div>
              </div>
            )}
            {c.status === "draft" && (
              <div className={`${card} border-red-200`}>
                <h3 className="text-base font-semibold text-ink">3. Send</h3>
                <p className="mt-1 mb-3 text-sm text-slate">
                  Goes to confirmed subscribers only ({count === null ? "count unavailable" : total}), each with their own unsubscribe link and one-click unsubscribe header. Nobody gets it twice.
                </p>
                <CampaignSendForm id={c.id} count={total} ready={!reason} reason={reason} />
              </div>
            )}
            {c.status !== "draft" && (
              <div className={card}>
                <h3 className="text-base font-semibold text-ink">Delivery</h3>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-slate">Recipients</dt><dd className="text-ink tabular-nums">{c.recipients_total}</dd>
                  <dt className="text-slate">Sent</dt><dd className="text-ink tabular-nums">{counts.sent}</dd>
                  <dt className="text-slate">Waiting</dt><dd className="text-ink tabular-nums">{counts.pending}</dd>
                  <dt className="text-slate">Failed</dt><dd className="text-ink tabular-nums">{counts.failed}</dd>
                  <dt className="text-slate">Skipped (unsubscribed)</dt><dd className="text-ink tabular-nums">{counts.skipped}</dd>
                  {counts.sending > 0 && (<><dt className="text-slate">Interrupted, not resent</dt><dd className="text-ink tabular-nums">{counts.sending}</dd></>)}
                </dl>
                <p className="mt-3 text-xs text-muted">
                  Confirmed by {c.send_confirmed_by ?? "—"} at {fmt(c.send_confirmed_at)}{c.completed_at ? ` · finished ${fmt(c.completed_at)}` : ""}.
                </p>
                {c.status === "sending" && counts.pending > 0 && (
                  <div className="mt-4"><CampaignContinueForm id={c.id} remaining={counts.pending} /></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [{ rows, error }, posts] = await Promise.all([listCampaigns(), listPublishedNews()]);
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">Campaigns</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate">
        Email a published post to confirmed subscribers: start a campaign from a post, adjust the subject, preview it, send yourself a test, then confirm the send. Nothing is ever sent automatically.
      </p>
      {error && <p className="mt-4 rounded-xl border border-line bg-elevated p-4 text-sm text-ink" role="alert">{error}</p>}

      <h3 className="mt-6 text-base font-semibold text-ink">Start from a post</h3>
      <ul role="list" className="mt-3 divide-y divide-line rounded-xl border border-line">
        {posts.map((p) => (
          <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0 text-sm text-ink">{p.title}</span>
            <form action={createCampaignAction}>
              <input type="hidden" name="slug" value={p.slug} />
              <button type="submit" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">
                New campaign<span className="sr-only">: {p.title}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-base font-semibold text-ink">All campaigns</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate">No campaigns yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-3 py-2">Subject</th>
                <th scope="col" className="px-3 py-2">Status</th>
                <th scope="col" className="px-3 py-2">Sent</th>
                <th scope="col" className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-3 py-2"><Link href={`/newsletter/admin?tab=campaigns&id=${r.id}`} className={linkCls}>{r.subject}</Link></td>
                  <td className="px-3 py-2 text-slate">{STATUS[r.status]}</td>
                  <td className="px-3 py-2 text-slate tabular-nums">{r.status === "draft" ? "—" : `${r.sent_count} / ${r.recipients_total}`}</td>
                  <td className="px-3 py-2 text-slate">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
