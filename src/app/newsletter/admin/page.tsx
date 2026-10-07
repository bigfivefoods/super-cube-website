import type { Metadata } from "next";
import Link from "next/link";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { SignInForm } from "./SignInForm";
import { signOutAction, toggleHandledAction } from "./actions";
import { EnquiriesTab, type Enquiry } from "./EnquiriesTab";
import { NewsTab } from "./NewsTab";
import { CampaignsTab } from "./CampaignsTab";
import { NEWSLETTER_TABLE, newsletterDb, subscriberStatus, type Subscriber } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";
/** Campaign batches send ~40 emails per action (paced for the provider's rate limit). */
export const maxDuration = 60;

export const metadata: Metadata = {
  title: { absolute: "Super-Cube® admin" },
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
  searchParams: Promise<{ tab?: string; edit?: string; done?: string; id?: string }>;
}) {
  const { tab: tabParam, edit, done, id } = await searchParams;
  const tab =
    tabParam === "subscribers" || tabParam === "news" || tabParam === "campaigns" ? tabParam : "enquiries";
  const admin = await getNewsletterAdmin();
  if (!admin.ok) {
    return (
      <section className="section-pad">
        <div className="container-site max-w-md">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Super-Cube® admin</h1>
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
  if (tab === "news" || tab === "campaigns") {
    // These tabs load their own data (and report a missing store themselves).
  } else if (!db) error = "The store isn’t configured (Supabase URL / service role key).";
  else if (tab === "subscribers") {
    const res = await db
      .from(NEWSLETTER_TABLE)
      .select("id,email,source,consent_text,consent_at,unsubscribe_token,unsubscribed_at,created_at,confirmed_at")
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
  const active = rows.filter((r) => subscriberStatus(r) === "active").length;
  const pending = rows.filter((r) => subscriberStatus(r) === "pending").length;
  const unsubscribed = rows.length - active - pending;
  const tabCls = (on: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${
      on ? "bg-ink text-paper" : "border border-line-strong text-ink"
    }`;

  return (
    <section className="section-pad">
      <div className="container-site">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Super-Cube® admin</h1>
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
          <Link href="/newsletter/admin?tab=news" className={tabCls(tab === "news")} aria-current={tab === "news" ? "page" : undefined}>
            News posts
          </Link>
          <Link href="/newsletter/admin?tab=campaigns" className={tabCls(tab === "campaigns")} aria-current={tab === "campaigns" ? "page" : undefined}>
            Campaigns
          </Link>
          <Link href="/admin" className={tabCls(false)}>
            Learning admin →
          </Link>
        </nav>

        {tab === "news" ? (
          <NewsTab edit={edit} done={done} />
        ) : tab === "campaigns" ? (
          <CampaignsTab id={id} done={done} adminEmail={admin.email} />
        ) : tab === "enquiries" ? (
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
            <p className="text-xs text-slate">Active (confirmed)</p>
          </div>
          <div className="rounded-xl border border-line bg-elevated px-4 py-3">
            <p className="text-2xl font-semibold tabular-nums text-ink">{pending}</p>
            <p className="text-xs text-slate">Awaiting confirmation</p>
          </div>
          <div className="rounded-xl border border-line bg-elevated px-4 py-3">
            <p className="text-2xl font-semibold tabular-nums text-ink">{unsubscribed}</p>
            <p className="text-xs text-slate">Unsubscribed</p>
          </div>
          {/* File download from an API route: a plain link is intended. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/newsletter/admin/export?status=active"
            className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
          >
            Export active (CSV)
          </a>
          {/* File download from an API route: a plain link is intended. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/newsletter/admin/export?status=all"
            className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
          >
            Export all (CSV)
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          Double opt-in: people count as active only after they press the link in the confirmation email. Campaigns go to active subscribers only, and the CSV includes each person’s unsubscribe link.
        </p>

        {error ? (
          <p className="mt-6 rounded-xl border border-line bg-elevated p-4 text-sm text-ink" role="alert">{error}</p>
        ) : rows.length === 0 ? (
          <p className="mt-6 text-slate">No subscribers yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2">Email</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2">Source</th>
                  <th scope="col" className="px-3 py-2">Consent given</th>
                  <th scope="col" className="px-3 py-2">Confirmed</th>
                  <th scope="col" className="px-3 py-2">Unsubscribed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-3 py-2 text-ink">{r.email}</td>
                    <td className="px-3 py-2 text-slate">{{ active: "Active", pending: "Awaiting confirmation", unsubscribed: "Unsubscribed" }[subscriberStatus(r)]}</td>
                    <td className="px-3 py-2 text-slate">{r.source ?? "—"}</td>
                    <td className="px-3 py-2 text-slate">{fmt(r.consent_at)}</td>
                    <td className="px-3 py-2 text-slate">{fmt(r.confirmed_at ?? null)}</td>
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
