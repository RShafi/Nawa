import { PathMap } from "@/components/path/PathMap";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";

export default function PathPage() {
  return (
    <div className="relative w-full flex-1" dir="ltr">
      <AppStoreHydrator force>
        <PathMap />
      </AppStoreHydrator>
    </div>
  );
}
