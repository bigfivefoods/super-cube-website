import { LmsLocaleData } from "@/components/learn/LmsLocaleData";

/**
 * Lessons, questionnaires and reports look strings up across the whole language.
 * Guided start and welcome do not: they embed only the keys they can show.
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
