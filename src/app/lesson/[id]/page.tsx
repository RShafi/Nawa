import { SiteHeader } from "@/components/common/SiteHeader";
import { VisitLesson } from "@/components/lesson/VisitLesson";

type PageProps = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <VisitLesson lessonId={id} />
    </div>
  );
}
