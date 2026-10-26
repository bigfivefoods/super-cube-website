import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Assessment orientation",
  description:
    "Get oriented before your Super-Cube® baseline: what the six faces measure and how to answer honestly, in about 2 minutes.",
  path: "/learn/assessment/orientation",
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
