import { SiteHeader } from "@/components/common/SiteHeader";
import { LessonPageClient } from "./lesson-page-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen" dir="ltr">
      <SiteHeader />
      <LessonPageClient id={id} />
    </div>
  );
}
