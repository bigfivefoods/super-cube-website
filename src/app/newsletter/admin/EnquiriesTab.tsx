export type Enquiry = {
  id: string;
  created_at: string;
  intent: string;
  name: string;
  email: string;
  organisation: string | null;
  message: string;
  source: string | null;
  delivered: boolean;
  handled_at: string | null;
  handled_by: string | null;
};

const INTENT_LABELS: Record<string, string> = {
  "organisation-quote": "Organisation quote",
  "school-quote": "School quote",
  keynote: "Keynote",
  "keynote-enquiry": "Keynote",
  general: "Contact",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EnquiriesTab({
  rows,
  toggle,
}: {
  rows: Enquiry[];
  toggle: (form: FormData) => Promise<void>;
}) {
  const open = rows.filter((r) => !r.handled_at).length;
  return (
    <>
      <h2 className="mt-8 text-xl font-semibold tracking-tight text-ink">Enquiries</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-line bg-elevated px-4 py-3">
          <p className="text-2xl font-semibold tabular-nums text-ink">{open}</p>
          <p className="text-xs text-slate">Open</p>
        </div>
        <div className="rounded-xl border border-line bg-elevated px-4 py-3">
          <p className="text-2xl font-semibold tabular-nums text-ink">{rows.length - open}</p>
          <p className="text-xs text-slate">Handled</p>
        </div>
        {/* File download from an API route: a plain link is intended. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/enquiries/export?status=open"
          className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
        >
          Export open (CSV)
        </a>
        {/* File download from an API route: a plain link is intended. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/enquiries/export?status=all"
          className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
        >
          Export all (CSV)
        </a>
      </div>
      <p className="mt-3 text-xs text-muted">
        Quote, keynote and contact enquiries from the website, newest first. Reply from your own email.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-slate">No enquiries yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border p-4 ${r.handled_at ? "border-line bg-surface" : "border-line-strong bg-elevated"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {INTENT_LABELS[r.intent] ?? r.intent} · {fmt(r.created_at)}
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    {r.name}
                    {r.organisation ? <span className="font-normal text-slate"> · {r.organisation}</span> : null}
                  </p>
                  <a href={`mailto:${r.email}`} className="text-sm text-ink underline underline-offset-2">
                    {r.email}
                  </a>
                </div>
                <form action={toggle}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="handled" value={r.handled_at ? "1" : "0"} />
                  <button
                    type="submit"
                    className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${
                      r.handled_at ? "border border-line-strong text-ink" : "sc-btn-primary"
                    }`}
                  >
                    {r.handled_at ? "Reopen" : "Mark handled"}
                  </button>
                </form>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate">{r.message}</p>
              <p className="mt-2 text-xs text-muted">
                {r.source ?? "—"}
                {r.handled_at ? ` · Handled ${fmt(r.handled_at)}${r.handled_by ? ` by ${r.handled_by}` : ""}` : " · Open"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
