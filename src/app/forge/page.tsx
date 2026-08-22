import { SiteHeader } from "@/components/common/SiteHeader";
import { ForgePageClient } from "./forge-page-client";

export default function ForgePage() {
  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <SiteHeader />
      <ForgePageClient />
    </div>
  );
}
