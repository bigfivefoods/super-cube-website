import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";
import { lti } from "@/lib/lti/copy";

const META = {
  title: lti.guideMeta,
  description: lti.guideMetaBody,
  path: "/learn/org/lti/guide",
  noIndex: true,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return learnMetadata(locale, META);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
