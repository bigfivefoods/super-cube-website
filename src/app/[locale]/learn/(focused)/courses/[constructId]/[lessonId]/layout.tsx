import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { lessonScreenKeys } from "@/lib/i18n/lms/screen-keys";
import EnglishLayout, { generateMetadata } from "../../../../../../learn/courses/[constructId]/[lessonId]/layout";

export { generateMetadata };

/** One lesson's copy, plus the Learn shell. Not the whole language catalogue. */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; constructId: string; lessonId: string }>;
}) {
  const { locale, constructId, lessonId } = await params;
  return (
    <>
      <LmsLocaleData locale={locale} keys={lessonScreenKeys(constructId, lessonId)} />
      <EnglishLayout params={params}>{children}</EnglishLayout>
    </>
  );
}
