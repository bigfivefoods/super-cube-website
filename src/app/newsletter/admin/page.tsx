import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { NEWSLETTER_TABLE, newsletterDb, type Subscriber } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Newsletter admin | Super-Cube®" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function NewsletterAdminPage() {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) {
    if (!admin.signedInAs) redirect("/login?next=/newsletter/admin");
    return (
      <section className="section-pad">
        <div className="container-site max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Not authorised</h1>
          <p className="mt-3 text-slate">
            You’re signed in as {admin.signedInAs}, which doesn’t have newsletter admin access.
          </p>
        </div>
      </section>
    );
  }

  const db = newsletterDb();
  let rows: Subscriber[] = [];
  let error: string | null = null;
  if (!db) error = "The subscriber store isn’t configured (Supabase URL / service role key).";
  else {
    const res = await db
      .from(NEWSLETTER_TABLE)
      .select("id,email,source,consent_text,consent_at,unsubscribe_token,unsubscribed_at,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (res.error) error = res.error.message;
    rows = (res.data ?? []) as Subscriber[];
  }
  const active = rows.filter((r) => !r.unsubscribed_at).length;

  return (
    <section className="section-pad">
      <div className="container-site">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Newsletter subscribers</h1>
        <p className="mt-2 text-sm text-slate">Signed in as {admin.email}. Times in SAST.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-line bg-elevated px-4 py-3">
            <p className="text-2xl font-semibold tabular-nums text-ink">{active}</p>
            <p className="text-xs text-slate">Active</p>
          </div>
          <div className="rounded-xl border border-line bg-elevated px-4 py-3">
            <p className="text-2xl font-semibold tabular-nums text-ink">{rows.length - active}</p>
            <p className="text-xs text-slate">Unsubscribed</p>
          </div>
          <a
            href="/api/newsletter/admin/export?status=active"
            className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
          >
            Export active (CSV)
          </a>
          <a
            href="/api/newsletter/admin/export?status=all"
            className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
          >
            Export all (CSV)
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          The CSV includes each person’s personal unsubscribe link. Put it in every newsletter you send.
        </p>

        {error ? (
          <p className="mt-6 rounded-xl border border-line bg-elevated p-4 text-sm text-ink" role="alert">{error}</p>
        ) : rows.length === 0 ? (
          <p className="mt-6 text-slate">No subscribers yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2">Email</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2">Source</th>
                  <th scope="col" className="px-3 py-2">Consent given</th>
                  <th scope="col" className="px-3 py-2">Unsubscribed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-3 py-2 text-ink">{r.email}</td>
                    <td className="px-3 py-2 text-slate">{r.unsubscribed_at ? "Unsubscribed" : "Active"}</td>
                    <td className="px-3 py-2 text-slate">{r.source ?? "—"}</td>
                    <td className="px-3 py-2 text-slate">{fmt(r.consent_at)}</td>
                    <td className="px-3 py-2 text-slate">{fmt(r.unsubscribed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-6 text-sm">
          <Link href="/" className="font-semibold text-ink underline underline-offset-2">Back to site</Link>
        </p>
      </div>
    </section>
  );
}
