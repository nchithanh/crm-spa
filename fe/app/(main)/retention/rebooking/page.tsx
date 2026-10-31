"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";
import { rebookingOpportunities } from "@/lib/retention";
import { useAppStore } from "@/stores/app-store";

export default function RetentionRebookingPage() {
  const bundle = useAppStore((s) => s.bundle);
  return (
    <RetentionCohortPage
      title="Cơ hội tái đặt lịch"
      description="Đã từng DV · ≥20 ngày · không có booking sắp tới"
      pick={() => (bundle ? rebookingOpportunities(bundle) : [])}
    />
  );
}
