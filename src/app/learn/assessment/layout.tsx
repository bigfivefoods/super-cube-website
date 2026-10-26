import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Six-face leadership assessment",
  description:
    "Measure your leadership capacity across the six Super-Cube® faces: Choices, Principles, Mental, Emotional, Physical and Spiritual.",
  path: "/learn/assessment",
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
