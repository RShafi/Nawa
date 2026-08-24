import { SiteHeader } from "@/components/common/SiteHeader";
import { PathMap } from "@/components/path/PathMap";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

export default function PathPage() {
  return (
    <div className="bg-obsidian relative flex h-[100dvh] flex-col overflow-hidden lg:h-full" dir="ltr">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(56,189,248,0.06),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 shrink-0">
        <SiteHeader />
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        <AppStoreHydrator force>
          <PathMap />
        </AppStoreHydrator>
      </div>
    </div>
  );
}
