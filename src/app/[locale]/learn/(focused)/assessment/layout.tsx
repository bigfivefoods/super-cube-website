import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { assessmentScreenKeys } from "@/lib/i18n/lms/screen-keys";
import EnglishLayout, { generateMetadata } from "../../../../learn/assessment/layout";

export { generateMetadata };

/** Questionnaire copy for every programme. Lesson bodies are not included. */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <LmsLocaleData locale={locale} keys={assessmentScreenKeys()} />
      <EnglishLayout>{children}</EnglishLayout>
    </>
  );
}
