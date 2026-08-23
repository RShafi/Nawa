import { SiteHeader } from "@/components/common/SiteHeader";
import { ReviewPageClient } from "./review-page-client";

export default function ReviewPage() {
  return (
    <div className="min-h-screen" dir="ltr">
      <SiteHeader />
      <ReviewPageClient />
    </div>
  );
}
