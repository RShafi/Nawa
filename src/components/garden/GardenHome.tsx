"use client";

import { useSearchParams } from "next/navigation";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { Button } from "@/components/ui/button";
import { FamilyPlant } from "@/components/garden/FamilyPlant";
import { StartOver } from "@/components/garden/StartOver";
import Link from "next/link";
import {
  PLANTS,
  getLesson,
  isLessonDone,
  nextLessonId,
  plantIsVisible,
} from "@/data/garden";
import { useAppStore } from "@/store/useAppStore";

export function GardenHome() {
  return (
    <AppStoreHydrator>
      <GardenInner />
    </AppStoreHydrator>
  );
}

function GardenInner() {
  const status = useAppStore((s) => s.status);
  const completed = useAppStore((s) => s.completedLessonIds);
  const deck = useAppStore((s) => s.unlockedDeck);
  const fsrs = useAppStore((s) => s.fsrsItems);
  const trees = useAppStore((s) => s.trees);
  const grewParam = useSearchParams().get("grew");

  const nextId = nextLessonId(completed, deck);
  const nextLesson = nextId ? getLesson(nextId) : null;
  const grewLesson = grewParam ? getLesson(grewParam) : null;
  const grewId = grewLesson && isLessonDone(grewLesson.id, completed, deck) ? grewLesson.id : null;
  const firstVisit = completed.length === 0 && deck.length === 0;
  const visible = PLANTS.filter((plant) => plantIsVisible(plant, completed, deck));

  if (status === "error") {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-rose-200">Could not load your words. Refresh and try again.</p>
      </main>
    );
  }

  if (status !== "ready") {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-white/50">Loading your words…</p>
      </main>
    );
  }

  if (firstVisit) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-10 px-4 py-10">
        <section className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white">This is a garden.</h1>
          <p className="text-lg leading-relaxed text-white/75">
            Arabic words grow here. A family is three letters, and the words you keep come from those letters.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">You add one piece. Then you stop.</h2>
          <p className="text-base leading-relaxed text-white/70">
            The plant shows that piece. The next piece stays empty.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Today you learn the letter b.</h2>
          <p className="text-base leading-relaxed text-white/70">You will hear it, then tap it.</p>
        </section>
        <Button asChild size="lg" className="h-12 w-full text-base sm:w-fit">
          <Link href="/lesson/hour-letter">Start with the letter b</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">
      <header className="space-y-2">
        {grewLesson && grewId ? (
          <h1 className="text-3xl font-semibold tracking-tight text-white">{grewLesson.win}</h1>
        ) : (
          <h1 className="text-3xl font-semibold tracking-tight text-white">Your garden</h1>
        )}
        {nextLesson ? (
          <p className="text-base text-white/70">{nextLesson.title} is still open.</p>
        ) : (
          <p className="text-base text-white/70">Every piece here is grown.</p>
        )}
      </header>

      {visible.map((plant) => (
        <FamilyPlant
          key={plant.rootId}
          plant={plant}
          completed={completed}
          deck={deck}
          fsrs={fsrs}
          trees={trees}
          nextId={nextId}
          grewId={grewId}
        />
      ))}

      <p className="text-sm text-white/40">
        <StartOver />
      </p>
    </main>
  );
}
