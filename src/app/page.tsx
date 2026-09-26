import { Suspense } from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { GardenHome } from "@/components/garden/GardenHome";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto max-w-lg px-4 py-10">
            <p className="text-sm text-white/50">Loading your words…</p>
          </main>
        }
      >
        <GardenHome />
      </Suspense>
    </div>
  );
}
