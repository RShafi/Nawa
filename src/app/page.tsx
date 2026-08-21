"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { LearningPath } from "@/components/curriculum/LearningPath";
import { DialectBridgeCard } from "@/components/dialect/DialectBridgeCard";
import { PatternMatrix } from "@/components/morph/PatternMatrix";
import { RootSelector } from "@/components/morph/RootSelector";
import { WordAssemblyCard } from "@/components/morph/WordAssemblyCard";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNawaStore } from "@/store/nawa-store";

const WALKTHROUGH = [
  { step: "1", title: "Pick a path", body: "Follow the curriculum nodes from phonetics to dialect." },
  { step: "2", title: "Assemble morphology", body: "Slot a root into a وزن and watch the word form." },
  { step: "3", title: "Bridge dialects", body: "Compare فصحى with Levantine and Egyptian." },
];

export default function HomePage() {
  const scrollTarget = useNawaStore((s) => s.scrollTarget);
  const clearScrollTarget = useNawaStore((s) => s.clearScrollTarget);

  useEffect(() => {
    if (!scrollTarget) return;
    const id = scrollTarget === "path" ? "path" : scrollTarget;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const timer = window.setTimeout(() => clearScrollTarget(), 1400);
    return () => window.clearTimeout(timer);
  }, [scrollTarget, clearScrollTarget]);

  return (
    <div className="min-h-screen" dir="ltr">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        <section className="space-y-3">
          <p className="text-muted-foreground text-sm tracking-wide uppercase">Arabic morphology studio</p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Learn from the root — جذر و وزن
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            Nawā is built around Semitic root-and-pattern structure, dynamic tashkeel, and a dual track
            between Modern Standard Arabic and spoken dialects.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {WALKTHROUGH.map((item) => (
            <Card key={item.step} className="py-4">
              <CardContent className="flex gap-3 px-4">
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {item.step}
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm">{item.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="path" className="scroll-mt-24">
          <LearningPath />
        </section>

        <Separator />

        <section id="morph" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Morph Engine</h2>
            <p className="text-muted-foreground text-sm">
              Interactive root-and-pattern visualizer with animated slotting.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-8 pt-2">
                <RootSelector />
                <Separator />
                <PatternMatrix />
              </CardContent>
            </Card>
            <WordAssemblyCard />
          </div>
        </section>

        <section id="dialect" className="scroll-mt-24 space-y-4 pb-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dialect Bridge</h2>
            <p className="text-muted-foreground text-sm">MSA beside Levantine and Egyptian for the same idea.</p>
          </div>
          <DialectBridgeCard />
        </section>
      </main>
    </div>
  );
}
