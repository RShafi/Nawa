import { getUserDashboardData } from "@/app/actions/progress";
import { SiteHeader } from "@/components/common/SiteHeader";
import { ProgressHydrator } from "@/components/progress/ProgressHydrator";
import { PassportPageClient } from "./passport-page-client";

export default async function PassportPage() {
  const dashboard = await getUserDashboardData();

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <SiteHeader />
      {dashboard ? (
        <ProgressHydrator data={dashboard}>
          <PassportPageClient />
        </ProgressHydrator>
      ) : (
        <PassportPageClient />
      )}
    </div>
  );
}
