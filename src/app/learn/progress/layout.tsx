import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Your progress",
  description: "Your Super-Cube® lighting up face by face: points, levels, weekly goal, streak, spaced reviews and badges.",
  path: "/learn/progress",
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

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
