"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import {
  getAtRiskCustomers,
  getCustomerStats,
  getInactiveCount,
  getRebookingOpportunities,
} from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function InsightsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Insights"
        description="Tóm tắt từ selectors · chi tiết trên Dashboard / Retention"
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Tổng KH" metric={m.totalCustomers} href="/customers" />
        <StatCard label="Mới 30d" metric={m.newCustomers30d} />
        <StatCard label="At-risk" metric={m.atRiskCustomers} href="/retention/at-risk" />
        <StatCard
          label="Inactive"
          metric={{
            available: true,
            value: getInactiveCount(bundle),
            definition: "Rule inactive",
          }}
          href="/retention/inactive"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 text-sm">
          <p className="font-bold">At-risk sample</p>
          <ul className="mt-2 space-y-1">
            {getAtRiskCustomers(bundle)
              .slice(0, 5)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/customers/${c.id}`}
                    className="text-[var(--brand-600)]"
                  >
                    {c.fullName}
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
        <Card className="p-4 text-sm">
          <p className="font-bold">
            Tái đặt ({getRebookingOpportunities(bundle).length})
          </p>
          <Link
            href="/bookings/rebooking"
            className="mt-2 inline-block text-xs font-semibold text-[var(--brand-600)]"
          >
            Xem danh sách
          </Link>
        </Card>
      </div>
    </div>
  );
}
