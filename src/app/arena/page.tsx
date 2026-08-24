import { SiteHeader } from "@/components/common/SiteHeader";
import { BattleArena } from "@/components/battle/BattleArena";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

/**
 * Arena shell — header + Safe Canvas stage (stage scrolls when content overflows).
 */
export default function ArenaPage() {
  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#0B0F19]" dir="ltr">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 shrink-0">
        <SiteHeader />
      </div>
      <div className="relative z-10 min-h-0 w-full flex-1 overflow-hidden">
        <AppStoreHydrator>
          <BattleArena />
        </AppStoreHydrator>
      </div>
    </div>
  );
}
