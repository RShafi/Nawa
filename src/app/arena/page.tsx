import { SiteHeader } from "@/components/common/SiteHeader";
import { BattleArena } from "@/components/battle/BattleArena";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

export default function ArenaPage() {
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#07080c]" dir="ltr">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.08),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 shrink-0">
        <SiteHeader />
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        <AppStoreHydrator>
          <BattleArena />
        </AppStoreHydrator>
      </div>
    </div>
  );
}
