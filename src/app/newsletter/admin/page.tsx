import type { Metadata } from "next";
import Link from "next/link";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { SignInForm } from "./SignInForm";
import { signOutAction, toggleHandledAction } from "./actions";
import { EnquiriesTab, type Enquiry } from "./EnquiriesTab";
import { NEWSLETTER_TABLE, newsletterDb, type Subscriber } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Super-Cube admin" },
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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "subscribers" ? "subscribers" : "enquiries";
  const admin = await getNewsletterAdmin();
  if (!admin.ok) {
    return (
      <section className="section-pad">
        <div className="container-site max-w-md">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Super-Cube admin</h1>
          <p className="mt-2 text-sm text-slate">
            Sign in with your Super-Cube® account. Only approved admin emails can open this page.
          </p>
          <SignInForm />
        </div>
      </section>
    );
  }

  const db = newsletterDb();
  let rows: Subscriber[] = [];
  let enquiries: Enquiry[] = [];
  let error: string | null = null;
  if (!db) error = "The store isn’t configured (Supabase URL / service role key).";
  else if (tab === "subscribers") {
    const res = await db
      .from(NEWSLETTER_TABLE)
      .select("id,email,source,consent_text,consent_at,unsubscribe_token,unsubscribed_at,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (res.error) error = res.error.message;
    rows = (res.data ?? []) as Subscriber[];
  } else {
    const res = await db
      .from("enquiries")
      .select("id,created_at,intent,name,email,organisation,message,source,delivered,handled_at,handled_by")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (res.error) error = res.error.message;
    enquiries = (res.data ?? []) as Enquiry[];
  }
  const active = rows.filter((r) => !r.unsubscribed_at).length;
  const tabCls = (on: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${
      on ? "bg-ink text-paper" : "border border-line-strong text-ink"
    }`;

  return (
    <section className="section-pad">
      <div className="container-site">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Super-Cube admin</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate">
          <p>Signed in as {admin.email}. Times in SAST.</p>
          <form action={signOutAction}>
            <button type="submit" className="min-h-6 font-semibold text-ink underline underline-offset-2">Sign out</button>
          </form>
        </div>

        <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2">
          <Link href="/newsletter/admin?tab=enquiries" className={tabCls(tab === "enquiries")} aria-current={tab === "enquiries" ? "page" : undefined}>
            Enquiries
          </Link>
          <Link href="/newsletter/admin?tab=subscribers" className={tabCls(tab === "subscribers")} aria-current={tab === "subscribers" ? "page" : undefined}>
            Newsletter subscribers
          </Link>
          <Link href="/admin" className={tabCls(false)}>
            Learning admin →
          </Link>
        </nav>

        {tab === "enquiries" ? (
          error ? (
            <p className="mt-6 rounded-xl border border-line bg-elevated p-4 text-sm text-ink" role="alert">{error}</p>
          ) : (
            <EnquiriesTab rows={enquiries} toggle={toggleHandledAction} />
          )
        ) : (
        <>
        <h2 className="mt-8 text-xl font-semibold tracking-tight text-ink">Newsletter subscribers</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
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
        </>
        )}
        <p className="mt-6 text-sm">
          <Link href="/" className="font-semibold text-ink underline underline-offset-2">Back to site</Link>
        </p>
      </div>
    </section>
  );
}
