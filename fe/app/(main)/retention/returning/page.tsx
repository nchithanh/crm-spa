"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { isReturning } from "@/lib/retention";

export default function RetentionReturningPage() {
  return (
    <RetentionCohortPage
      title="Khách quay lại"
      description="completedServiceCount ≥ returningMinVisits"
      showRfmEditor
      pick={(customers, t) => customers.filter((c) => isReturning(c, t))}
    />
  );
}
