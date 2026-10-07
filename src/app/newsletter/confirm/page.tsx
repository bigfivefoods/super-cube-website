import type { Metadata } from "next";
import Link from "next/link";
import { lookupConfirmToken, maskEmail } from "@/lib/newsletter/confirm";
import { ConfirmForm } from "./ConfirmForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Confirm your subscription | Super-Cube®" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;
  const look = t ? await lookupConfirmToken(t) : ({ state: "invalid" } as const);

  return (
    <section className="section-pad !pt-28 lg:!pt-32">
      <div className="container-site max-w-xl">
        <p className="eyebrow">Super-Cube® News</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          {look.state === "confirmed" ? "You’re already subscribed" : "Confirm your subscription"}
        </h1>
        {look.state === "pending" && (
          <>
            <p className="mt-3 text-slate">
              One last step: confirm that <strong className="text-ink">{maskEmail(look.email)}</strong> should receive
              Super-Cube® News. You can unsubscribe from any email.
            </p>
            <ConfirmForm token={t} />
          </>
        )}
        {look.state === "confirmed" && (
          <p className="mt-3 text-slate">
            This address is confirmed.{" "}
            <Link href="/news" className="font-semibold text-ink underline underline-offset-2">
              Read the latest news
            </Link>
            .
          </p>
        )}
        {(look.state === "expired" || look.state === "invalid") && (
          <p className="mt-3 text-slate" role="alert">
            {look.state === "expired" ? "This confirmation link has expired." : "This confirmation link isn’t valid."}{" "}
            Please{" "}
            <Link href="/news#subscribe" className="font-semibold text-ink underline underline-offset-2">
              sign up again
            </Link>{" "}
            and we’ll email you a new link.
          </p>
        )}
        {look.state === "unavailable" && (
          <p className="mt-3 text-slate" role="alert">
            We can’t confirm subscriptions right now. Please try the link again in a few minutes.
          </p>
        )}
      </div>
    </section>
  );
}
