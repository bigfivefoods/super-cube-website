import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn",
  description: "Super-Cube® learning, assessment, and personal development report.",
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
