"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { getCustomerStats, getRebookingOpportunities, getInactiveCount } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function RetentionReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);
  const rebook = getRebookingOpportunities(bundle).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tỷ lệ khách quay lại"
        description="Retention KPIs từ selectors"
        actions={
          <Link href="/retention/effectiveness">
            <Button variant="outline">Hiệu quả giữ chân</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Rebooking rate" metric={m.rebookingRate} />
        <StatCard label="Returning" metric={m.returningCustomers} />
        <StatCard label="At-risk" metric={m.atRiskCustomers} />
        <StatCard
          label="Inactive / tái đặt"
          metric={{
            available: true,
            value: getInactiveCount(bundle),
            definition: `Inactive; rebook opp ${rebook}`,
          }}
        />
      </div>
    </div>
  );
}
