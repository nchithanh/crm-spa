"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { isVip } from "@/lib/retention";

export default function RetentionVipPage() {
  return (
    <RetentionCohortPage
      title="Khách VIP"
      description="status=vip hoặc đạt ngưỡng visits/spend (RFM demo)"
      showRfmEditor
      pick={(customers, t, pos) =>
        customers.filter((c) => isVip(c, t, pos))
      }
    />
  );
}
