"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";

type ContactFormProps = {
  variant?: "full" | "footer";
  className?: string;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-elevated focus:ring-1 focus:ring-ink";

const inputClassFooter =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-ink focus:bg-elevated focus:ring-1 focus:ring-ink";

export function ContactForm({
  variant = "full",
  className = "",
}: ContactFormProps) {
  const { t } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isFooter = variant === "footer";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      organisation: String(data.get("organisation") || "").trim(),
      intent: String(
        data.get("interest") || (isFooter ? "footer" : "general")
      ),
      message: String(data.get("message") || "").trim(),
      source: isFooter ? "footer" : "contact",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Could not send message");
      }
      setName(payload.name);
      setSubmitted(true);
      track("contact_submit", { intent: payload.intent });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    if (isFooter) {
      return (
        <div
          className={`rounded-2xl border border-line bg-elevated p-5 ${className}`.trim()}
        >
          <h2 className="text-base font-semibold tracking-tight text-ink">
            {t("footer.formThanks")}
            {name ? `, ${name}` : ""}.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            {t("footer.formReceived")}
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            {t("footer.formAnother")}
          </button>
        </div>
      );
    }

    return (
      <div
        className={`rounded-2xl border border-line bg-elevated p-8 md:p-10 ${className}`.trim()}
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Message received
        </p>
        <h2 className="heading-md mt-3 text-ink">
          Thank you{name ? `, ${name}` : ""}.
        </h2>
        <p className="mt-4 leading-relaxed text-slate">
          We’ve received your note. If you left a school or company pilot
          request, we’ll prioritise that conversation. Prefer email?{" "}
          <a
            href="mailto:hello@super-cube.me"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            hello@super-cube.me
          </a>
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  if (isFooter) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border border-line bg-elevated p-5 ${className}`.trim()}
        noValidate={false}
      >
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {t("footer.contactUs")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="text-xs font-semibold text-ink">
              {t("footer.formName")}
            </span>
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className={inputClassFooter}
              placeholder={t("footer.formName")}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-xs font-semibold text-ink">
              {t("footer.formEmail")}
            </span>
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className={inputClassFooter}
              placeholder="you@email.com"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-ink">
              {t("footer.formOrg")}
            </span>
            <input
              name="organisation"
              type="text"
              autoComplete="organization"
              className={inputClassFooter}
              placeholder={t("footer.formOrg")}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-ink">
              {t("footer.formMessage")}
            </span>
            <textarea
              required
              name="message"
              rows={3}
              className={`${inputClassFooter} resize-y`}
              placeholder={t("footer.formMessage")}
            />
          </label>
        </div>
        {error && (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full sc-btn-primary px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t("footer.formSending") : t("footer.formSend")}
        </button>
        <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted">
          {t("footer.formPrivacy")}
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-line bg-elevated p-6 md:p-8 ${className}`.trim()}
      noValidate={false}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="text-sm font-semibold text-ink">
            {t("footer.formName")}
          </span>
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder="Your name"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-semibold text-ink">
            {t("footer.formEmail")}
          </span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@organisation.com"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">
            {t("footer.formOrg")}
          </span>
          <input
            name="organisation"
            type="text"
            autoComplete="organization"
            className={inputClass}
            placeholder="Optional — school, company, or network"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Interest</span>
          <select
            name="interest"
            className={inputClass}
            defaultValue="personal"
          >
            <option value="personal">Personal Super-Cube® plan</option>
            <option value="pipeline">Organisational leadership pipeline</option>
            <option value="school">School / youth pilot</option>
            <option value="network">Network / alliance programme</option>
            <option value="research">Research partnership</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">
            {t("footer.formMessage")}
          </span>
          <textarea
            required
            name="message"
            rows={5}
            className={`${inputClass} resize-y`}
            placeholder="Tell us about your context and goals…"
          />
        </label>
      </div>
      {error && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full sc-btn-primary px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {loading ? t("footer.formSending") : t("footer.formSend")}
      </button>
      <p className="mt-4 text-xs text-muted">{t("footer.formPrivacy")}</p>
    </form>
  );
}
