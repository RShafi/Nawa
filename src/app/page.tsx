"use client";

import { SiteHeader } from "@/components/common/SiteHeader";
import { CurriculumMap } from "@/components/curriculum/CurriculumMap";
import { SandboxTools } from "@/components/sandbox/SandboxTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  return (
    <div className="min-h-screen" dir="ltr">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nawā</h1>
          <p className="text-muted-foreground max-w-2xl text-base">
            Follow the learning path — or open the sandbox to play with roots, patterns, and dialects
            freely.
          </p>
        </section>

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
    </div>
  );
}
