import type { Metadata } from "next";
import Link from "next/link";
import { requireLmsAdmin } from "@/lib/admin/auth";
import {
  loadAudit,
  loadCertificates,
  loadCohorts,
  loadConsents,
  loadLearners,
  maskEmail,
  nowMs,
  type Cohort,
} from "@/lib/admin/data";
import { STAGES, type LearnerRow } from "@/lib/admin/learners";
import { loadReliability } from "@/lib/admin/reliability";
import { alphaBand, QUALITY_FLAG_LABELS, RELIABILITY_MIN_N, type QualityFlag } from "@/lib/lms/integrity";
import { formatDateTimeZA, formatDateZA } from "@/lib/datetime";
import { getProgramme } from "@/lib/programmes";
import { SignInForm } from "@/app/newsletter/admin/SignInForm";
import { signOutAction, toggleHandledAction } from "@/app/newsletter/admin/actions";
import { EnquiriesTab, type Enquiry } from "@/app/newsletter/admin/EnquiriesTab";
import { reinstateCertificateAction, revokeInviteAction, revokeSeatGrantAction, setCohortActiveAction } from "./actions";
import { CopyField, CreateCohortForm, GrantSeatsForm, InviteForm, RevokeCertificateForm } from "./forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Super-Cube® admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "learners", label: "Learners" },
  { id: "cohorts", label: "Cohorts & seats" },
  { id: "invites", label: "Invites" },
  { id: "consents", label: "Consents" },
  { id: "certificates", label: "Certificates" },
  { id: "assessment", label: "Assessment quality" },
  { id: "audit", label: "Audit log" },
  { id: "enquiries", label: "Enquiries" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const card = "rounded-2xl border border-line bg-elevated p-4 sm:p-5";
const h2 = "text-lg font-semibold tracking-tight text-ink";
const th = "px-3 py-2.5 font-semibold";
const td = "px-3 py-2.5 align-top";
const SEAT_KIND: Record<string, string> = { comped: "Complimentary", invoiced: "Invoice", eft: "EFT", paystack: "Paystack", other: "Other" };

function programmeName(id: string | null) {
  return (id && getProgramme(id)?.name) || "—";
}

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      Couldn’t load everything: {error}
    </p>
  );
}

function Stat({ value, label, href }: { value: number | string; label: string; href?: string }) {
  const inner = (
    <>
      <p className="text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-slate">{label}</p>
    </>
  );
  return href ? (
    <Link href={href} className={`${card} block transition-colors hover:border-line-strong`}>{inner}</Link>
  ) : (
    <div className={card}>{inner}</div>
  );
}

