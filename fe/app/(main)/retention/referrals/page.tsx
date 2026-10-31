"use client";

import { RetentionCohortPage } from "@/components/retention/cohort-page";

export default function RetentionReferralsPage() {
  return (
    <RetentionCohortPage
      title="Giới thiệu khách hàng"
      description="source = referral (tracking mock)"
      pick={(customers) =>
        customers.filter((c) => c.source === "referral")
      }
    />
  );
}
