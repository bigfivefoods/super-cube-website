import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Welcome",
  description:
    "Welcome to Super-Cube® Learn: orient, baseline, practise deliberately and re-measure your leadership growth.",
  path: "/learn/welcome",
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
