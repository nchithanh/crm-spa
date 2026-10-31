"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { isLoyal } from "@/lib/retention";

export default function RetentionLoyalPage() {
  return (
    <RetentionCohortPage
      title="Khách trung thành"
      description="Frequency cao nhưng chưa VIP — ngưỡng RFM có thể chỉnh"
      showRfmEditor
      pick={(customers, t) => customers.filter((c) => isLoyal(c, t))}
    />
  );
}
