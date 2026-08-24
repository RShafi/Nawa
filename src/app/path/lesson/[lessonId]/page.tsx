import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/path/LessonPlayer";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { findCurriculumLesson, getAllLessons } from "@/data/curriculum";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonId: l.id }));
}

export default async function PathLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const found = findCurriculumLesson(lessonId);
  if (!found) notFound();

  return (
    <div className="relative min-h-[100dvh] bg-[#07080c]" dir="ltr">
      <AppStoreHydrator>
        <LessonPlayer lesson={found.lesson} />
      </AppStoreHydrator>
    </div>
  );
}
