import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { LEARN_START_KEYS } from "@/lib/i18n/lms/page-keys";
import { WELCOME_REDIRECT_SCRIPT } from "@/lib/lms/welcome-redirect";

export { generateMetadata } from "../../../learn/start/layout";

/** Guided start only needs its own strings, not the lesson and questionnaire catalogues. */
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: WELCOME_REDIRECT_SCRIPT }} />
      </head>
      <LmsLocaleData locale={locale} keys={LEARN_START_KEYS} />
      {children}
    </>
  );
}
