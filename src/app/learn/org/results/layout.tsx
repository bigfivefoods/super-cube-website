import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Organisation results",
  description:
    "Super-Cube® organisation results for org admins: cohort before and after by face, completion, engagement and CSV export. Aggregates only.",
  path: "/learn/org/results",
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
