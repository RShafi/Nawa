import { Suspense } from "react";
import { LessonPageClient } from "./lesson-page-client";

type PageProps = { params: Promise<{ id: string }> };

/** Lessons own the full dynamic viewport — no chrome competing with the sticky footer. */
export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="h-[100dvh] overflow-hidden" dir="ltr">
      <Suspense
        fallback={
          <main className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading lesson…
          </main>
        }
      >
        <LessonPageClient id={id} />
      </Suspense>
    </div>
  );
}
