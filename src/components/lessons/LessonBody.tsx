"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lesson } from "@/types/arabic";
import { getLessonContent } from "@/data/lessonContent";
import { DialectBridgeCard } from "@/components/dialect/DialectBridgeCard";
import { PhoneticsLesson } from "@/components/lessons/PhoneticsLesson";
import { QuizLesson } from "@/components/lessons/QuizLesson";
import { ReadingLesson } from "@/components/lessons/ReadingLesson";
import { MorphStudio } from "@/components/morph/MorphStudio";
import { WordAssemblyCard } from "@/components/morph/WordAssemblyCard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LessonBody({
  lesson,
  onActivitiesComplete,
}: {
  lesson: Lesson;
  onActivitiesComplete: () => void;
}) {
  const content = getLessonContent(lesson.id);
  const needsDialect = Boolean(lesson.dialectPhraseId) && lesson.type === "phonetics";
  const [mainDone, setMainDone] = useState(false);
  const [dialectDone, setDialectDone] = useState(!needsDialect);

  const markMain = useCallback(() => setMainDone(true), []);
  const markDialect = useCallback(() => setDialectDone(true), []);

  useEffect(() => {
    setMainDone(false);
    setDialectDone(!needsDialect);
  }, [lesson.id, needsDialect]);

  useEffect(() => {
    if (mainDone && dialectDone) onActivitiesComplete();
  }, [mainDone, dialectDone, onActivitiesComplete]);

  if (lesson.type === "morph-engine") {
    const teachFocus =
      lesson.id === "s1-u0-l1"
        ? "root"
        : lesson.id.startsWith("s2-")
          ? "pattern"
          : "word";
    return (
      <MorphStudio
        key={lesson.id}
        teachFocus={teachFocus}
        lockedRootId={lesson.rootId}
        focusPatternId={lesson.patternId}
        onComplete={markMain}
      />
    );
  }

  if (lesson.type === "dialect-bridge") {
    return (
      <DialectBridgeCard lockedPhraseId={lesson.dialectPhraseId} onComplete={markMain} />
    );
  }

  if (lesson.type === "phonetics") {
    if (content?.kind === "phonetics") {
      return (
        <div className="space-y-4">
          <PhoneticsLesson content={content} onComplete={markMain} />
          {needsDialect ? (
            <DialectBridgeCard
              lockedPhraseId={lesson.dialectPhraseId}
              onComplete={markDialect}
            />
          ) : null}
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phonetics</CardTitle>
          <CardDescription>Content missing for {lesson.id}.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (lesson.type === "quiz") {
    if (content?.kind === "quiz") {
      return <QuizLesson content={content} onComplete={markMain} />;
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>Quiz items for {lesson.id} are not loaded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (lesson.type === "reading-drill") {
    if (content?.kind === "reading") {
      return (
        <div className="space-y-4">
          <ReadingLesson content={content} onComplete={markMain} />
          {lesson.rootId || content.rootId ? <WordAssemblyCard /> : null}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reading drill</CardTitle>
            <CardDescription>
              Practice the assembled word below. Hear it, then use the tashkeel toggle.
            </CardDescription>
          </CardHeader>
        </Card>
        <WordAssemblyCard />
        <ReadingFallbackComplete onComplete={markMain} />
      </div>
    );
  }

  return null;
}

/** When a reading lesson has no curated items, complete after hearing the assembly once. */
function ReadingFallbackComplete({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Soft complete: user still needs morph interaction; give a clear button path via morph hear.
    // Auto-complete after a short dwell is wrong — require explicit confirm.
  }, []);
  return (
    <button
      type="button"
      className="text-primary text-sm underline-offset-2 hover:underline"
      onClick={onComplete}
    >
      I’ve practiced this word — complete lesson
    </button>
  );
}
