import type { Metadata } from "next";
import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { peekCheckinLocale } from "@/lib/lms/server/checkin";
import { CheckinRater } from "./RaterForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Super-Cube® check-in" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let locale: Locale = "en";
  const admin = createAdminClient();
  if (admin) {
    try {
      const found = await peekCheckinLocale(admin, token);
      if (isLocale(found)) locale = found;
    } catch {
      locale = "en";
    }
  }
  return (
    <>
      <LmsLocaleData locale={locale} />
      <CheckinRater token={token} locale={locale} />
    </>
  );
}
