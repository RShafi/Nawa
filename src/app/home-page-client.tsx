"use client";

import Link from "next/link";
import { Flame, Leaf } from "lucide-react";
import { CurriculumMap } from "@/components/curriculum/CurriculumMap";
import { SandboxTools } from "@/components/sandbox/SandboxTools";
import { DailyReviewWidget } from "@/components/srs/DailyReviewWidget";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomePageClient() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nawā</h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Follow the learning path — or open the sandbox to play with roots, patterns, and dialects
          freely.
        </p>
      </section>

      <DailyReviewWidget />

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          asChild
          variant="outline"
          className="h-auto justify-start gap-3 border-emerald-700/40 bg-emerald-950/30 px-4 py-4"
        >
          <Link href="/bustan">
            <Leaf className="size-5 text-emerald-400" />
            <span className="text-start">
              <span className="block font-semibold">The Bustān</span>
              <span className="text-muted-foreground text-xs font-normal">
                Grow your root orchard
              </span>
            </span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto justify-start gap-3 border-orange-600/40 bg-orange-950/30 px-4 py-4"
        >
          <Link href="/forge">
            <Flame className="size-5 text-orange-400" />
            <span className="text-start">
              <span className="block font-semibold">Morph Forge</span>
              <span className="text-muted-foreground text-xs font-normal">
                60-second pattern arcade
              </span>
            </span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="path" className="gap-6">
        <TabsList className="h-10">
          <TabsTrigger value="path" className="px-4">
            Learning Path
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="px-4">
            Sandbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="path">
          <CurriculumMap />
        </TabsContent>

        <TabsContent value="sandbox">
          <SandboxTools />
        </TabsContent>
      </Tabs>
    </main>
  );
}
