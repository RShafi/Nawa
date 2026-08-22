"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizContent } from "@/data/lessonContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function QuizLesson({
  content,
  onComplete,
}: {
  content: QuizContent;
  onComplete?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = content.questions[index];
  const correct = choice !== null && choice === q?.answer;

  useEffect(() => {
    if (finished) onComplete?.();
  }, [finished, onComplete]);

  const progressLabel = useMemo(
    () => `Question ${Math.min(index + 1, content.questions.length)} of ${content.questions.length}`,
    [index, content.questions.length],
  );

  if (!q) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkpoint</CardTitle>
        <CardDescription className="text-base leading-relaxed sm:text-lg">
          {content.intro}
        </CardDescription>
        <p className="text-muted-foreground text-sm sm:text-base">{progressLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {finished ? (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold">
              Score: {score}/{content.questions.length}
            </p>
            <p className="text-muted-foreground text-sm">
              {score === content.questions.length
                ? "Perfect — lesson complete."
                : "Quiz finished — lesson complete. Retry anytime to improve your score."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIndex(0);
                setChoice(null);
                setScore(0);
                setFinished(false);
              }}
            >
              Retry quiz
            </Button>
          </div>
        ) : (
          <>
            <p className="text-base font-medium leading-relaxed sm:text-lg">{q.prompt}</p>
            <div className="grid gap-2">
              {q.options.map((opt) => {
                const selected = choice === opt;
                const isAnswer = opt === q.answer;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={choice !== null}
                    onClick={() => {
                      setChoice(opt);
                      if (opt === q.answer) setScore((s) => s + 1);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-start text-base transition-colors sm:text-lg",
                      !selected && choice === null && "hover:bg-muted/60",
                      selected && isAnswer && "border-emerald-600/50 bg-emerald-600/10",
                      selected && !isAnswer && "border-destructive/50 bg-destructive/10",
                      choice !== null && isAnswer && "border-emerald-600/50 bg-emerald-600/10",
                    )}
                  >
                    <span className="font-arabic text-[1.05em]" dir="auto">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {choice !== null ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  {correct ? "Correct." : `Answer: ${q.answer}.`} {q.explain}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    if (index + 1 >= content.questions.length) {
                      setFinished(true);
                    } else {
                      setIndex((i) => i + 1);
                      setChoice(null);
                    }
                  }}
                >
                  {index + 1 >= content.questions.length ? "Finish" : "Next"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
