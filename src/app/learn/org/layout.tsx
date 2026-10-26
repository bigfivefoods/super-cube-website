import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Join your school or company cohort",
  description:
    "Join a Super-Cube® cohort with the code from your school, company or facilitator. Coaches only see scores you consent to share.",
  path: "/learn/org",
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