function StagePill({ row }: { row: LearnerRow }) {
  const stage = STAGES.find((s) => s.id === row.stage)!;
  const warn = row.stage === "needs_consent" || row.stage === "no_seat";
  return (
    <span
      title={stage.hint}
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        warn ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100" : row.stage === "certified" ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" : "bg-surface text-ink ring-1 ring-line-strong"
      }`}
    >
      {stage.label}
    </span>
  );
}

function stageDetail(r: LearnerRow) {
  switch (r.stage) {
    case "learning":
      return `${r.completions} of ${r.sessionsRequired} sessions needed`;
    case "waiting_day21":
      return `Opens ${formatDateZA(r.postOpensOn)}`;
    case "no_seat":
      return "Grant a cohort seat or wait for payment";
    case "needs_consent":
      return "Guardian must complete consent";
    default:
      return "";
  }
}

async function Overview({ db }: { db: Parameters<typeof loadLearners>[0] }) {
  const [{ learners, error }, { cohorts }, { consents }, enq] = await Promise.all([
    loadLearners(db),
    loadCohorts(db),
    loadConsents(db),
    db.from("enquiries").select("id", { count: "exact", head: true }).is("handled_at", null),
  ]);
  const by = (id: string) => learners.filter((l) => l.stage === id).length;
  const inactive = learners.filter((l) => (l.inactiveDays ?? 0) >= 7 && l.stage !== "certified").length;
  const seatsTotal = cohorts.reduce((n, c) => n + (c.active ? c.seat_limit ?? 0 : 0), 0);
  const seatsUsed = cohorts.reduce((n, c) => n + (c.active ? c.learners : 0), 0);
  const consentGaps = by("needs_consent");
  return (
    <>
      <ErrorNote error={error} />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={learners.length} label="Learner accounts" href="/admin?tab=learners" />
        <Stat value={`${seatsUsed} / ${seatsTotal}`} label="Seats used (active cohorts)" href="/admin?tab=cohorts" />
        <Stat value={consentGaps} label="Minors waiting for consent" href="/admin?tab=consents" />
        <Stat value={enq.count ?? 0} label="Open enquiries" href="/admin?tab=enquiries" />
      </div>
      <section className={`${card} mt-6`} aria-labelledby="funnel-h">
        <h2 id="funnel-h" className={h2}>Where learners are</h2>
        <p className="mt-1 text-sm text-slate">From server records only. {inactive} learner{inactive === 1 ? "" : "s"} inactive for 7+ days.</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s) => (
            <li key={s.id}>
              <Link href={`/admin?tab=learners&stage=${s.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 hover:border-line-strong">
                <span className="text-sm text-ink">{s.label}</span>
                <span className="text-base font-semibold tabular-nums text-ink">{by(s.id)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <section className={`${card} mt-6`} aria-labelledby="qs-h">
        <h2 id="qs-h" className={h2}>Run a pilot without Paystack</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate">
          <li><Link className="font-semibold text-ink underline underline-offset-2" href="/admin?tab=cohorts">Create a cohort</Link> with invoiced, EFT or complimentary seats.</li>
          <li>Send learners the cohort link (they sign in, then join with the code).</li>
          <li><Link className="font-semibold text-ink underline underline-offset-2" href="/admin?tab=invites">Invite the client’s coach</Link> so they see consented progress.</li>
          <li>Watch <Link className="font-semibold text-ink underline underline-offset-2" href="/admin?tab=consents">consents</Link> for under-18s before they start.</li>
        </ol>
        <p className="mt-3 text-xs text-muted">{consents.length} consent record{consents.length === 1 ? "" : "s"} on file.</p>
      </section>
    </>
  );
}

async function Learners({ db, stage }: { db: Parameters<typeof loadLearners>[0]; stage?: string }) {
  const { learners, error } = await loadLearners(db);
  const rows = stage ? learners.filter((l) => l.stage === stage) : learners;
  const active = STAGES.find((s) => s.id === stage);
  return (
    <section className="mt-6" aria-labelledby="learners-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="learners-h" className={h2}>
          Learners{active ? `: ${active.label}` : ""} <span className="font-normal text-slate">({rows.length})</span>
        </h2>
        {active && <Link href="/admin?tab=learners" className="text-sm font-semibold text-ink underline underline-offset-2">Show all</Link>}
      </div>
      <p className="mt-1 text-sm text-slate">Accounts only (signed-out learners keep data on their own device). Scores, answers and journals are never shown here.</p>
      <ErrorNote error={error} />
      {rows.length === 0 ? (
        <p className={`${card} mt-4 text-sm text-slate`}>No learners {active ? "at this stage" : "yet"}.</p>
      ) : (
        <>
        {/* Phones: one card per learner */}
        <ul className="mt-4 space-y-3 md:hidden" aria-label="Learners">
          {rows.map((r) => (
            <li key={r.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{r.fullName || "Unnamed learner"}{r.minor && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[0.7rem] font-semibold text-slate ring-1 ring-line">Under 18</span>}</p>
                  <p className="truncate text-xs text-slate">{r.minor ? maskEmail(r.email) : r.email ?? "—"}</p>
                </div>
                <StagePill row={r} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-slate">Programme</dt><dd className="text-ink">{programmeName(r.programmeId)}</dd>
                <dt className="text-slate">Sessions</dt><dd className="tabular-nums text-ink">{r.completions} / {r.sessionsTotal}</dd>
                <dt className="text-slate">Cohort</dt><dd className="text-ink">{r.cohorts.join(", ") || "—"}</dd>
                <dt className="text-slate">Last active</dt>
                <dd className="text-ink">
                  {formatDateZA(r.lastActivityAt || r.createdAt)}
                  {(r.inactiveDays ?? 0) >= 7 && r.stage !== "certified" && <span className="block font-semibold text-amber-800 dark:text-amber-200">{r.inactiveDays} days inactive</span>}
                </dd>
              </dl>
              {stageDetail(r) && <p className="mt-2 text-xs text-slate">{stageDetail(r)}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-line bg-elevated md:block">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">Learners and their pathway stage</caption>
            <thead className="bg-surface text-xs uppercase tracking-wide text-slate">
              <tr>
                <th scope="col" className={th}>Learner</th>
                <th scope="col" className={th}>Programme</th>
                <th scope="col" className={th}>Stage</th>
                <th scope="col" className={th}>Sessions</th>
                <th scope="col" className={th}>Cohort</th>
                <th scope="col" className={th}>Last active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className={td}>
                    <p className="font-medium text-ink">{r.fullName || "Unnamed learner"}{r.minor && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[0.7rem] font-semibold text-slate ring-1 ring-line">Under 18</span>}</p>
                    <p className="text-xs text-slate">{r.minor ? maskEmail(r.email) : r.email ?? "—"} · joined {formatDateZA(r.createdAt)}</p>
                  </td>
                  <td className={`${td} text-slate`}>{programmeName(r.programmeId)}</td>
                  <td className={td}>
                    <StagePill row={r} />
                    {stageDetail(r) && <p className="mt-1 text-xs text-slate">{stageDetail(r)}</p>}
                  </td>
                  <td className={`${td} tabular-nums text-slate`}>{r.completions} / {r.sessionsTotal}</td>
                  <td className={`${td} text-slate`}>{r.cohorts.join(", ") || "—"}</td>
                  <td className={`${td} text-slate`}>
                    {formatDateZA(r.lastActivityAt || r.createdAt)}
                    {(r.inactiveDays ?? 0) >= 7 && r.stage !== "certified" && <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{r.inactiveDays} days inactive</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
  );
}

function CohortCard({ c, grants, siteLink }: { c: Cohort; grants: Awaited<ReturnType<typeof loadCohorts>>["grants"]; siteLink: string }) {
  const mine = grants.filter((g) => g.org_id === c.id);
  const limit = c.seat_limit ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((c.learners / limit) * 100)) : 0;
  return (
    <li className={card} data-testid={`cohort-${c.code}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">{c.name}</h3>
          <p className="mt-0.5 text-sm text-slate">
            Code <span className="font-mono font-semibold text-ink">{c.code}</span> · {c.kind} · created {formatDateZA(c.created_at)}
            {!c.active && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100">Paused</span>}
          </p>
        </div>
        <form action={setCohortActiveAction}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="active" value={c.active ? "0" : "1"} />
          <button type="submit" className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">
            {c.active ? "Pause cohort" : "Reopen cohort"}
          </button>
        </form>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink"><strong className="tabular-nums">{c.learners}</strong> of <strong className="tabular-nums">{limit}</strong> seats used</span>
          <span className="text-slate">{c.staff} staff</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-line" role="progressbar" aria-label={`Seats used in ${c.name}`} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={c.learners}>
          <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <CopyField value={`${siteLink}/learn/org?code=${c.code}`} label={`Join link for ${c.name}`} />
      {mine.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">Seat grants ({mine.length})</summary>
          <ul className="mt-1 divide-y divide-line">
            {mine.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className={g.revoked_at ? "text-muted line-through" : "text-ink"}>
                  +{g.seats} · {SEAT_KIND[g.kind] ?? g.kind}{g.reference ? ` · ${g.reference}` : ""} · {formatDateZA(g.created_at)} by {g.granted_by}
                </span>
                {g.revoked_at ? (
                  <span className="text-xs text-slate">Revoked {formatDateZA(g.revoked_at)}</span>
                ) : (
                  <form action={revokeSeatGrantAction}>
                    <input type="hidden" name="grant_id" value={g.id} />
                    <button type="submit" className="min-h-11 px-2 text-sm font-semibold text-ink underline underline-offset-2">Revoke grant</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

async function Cohorts({ db, siteLink }: { db: Parameters<typeof loadCohorts>[0]; siteLink: string }) {
  const { cohorts, grants, error } = await loadCohorts(db);
  const options = cohorts.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name, code: c.code }));
  return (
    <>
      <ErrorNote error={error} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card} aria-labelledby="new-cohort-h">
          <h2 id="new-cohort-h" className={h2}>Create a cohort</h2>
          <p className="mb-4 mt-1 text-sm text-slate">For a company, school or pilot group. Seats give each learner who joins the full pathway.</p>
          <CreateCohortForm />
        </section>
        <section className={card} aria-labelledby="grant-h">
          <h2 id="grant-h" className={h2}>Add seats to a cohort</h2>
          <p className="mb-4 mt-1 text-sm text-slate">Manual, invoiced or EFT seats. Every grant is logged and can be revoked.</p>
          <GrantSeatsForm cohorts={options} />
        </section>
      </div>
      <h2 className={`${h2} mt-8`}>Cohorts <span className="font-normal text-slate">({cohorts.length})</span></h2>
      {cohorts.length === 0 ? (
        <p className={`${card} mt-4 text-sm text-slate`}>No cohorts yet.</p>
      ) : (
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {cohorts.map((c) => <CohortCard key={c.id} c={c} grants={grants} siteLink={siteLink} />)}
        </ul>
      )}
    </>
  );
}

async function Invites({ db }: { db: Parameters<typeof loadCohorts>[0] }) {
  const { cohorts, invites, error } = await loadCohorts(db);
  const options = cohorts.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name, code: c.code }));
  const orgName = new Map(cohorts.map((c) => [c.id, `${c.name} (${c.code})`]));
  const now = nowMs();
  const status = (i: (typeof invites)[number]) =>
    i.revoked ? "Revoked" : i.used_count >= i.max_uses ? "Used" : new Date(i.expires_at).getTime() < now ? "Expired" : "Active";
  return (
    <>
      <ErrorNote error={error} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className={card} aria-labelledby="inv-h">
          <h2 id="inv-h" className={h2}>Invite a coach or admin</h2>
          <p className="mb-4 mt-1 text-sm text-slate">Learners join with the cohort link instead. Coaches only see learners who consent, and never journals.</p>
          <InviteForm cohorts={options} />
        </section>
        <section aria-labelledby="inv-list-h">
          <h2 id="inv-list-h" className={h2}>Invites <span className="font-normal text-slate">({invites.length})</span></h2>
          {invites.length === 0 ? (
            <p className={`${card} mt-4 text-sm text-slate`}>No invites yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {invites.map((i) => (
                <li key={i.id} className={`${card} flex flex-wrap items-center justify-between gap-3`}>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-ink">{i.role === "admin" ? "Org admin" : "Coach"} · {orgName.get(i.org_id) ?? "Unknown cohort"}</p>
                    <p className="text-slate">
                      {status(i)} · {i.used_count}/{i.max_uses} used · expires {formatDateZA(i.expires_at)}
                      {i.email ? ` · for ${maskEmail(i.email)}` : ""}
                    </p>
                  </div>
                  {status(i) === "Active" && (
                    <form action={revokeInviteAction}>
                      <input type="hidden" name="id" value={i.id} />
                      <button type="submit" className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">Revoke</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

async function Consents({ db }: { db: Parameters<typeof loadLearners>[0] }) {
  const [{ consents, error }, { learners }] = await Promise.all([loadConsents(db), loadLearners(db)]);
  const waiting = learners.filter((l) => l.stage === "needs_consent");
  const METHOD: Record<string, string> = { on_device_attestation: "On-device attestation", email_verified: "Verified email", school_contract: "School contract" };
  return (
    <>
      <ErrorNote error={error} />
      <p className="mt-6 text-sm text-slate">
        POPIA s35: a parent or guardian must consent before we use a child’s information. Guardian emails are masked here; learners under 18 can’t start until consent is granted.
      </p>
      <section className="mt-4" aria-labelledby="waiting-h">
        <h2 id="waiting-h" className={h2}>Waiting for consent <span className="font-normal text-slate">({waiting.length})</span></h2>
        {waiting.length === 0 ? (
          <p className={`${card} mt-3 text-sm text-slate`}>No under-18 account is waiting for consent.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {waiting.map((l) => (
              <li key={l.id} className={`${card} text-sm`}>
                <p className="font-semibold text-ink">{l.fullName || "Unnamed learner"} · age {l.ageBand}</p>
                <p className="text-slate">Account since {formatDateZA(l.createdAt)} · {maskEmail(l.email)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8" aria-labelledby="records-h">
        <h2 id="records-h" className={h2}>Consent records <span className="font-normal text-slate">({consents.length})</span></h2>
        {consents.length === 0 ? (
          <p className={`${card} mt-3 text-sm text-slate`}>No consent records yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-elevated">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">Guardian consent records</caption>
              <thead className="bg-surface text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th scope="col" className={th}>Learner</th>
                  <th scope="col" className={th}>Guardian</th>
                  <th scope="col" className={th}>Method · wording</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className={td}><p className="text-ink">{c.learner_display_name || "Learner"}</p><p className="text-xs text-slate">Age {c.learner_age_band}</p></td>
                    <td className={td}><p className="text-ink">{c.guardian_name}</p><p className="text-xs text-slate">{c.relationship} · {maskEmail(c.guardian_email)}</p></td>
                    <td className={`${td} text-slate`}>{METHOD[c.method] ?? c.method}<p className="text-xs">{c.consent_text_version}</p></td>
                    <td className={td}>
                      <span className={`font-semibold ${c.status === "granted" ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"}`}>
                        {c.status === "granted" ? "Granted" : c.status === "withdrawn" ? "Withdrawn" : "Pending"}
                      </span>
                      <p className="text-xs text-slate">{formatDateZA(c.status === "withdrawn" ? c.withdrawn_at : c.granted_at || c.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

async function Certificates({ db }: { db: Parameters<typeof loadCertificates>[0] }) {
  const { certificates, error } = await loadCertificates(db);
  return (
    <section className="mt-6" aria-labelledby="certs-h">
      <h2 id="certs-h" className={h2}>Certificates <span className="font-normal text-slate">({certificates.length})</span></h2>
      <p className="mt-1 text-sm text-slate">Revoking takes effect at once: the public check at /verify shows the certificate as revoked.</p>
      <ErrorNote error={error} />
      {certificates.length === 0 ? (
        <p className={`${card} mt-4 text-sm text-slate`}>No certificates issued yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {certificates.map((c) => (
            <li key={c.id} className={card} data-testid={`cert-${c.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink">{c.learner_name} · {programmeName(c.programme_id)}</p>
                  <p className="text-slate">
                    <Link href={`/verify/${encodeURIComponent(c.id)}`} className="font-mono text-ink underline underline-offset-2">{c.id}</Link> · issued {formatDateZA(c.issued_at)}
                    {c.org_code ? ` · ${c.org_code}` : ""}
                  </p>
                  {c.revoked && (
                    <p className="mt-1 font-semibold text-red-800 dark:text-red-200">
                      Revoked {formatDateZA(c.revoked_at)}{c.revoked_reason ? `: ${c.revoked_reason}` : ""}
                    </p>
                  )}
                </div>
                {c.revoked ? (
                  <form action={reinstateCertificateAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">Reinstate</button>
                  </form>
                ) : (
                  <RevokeCertificateForm id={c.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function AssessmentQuality({ db }: { db: Parameters<typeof loadAudit>[0] }) {
  const { programmes, error } = await loadReliability(db);
  const fmtA = (a: number | null) => (a == null ? "—" : a.toFixed(2));
  return (
    <section className="mt-6" aria-labelledby="aq-h">
      <h2 id="aq-h" className={h2}>Assessment quality and reliability</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate">
        Live Cronbach’s α per face from stored item answers. Attempts that missed the attention check,
        gave the same answer to almost everything, or were finished unusually fast are left out. Estimates
        stay provisional until at least {RELIABILITY_MIN_N} usable attempts per programme.
      </p>
      <ErrorNote error={error} />
      {programmes.length === 0 ? (
        <p className={`${card} mt-4 text-sm text-slate`}>No server-recorded attempts yet. Reliability appears here as learners take the baseline.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {programmes.map((p) => {
            const provisional = p.usable < RELIABILITY_MIN_N;
            return (
              <section key={`${p.programmeId}-${p.phase}`} className={card} aria-label={`${programmeName(p.programmeId)} ${p.phase === "pre" ? "baseline" : "after-test"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-ink">
                    {programmeName(p.programmeId)} · {p.phase === "pre" ? "Baseline" : "After-test"}
                  </h3>
                  <p className="text-sm text-slate">
                    {p.usable} usable of {p.attempts} attempts
                    {provisional && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100">Provisional</span>}
                  </p>
                </div>
                {Object.keys(p.flagCounts).length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                    {Object.entries(p.flagCounts).map(([f, n]) => (
                      <li key={f} className="rounded-full bg-surface px-2.5 py-1 text-ink ring-1 ring-line">
                        {QUALITY_FLAG_LABELS[f as QualityFlag] ?? f}: <strong>{n}</strong>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[30rem] text-left text-sm">
                    <caption className="sr-only">Cronbach’s alpha per face</caption>
                    <thead className="text-xs uppercase tracking-wide text-slate">
                      <tr>
                        <th scope="col" className={th}>Face</th>
                        <th scope="col" className={th}>Items</th>
                        <th scope="col" className={th}>N</th>
                        <th scope="col" className={th}>α</th>
                        <th scope="col" className={th}>Reading</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.faces.map((f) => (
                        <tr key={f.faceId} className="border-t border-line">
                          <td className={`${td} text-ink`}>{f.name}</td>
                          <td className={`${td} tabular-nums text-slate`}>{f.items}</td>
                          <td className={`${td} tabular-nums text-slate`}>{f.n}</td>
                          <td className={`${td} tabular-nums font-semibold text-ink`}>{fmtA(f.alpha)}</td>
                          <td className={`${td} text-slate`}>{alphaBand(f.alpha)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-line-strong">
                        <td className={`${td} font-semibold text-ink`}>All items</td>
                        <td className={`${td} tabular-nums text-slate`}>{p.overall.items}</td>
                        <td className={`${td} tabular-nums text-slate`}>{p.overall.n}</td>
                        <td className={`${td} tabular-nums font-semibold text-ink`}>{fmtA(p.overall.alpha)}</td>
                        <td className={`${td} text-slate`}>{alphaBand(p.overall.alpha)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

const ACTION_LABEL: Record<string, string> = {
  "cohort.create": "Created cohort",
  "cohort.pause": "Paused cohort",
  "cohort.reopen": "Reopened cohort",
  "seats.grant": "Added seats",
  "seats.revoke": "Revoked seat grant",
  "invite.create": "Created invite",
  "invite.revoke": "Revoked invite",
  "certificate.revoke": "Revoked certificate",
  "certificate.reinstate": "Reinstated certificate",
};

function auditSummary(d: Record<string, unknown>) {
  const bits: string[] = [];
  if (d.code) bits.push(String(d.code));
  if (d.seats) bits.push(`${d.seats} seats`);
  if (d.kind && d.seats) bits.push(SEAT_KIND[String(d.kind)] ?? String(d.kind));
  if (d.reference) bits.push(String(d.reference));
  if (d.seat_limit_after != null) bits.push(`limit now ${d.seat_limit_after}`);
  if (d.role) bits.push(String(d.role));
  if (d.reason) bits.push(`“${String(d.reason)}”`);
  return bits.join(" · ");
}

async function Audit({ db }: { db: Parameters<typeof loadAudit>[0] }) {
  const { rows, error } = await loadAudit(db);
  return (
    <section className="mt-6" aria-labelledby="audit-h">
      <h2 id="audit-h" className={h2}>Audit log <span className="font-normal text-slate">(latest {rows.length})</span></h2>
      <p className="mt-1 text-sm text-slate">Every admin change, append-only. Times in SAST.</p>
      <ErrorNote error={error} />
      {rows.length === 0 ? (
        <p className={`${card} mt-4 text-sm text-slate`}>Nothing logged yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-elevated">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Admin audit log</caption>
            <thead className="bg-surface text-xs uppercase tracking-wide text-slate">
              <tr>
                <th scope="col" className={th}>When</th>
                <th scope="col" className={th}>Who</th>
                <th scope="col" className={th}>What</th>
                <th scope="col" className={th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className={`${td} whitespace-nowrap text-slate`}>{formatDateTimeZA(r.created_at)}</td>
                  <td className={`${td} text-slate`}>{r.actor}</td>
                  <td className={`${td} font-medium text-ink`}>{ACTION_LABEL[r.action] ?? r.action}</td>
                  <td className={`${td} text-slate`}>{auditSummary(r.detail)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

async function Enquiries({ db }: { db: Parameters<typeof loadAudit>[0] }) {
  const res = await db
    .from("enquiries")
    .select("id,created_at,intent,name,email,organisation,message,source,delivered,handled_at,handled_by")
    .order("created_at", { ascending: false })
    .limit(2000);
  return (
    <>
      <ErrorNote error={res.error?.message ?? null} />
      <EnquiriesTab rows={(res.data ?? []) as Enquiry[]} toggle={toggleHandledAction} />
    </>
  );
}

export default async function AdminConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; stage?: string }>;
}) {
  const { tab: tabParam, stage } = await searchParams;
  const tab: TabId = (TABS.find((t) => t.id === tabParam)?.id ?? "overview") as TabId;
  const ctx = await requireLmsAdmin();

  if (!ctx.ok) {
    return (
      <section className="pb-16 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pb-24 md:pt-28">
        <div className="container-site">
          <div className="mx-auto max-w-md">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Super-Cube® admin</h1>
          {ctx.reason === "not_configured" ? (
            <p className="mt-2 text-sm text-slate" role="alert">The admin store isn’t configured on this deployment.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate">Sign in with your Super-Cube® account. Only approved admin emails can open this page.</p>
              <SignInForm next="/admin" />
            </>
          )}
          </div>
        </div>
      </section>
    );
  }

  const siteLink = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me").replace(/\/$/, "");

  return (
    <section className="pb-16 pt-[calc(5rem+env(safe-area-inset-top,0px))] md:pt-24">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Super-Cube® learning admin</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate">
            <span>Signed in as <strong className="font-semibold text-ink">{ctx.email}</strong> · times in SAST</span>
            <form action={signOutAction}>
              <input type="hidden" name="next" value="/admin" />
              <button type="submit" className="min-h-11 font-semibold text-ink underline underline-offset-2">Sign out</button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin sections" className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-1.5 border-b border-line pb-px">
            {TABS.map((t) => {
              const on = t.id === tab;
              return (
                <li key={t.id}>
                  <Link
                    href={`/admin?tab=${t.id}`}
                    aria-current={on ? "page" : undefined}
                    className={`-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-semibold ${
                      on ? "border-ink text-ink" : "border-transparent text-slate hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/newsletter/admin?tab=subscribers" className="-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-semibold text-slate hover:text-ink">
                Newsletter
              </Link>
            </li>
          </ul>
        </nav>

        {tab === "overview" && <Overview db={ctx.db} />}
        {tab === "learners" && <Learners db={ctx.db} stage={STAGES.some((s) => s.id === stage) ? stage : undefined} />}
        {tab === "cohorts" && <Cohorts db={ctx.db} siteLink={siteLink} />}
        {tab === "invites" && <Invites db={ctx.db} />}
        {tab === "consents" && <Consents db={ctx.db} />}
        {tab === "certificates" && <Certificates db={ctx.db} />}
        {tab === "assessment" && <AssessmentQuality db={ctx.db} />}
        {tab === "audit" && <Audit db={ctx.db} />}
        {tab === "enquiries" && <Enquiries db={ctx.db} />}
      </div>
    </section>
  );
}
