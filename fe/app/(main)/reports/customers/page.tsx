"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { getCustomerStats, getAtRiskCustomers, getInactiveCustomers } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function CustomersReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);
  const byStatus = bundle.customers.reduce<Record<string, number>>((a, c) => {
    a[c.status] = (a[c.status] ?? 0) + 1;
    return a;
  }, {});

  return (
    <div className="space-y-4">
      <PageHeader
        title="Phân tích khách hàng"
        description="Status mix · at-risk · inactive"
        actions={
          <Link href="/customers">
            <Button variant="outline">Directory</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Tổng" metric={m.totalCustomers} />
        <StatCard label="At-risk" metric={m.atRiskCustomers} />
        <StatCard
          label="Inactive"
          metric={{
            available: true,
            value: getInactiveCustomers(bundle).length,
            definition: "Rule inactive",
          }}
        />
        <StatCard
          label="At-risk list"
          metric={{
            available: true,
            value: getAtRiskCustomers(bundle).length,
            definition: "Selector",
          }}
        />
      </div>
      <Card className="p-4">
        <h2 className="mb-2 text-sm font-bold">Theo status</h2>
        <ul className="space-y-2 text-sm">
          {Object.entries(byStatus).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{k}</span>
              <span className="font-semibold">{v}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
