import { SiteHeader } from "@/components/common/SiteHeader";
import { PassportPageClient } from "../passport/passport-page-client";

export default function PassportsPage() {
  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <SiteHeader />
      <PassportPageClient />
    </div>
  );
}
