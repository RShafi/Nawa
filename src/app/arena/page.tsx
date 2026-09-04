import { BattleArena } from "@/components/battle/BattleArena";
import { ArenaHub } from "@/components/arena/ArenaHub";
import { TheForge } from "@/components/arena/TheForge";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

/** Arena modes: hub (default), Crucible, or Pattern Forge via `?trialId=`. */
export default async function ArenaPage({
  searchParams,
}: {
  searchParams: Promise<{ trialId?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const trialId = params.trialId?.trim() || null;
  const mode = params.mode?.trim().toLowerCase() || null;

  let content: React.ReactNode;
  if (trialId) {
    content = <TheForge trialId={trialId} />;
  } else if (mode === "crucible") {
    content = <BattleArena />;
  } else {
    content = <ArenaHub />;
  }

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden"
      dir="ltr"
    >
      <div className="relative z-10 min-h-0 w-full flex-1 overflow-hidden">
        <AppStoreHydrator>{content}</AppStoreHydrator>
      </div>
    </div>
  );
}
