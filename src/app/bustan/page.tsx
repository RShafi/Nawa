import { getUserDashboardData } from "@/app/actions/progress";
import { SiteHeader } from "@/components/common/SiteHeader";
import { ProgressHydrator } from "@/components/progress/ProgressHydrator";
import { BustanPageClient } from "./bustan-page-client";

export default async function BustanPage() {
  const dashboard = await getUserDashboardData();

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <SiteHeader />
      {dashboard ? (
        <ProgressHydrator data={dashboard}>
          <BustanPageClient />
        </ProgressHydrator>
      ) : (
        <BustanPageClient />
      )}
    </div>
  );
}
