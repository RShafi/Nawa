import { SiteHeader } from "@/components/common/SiteHeader";
import { GardenHome } from "@/components/garden/GardenHome";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <GardenHome />
    </div>
  );
}
