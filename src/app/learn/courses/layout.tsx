import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Construct courses",
  description:
    "Six Super-Cube® construct courses with sessions, practice labs and checks for kids, adolescents and adults.",
  path: "/learn/courses",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
