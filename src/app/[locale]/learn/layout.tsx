import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LearnAppFrame } from "@/components/learn/LearnAppFrame";
import { LmsLocaleData } from "@/components/learn/LmsLocaleData";
import { isPrefixedLocale } from "@/lib/i18n/config";
import { learnMetadata } from "@/lib/i18n/lms/meta";
import { viewport as learnViewport } from "../../learn/layout";

export const viewport: Viewport = learnViewport;

const META = {
  title: "Learning dashboard",
  description:
    "Super-Cube® Learn — leadership pathway: orient, assess, develop six faces, re-measure, and download your growth report.",
  path: "/learn",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return {
    ...learnMetadata(locale, META),
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Super-Cube® Learn",
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <>
      <LmsLocaleData locale={locale} />
      <LearnAppFrame>{children}</LearnAppFrame>
    </>
  );
}
