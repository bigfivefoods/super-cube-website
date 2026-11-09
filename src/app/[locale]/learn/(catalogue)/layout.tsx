import { LmsLocaleData } from "@/components/learn/LmsLocaleData";

/**
 * Screens that look strings up across a whole language (Today, report, courses).
 * Welcome, guided start, a single lesson and the questionnaire embed only the
 * keys those screens can show.
 */
export default async function LearnCatalogueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <LmsLocaleData locale={locale} />
      {children}
    </>
  );
}
