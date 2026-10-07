import type { Metadata } from "next";
import Link from "next/link";
import { UnsubscribeButton } from "./UnsubscribeButton";

export const metadata: Metadata = {
  title: { absolute: "Unsubscribe | Super-Cube®" },
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  return (
    <section className="section-pad !pt-28 lg:!pt-32">
      <div className="container-site max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Unsubscribe</h1>
        {t ? (
          <>
            <p className="mt-3 text-slate">
              Press the button to stop receiving the Super-Cube® newsletter.
            </p>
            <UnsubscribeButton token={t} />
          </>
        ) : (
          <p className="mt-3 text-slate">
            Please use the unsubscribe link at the bottom of any Super-Cube®
            email, or{" "}
            <Link href="/contact" className="font-semibold text-ink underline underline-offset-2">
              contact us
            </Link>{" "}
            and we’ll remove you.
          </p>
        )}
      </div>
    </section>
  );
}
