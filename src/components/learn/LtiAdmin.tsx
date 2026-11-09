"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import { lti } from "@/lib/lti/copy";

type Org = { id: string; name: string; code: string };
type Platform = {
  id: string;
  orgId: string;
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
  tokenUrl: string;
  jwksUrl: string;
};
type Tool = { loginUrl: string; launchUrl: string; jwksUrl: string };
type Load =
  | { state: "loading" }
  | { state: "sign_in" }
  | { state: "not_admin" }
  | { state: "not_ready" }
  | { state: "unavailable" }
  | { state: "ready"; orgs: Org[]; platforms: Platform[]; tool: Tool };

const EMPTY = {
  name: "",
  issuer: "",
  clientId: "",
  deploymentId: "",
  authLoginUrl: "",
  tokenUrl: "",
  jwksUrl: "",
};

export function LtiAdmin() {
  const { t, L } = useLmsT();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [orgId, setOrgId] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/org/lti", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        orgs?: Org[];
        platforms?: Platform[];
        tool?: Tool;
      };
      if (res.status === 401 || body.error === "sign_in") return setLoad({ state: "sign_in" });
      if (body.error === "not_admin") return setLoad({ state: "not_admin" });
      if (body.error === "not_ready") return setLoad({ state: "not_ready" });
      if (!res.ok || !body.tool) return setLoad({ state: "unavailable" });
      setLoad({ state: "ready", orgs: body.orgs ?? [], platforms: body.platforms ?? [], tool: body.tool });
      setOrgId((current) => current || body.orgs?.[0]?.id || "");
    } catch {
      setLoad({ state: "unavailable" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const res = await fetch("/api/org/lti", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, orgId }),
    });
    setBusy(false);
    if (!res.ok) {
      setNotice(t(lti.saveError));
      return;
    }
    setForm(EMPTY);
    setNotice(t(lti.saved));
    await refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(t(lti.removeAsk))) return;
    const res = await fetch(`/api/org/lti?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setNotice(res.ok ? t(lti.removed) : t(lti.saveError));
    await refresh();
  }

  if (load.state === "loading") return <p className="learn-meta">{t("Loading…")}</p>;
  if (load.state === "sign_in") {
    return (
      <section className="learn-card">
        <h2 className="learn-card-title">{t(lti.signIn)}</h2>
        <Link href="/login?next=%2Flearn%2Forg%2Flti" className="learn-btn learn-btn-primary mt-3 inline-flex">
          {t(lti.signIn)}
        </Link>
      </section>
    );
  }
  if (load.state === "not_admin") {
    return (
      <section className="learn-card">
        <h2 className="learn-card-title">{t(lti.adminsOnly)}</h2>
        <p className="learn-body mt-1.5">{t(lti.adminsBody)}</p>
      </section>
    );
  }
  if (load.state === "not_ready") {
    return (
      <section className="learn-card">
        <h2 className="learn-card-title">{t(lti.notReady)}</h2>
        <p className="learn-body mt-1.5">{t(lti.notReadyBody)}</p>
      </section>
    );
  }
  if (load.state === "unavailable") return <p className="learn-meta">{t(lti.loadError)}</p>;

  const toolRows = [
    [lti.toolLogin, load.tool.loginUrl],
    [lti.toolLaunch, load.tool.launchUrl],
    [lti.toolJwks, load.tool.jwksUrl],
    [lti.redirect, load.tool.launchUrl],
  ] as const;

  return (
    <div className="space-y-4">
      <section className="learn-card" aria-labelledby="lti-tool">
        <h2 id="lti-tool" className="learn-card-title">{t(lti.paste)}</h2>
        <p className="learn-meta mt-1">{t(lti.redirectHint)}</p>
        <dl className="mt-3 space-y-3">
          {toolRows.map(([label, value]) => (
            <div key={label}>
              <dt className="learn-eyebrow">{t(label)}</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <code className="break-all text-sm text-ink" dir="ltr">{value}</code>
                <CopyButton value={value} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="learn-meta mt-3">{t(lti.issuerLine)}</p>
        <p className="mt-2">
          <Link href={L("/learn/org/lti/guide")} className="font-semibold text-ink underline underline-offset-2">
            {t(lti.openGuide)}
          </Link>
        </p>
      </section>

      <section className="learn-card" aria-labelledby="lti-registered">
        <h2 id="lti-registered" className="learn-card-title">{t(lti.registered)}</h2>
        {load.platforms.length === 0 ? (
          <p className="learn-meta mt-1">{t(lti.none)}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {load.platforms.map((platform) => (
              <li key={platform.id} className="rounded-xl border border-line px-3 py-3">
                <p className="font-semibold text-ink">{platform.name}</p>
                <p className="learn-meta mt-1 break-all" dir="ltr">{platform.issuer}</p>
                <p className="learn-meta" dir="ltr">{platform.clientId} · {platform.deploymentId}</p>
                <button type="button" className="learn-btn mt-2" onClick={() => void remove(platform.id)}>
                  {t(lti.remove)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={(event) => void save(event)} className="learn-card space-y-3">
        <h2 className="learn-card-title">{t(lti.save)}</h2>
        {load.orgs.length > 1 && (
          <label className="block">
            <span className="learn-label">{t(lti.yourOrg)}</span>
            <select className="learn-input mt-1.5" value={orgId} onChange={(event) => setOrgId(event.target.value)}>
              {load.orgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </label>
        )}
        <Field label={t(lti.platformName)} hint={t(lti.platformNameHint)} value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Field label={t(lti.issuer)} hint={t(lti.issuerHint)} value={form.issuer} onChange={(issuer) => setForm({ ...form, issuer })} ltr />
        <Field label={t(lti.clientId)} value={form.clientId} onChange={(clientId) => setForm({ ...form, clientId })} ltr />
        <Field label={t(lti.deploymentId)} value={form.deploymentId} onChange={(deploymentId) => setForm({ ...form, deploymentId })} ltr />
        <Field label={t(lti.loginUrl)} hint={t(lti.loginHint)} value={form.authLoginUrl} onChange={(authLoginUrl) => setForm({ ...form, authLoginUrl })} ltr />
        <Field label={t(lti.tokenUrl)} hint={t(lti.tokenHint)} value={form.tokenUrl} onChange={(tokenUrl) => setForm({ ...form, tokenUrl })} ltr />
        <Field label={t(lti.jwksUrl)} hint={t(lti.jwksHint)} value={form.jwksUrl} onChange={(jwksUrl) => setForm({ ...form, jwksUrl })} ltr />
        <p className="learn-meta">{t(lti.httpsHint)}</p>
        <button type="submit" className="learn-btn learn-btn-primary" disabled={busy}>
          {t(lti.save)}
        </button>
        {notice && <p className="learn-meta" role="status">{notice}</p>}
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  ltr,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="learn-label">{label}</span>
      <input
        className="learn-input mt-1.5"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={ltr ? "ltr" : undefined}
        required
      />
      {hint && <span className="learn-meta mt-1 block">{hint}</span>}
    </label>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useLmsT();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="learn-btn"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? t(lti.copied) : t(lti.copy)}
    </button>
  );
}
