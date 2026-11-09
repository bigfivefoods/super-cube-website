import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";
import { lti } from "@/lib/lti/copy";

const META = {
  title: lti.metaTitle,
  description: lti.metaBody,
  path: "/learn/org/lti",
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
