"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { isInactiveCohort } from "@/lib/retention";

export default function RetentionInactivePage() {
  return (
    <RetentionCohortPage
      title="Khách lâu chưa quay lại / inactive"
      description="status inactive hoặc > inactiveDays chưa ghé"
      showRfmEditor
      pick={(customers, t) =>
        customers.filter((c) => isInactiveCohort(c, t))
      }
    />
  );
}
