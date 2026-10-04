import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Choose your programme",
  description:
    "Choose Super-Cube® Kids (5–12), Adolescents (13–21) or Adults (22+): one model across the lifespan.",
  path: "/learn/programmes",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
