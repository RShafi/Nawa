import { notFound } from "next/navigation";
import { CelestialLoomPlayer } from "@/components/lesson/CelestialLoomPlayer";
import { curriculumData } from "@/content/curriculumData";

export function generateStaticParams() {
  return curriculumData.map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LoomLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = curriculumData.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <div className="relative h-[100dvh] overflow-visible bg-transparent" dir="ltr">
      <CelestialLoomPlayer lessonId={lessonId} />
    </div>
  );
}
