import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { LEARN_CHROME_KEYS } from "@/lib/i18n/lms/page-keys";

export { generateMetadata } from "../../../learn/welcome/layout";

/** The profile step uses the Learn shell, not the lesson or questionnaire catalogues. */
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
      <LmsLocaleData locale={locale} keys={LEARN_CHROME_KEYS} />
      {children}
    </>
  );
}
