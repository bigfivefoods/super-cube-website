import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

/** The lesson exists in some programme's course for this face (ids are programme-prefixed). */
function lessonExists(constructId: string, lessonId: string): boolean {
  if (!constructs.some((x) => x.id === constructId)) return false;
  return PROGRAMMES.some((p) => Boolean(getLesson(courseId(p, constructId as ConstructId), lessonId)));
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ constructId: string; lessonId: string }>;
}) {
  const { constructId, lessonId } = await params;
  // Bad or old session links get a real 404 (with a way back), not a dead-end page
  if (!lessonExists(constructId, lessonId)) notFound();
  return children;
}
