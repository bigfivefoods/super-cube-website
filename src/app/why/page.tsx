import { redirect } from "next/navigation";

/** Canonical “Why” story lives at /why-leadership; keep short URL for primary nav. */
export default function WhyPage() {
  redirect("/why-leadership");
}
