import { headers } from "next/headers";
import { dirOf, isLocale, type Locale } from "@/lib/i18n/config";
import { lmsText } from "@/lib/i18n/lms/text";
import { lti } from "@/lib/lti/copy";
import { readDeepOffer, type DeepOffer } from "@/lib/lti/flow";
import { productionDeps } from "@/lib/lti/production";

export const dynamic = "force-dynamic";

type Offer = DeepOffer & { locale: Locale };

export default async function DeepLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ dl?: string }>;
}) {
  const { dl } = await searchParams;
  const offer = await loadOffer(dl || "");
  if (!offer) {
    return (
      <main className="container-site py-8">
        <h1 className="text-2xl font-semibold text-ink">Super-Cube®</h1>
        <p className="mt-2 max-w-xl text-slate">{lti.expired}</p>
      </main>
    );
  }
  const t = (value: string) => lmsText(offer.locale, value);
  const programmes = offer.courses.filter((course) => course.kind === "programme");
  const faces = offer.courses.filter((course) => course.kind === "face");
  return (
    <main className="container-site py-8" lang={offer.locale} dir={dirOf(offer.locale)}>
      <h1 className="text-2xl font-semibold text-ink">{t(lti.pickTitle)}</h1>
      <p className="mt-2 max-w-2xl text-slate">{t(lti.pickBody)}</p>
      <form method="post" action="/api/lti/deep-link" className="mt-6 max-w-2xl space-y-6">
        <input type="hidden" name="dl" value={dl || ""} />
        <CourseGroup title={t(lti.fullProgramme)} courses={programmes} multiple={offer.acceptMultiple} t={t} />
        <CourseGroup title={t(lti.oneFace)} courses={faces} multiple={offer.acceptMultiple} t={t} />
        <button type="submit" className="learn-btn learn-btn-primary">{t(lti.addCourses)}</button>
      </form>
      <p className="learn-meta mt-6">{t(lti.issuerLine)}</p>
    </main>
  );
}

async function loadOffer(token: string): Promise<Offer | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
    const proto = h.get("x-forwarded-proto") || "https";
    const deps = await productionDeps(new Request(`${proto}://${host}/lti/deep-link`));
    const offer = await readDeepOffer(token, deps);
    return { ...offer, locale: isLocale(offer.locale) ? offer.locale : "en" };
  } catch {
    return null;
  }
}

function CourseGroup({
  title,
  courses,
  multiple,
  t,
}: {
  title: string;
  courses: { id: string; title: string; description: string }[];
  multiple: boolean;
  t: (value: string) => string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-ink">{title}</legend>
      {courses.map((course) => (
        <label key={course.id} className="flex gap-3 rounded-xl border border-line px-3 py-2">
          <input type={multiple ? "checkbox" : "radio"} name="course" value={course.id} className="mt-1" />
          <span>
            <span className="block font-medium text-ink">{t(course.title)}</span>
            <span className="block text-sm text-slate">{t(course.description)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
