import { getPathProgress } from "@/app/actions/path";
import { SiteHeader } from "@/components/common/SiteHeader";
import { PathMap } from "@/components/path/PathMap";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

export default async function PathPage() {
  const progress = await getPathProgress();

  return (
    <div className="relative min-h-screen bg-[#07080c]" dir="ltr">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.06),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10">
        <SiteHeader />
        <AppStoreHydrator force>
          <PathMap initialCompletedIds={progress?.completedNodeIds ?? []} />
        </AppStoreHydrator>
      </div>
    </div>
  );
}
