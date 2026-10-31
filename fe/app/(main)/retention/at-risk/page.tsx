"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { isAtRisk } from "@/lib/retention";

export default function RetentionAtRiskPage() {
  return (
    <RetentionCohortPage
      title="Nguy cơ rời bỏ"
      description="Đã từng DV · trong khoảng at-risk → inactive (ngày) — rule-based, không AI churn"
      showRfmEditor
      pick={(customers, t) => customers.filter((c) => isAtRisk(c, t))}
    />
  );
}
