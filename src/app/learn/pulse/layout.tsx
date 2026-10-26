import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Weekly pulse check",
  description:
    "A quick weekly Super-Cube® pulse check to track how each face of your leadership is moving.",
  path: "/learn/pulse",
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
