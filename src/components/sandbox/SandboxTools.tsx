"use client";

import { DialectBridgeCard } from "@/components/dialect/DialectBridgeCard";
import { MorphStudio } from "@/components/morph/MorphStudio";
import { PatternMatrix } from "@/components/morph/PatternMatrix";
import { RootSelector } from "@/components/morph/RootSelector";
import { WordAssemblyCard } from "@/components/morph/WordAssemblyCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Free-play tools outside the guided subway path. */
export function SandboxTools() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sandbox</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm sm:text-base">
          Freely explore the Morph Engine and Dialect Bridge without following the curriculum. Your
          progress on the Learning Path is unchanged.
        </p>
      </div>

      <Tabs defaultValue="morph" className="gap-4">
        <TabsList>
          <TabsTrigger value="morph">Morph Engine</TabsTrigger>
          <TabsTrigger value="dialect">Dialect Bridge</TabsTrigger>
          <TabsTrigger value="classic">Classic layout</TabsTrigger>
        </TabsList>

        <TabsContent value="morph" className="space-y-3">
          <MorphStudio />
        </TabsContent>

        <TabsContent value="dialect">
          <DialectBridgeCard />
        </TabsContent>

        <TabsContent value="classic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classic Morph layout</CardTitle>
              <CardDescription>Root picker, pattern matrix, and assembly side by side.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-6">
                  <RootSelector />
                  <Separator />
                  <PatternMatrix />
                </div>
                <WordAssemblyCard guided={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
