import type { Metadata } from "next";
import { constructs, type ConstructId } from "@/lib/content";
import { getLesson } from "@/lib/lms/curriculum";
import { courseId, type ProgrammeId } from "@/lib/programmes";
import { pageMeta } from "@/lib/seo";

const PROGRAMMES: ProgrammeId[] = ["kids", "adolescents", "adults"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ constructId: string; lessonId: string }>;
}): Promise<Metadata> {
  const { constructId, lessonId } = await params;
  const construct = constructs.find((x) => x.id === constructId);
  const prefix = lessonId.split("-")[0] as ProgrammeId;
  const programmeId = PROGRAMMES.includes(prefix) ? prefix : "adults";
  const data = construct
    ? getLesson(courseId(programmeId, constructId as ConstructId), lessonId)
    : undefined;
  const name = construct?.name ?? "Course";
  const title = data ? `${data.lesson.title} · ${name}` : `${name} session`;
  return pageMeta({
    title,
    description:
      data?.lesson.outcome ||
      `A Super-Cube® ${name} session: read, engage and apply one leadership skill.`,
    path: `/learn/courses/${encodeURIComponent(constructId)}/${encodeURIComponent(lessonId)}`,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
