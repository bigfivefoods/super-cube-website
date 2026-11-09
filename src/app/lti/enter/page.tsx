import { headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { lmsText } from "@/lib/i18n/lms/text";
import { EnterCourse } from "@/components/lti/EnterCourse";
import { lti } from "@/lib/lti/copy";
import { readEnterSession, type EnterSession } from "@/lib/lti/flow";
import { productionDeps } from "@/lib/lti/production";
import type { ProgrammeId } from "@/lib/programmes";

export const dynamic = "force-dynamic";

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ lt?: string }>;
}) {
  const { lt } = await searchParams;
  const session = await loadSession(lt || "");
  if (!session) {
    return (
      <main className="container-site py-8">
        <h1 className="text-2xl font-semibold text-ink">Super-Cube®</h1>
        <p className="mt-2 max-w-xl text-slate">{lti.launchFailed}</p>
      </main>
    );
  }
  const locale: Locale = isLocale(session.locale) ? session.locale : "en";
  const t = (value: string) => lmsText(locale, value);
  return (
    <EnterCourse
      token={lt || ""}
      programmeId={session.programmeId as ProgrammeId}
      courseId={session.courseId}
      orgCode={session.orgCode}
      fullName={session.fullName}
      email={session.email}
      nextPath={session.nextPath}
      locale={locale}
      opening={t(lti.opening)}
      openLabel={t(lti.openCourse)}
      framed={t(lti.framed)}
    />
  );
}

async function loadSession(token: string): Promise<EnterSession | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
    const proto = h.get("x-forwarded-proto") || "https";
    const deps = await productionDeps(new Request(`${proto}://${host}/lti/enter`));
    return await readEnterSession(token, deps);
  } catch {
    return null;
  }
}
