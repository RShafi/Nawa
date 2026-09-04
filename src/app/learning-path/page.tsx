import { PathMap } from "@/components/path/PathMap";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

/** Star Map — celestial learning path. */
export default function LearningPathPage() {
  return (
    <div className="relative w-full flex-1" dir="ltr">
      <AppStoreHydrator force>
        <PathMap />
      </AppStoreHydrator>
    </div>
  );
}
