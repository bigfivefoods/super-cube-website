import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Choose your programme",
  description:
    "Choose Super-Cube® Kids (5–12), Adolescents (13–21) or Adults (22+): one model across the lifespan.",
  path: "/learn/programmes",
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
