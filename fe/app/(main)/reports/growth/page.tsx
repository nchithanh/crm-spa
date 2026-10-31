"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { daysSince } from "@/lib/metrics";
import { getCustomerStats } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function GrowthReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);

  const buckets = [7, 30, 90].map((d) => ({
    d,
    n: bundle.customers.filter((c) => daysSince(c.firstVisitAt) <= d).length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tăng trưởng khách hàng"
        description="Metric từ selectors · firstVisitAt"
        actions={
          <Link href="/reports">
            <Button variant="outline">Tổng quan BC</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Tổng KH" metric={m.totalCustomers} />
        <StatCard label="Mới 30 ngày" metric={m.newCustomers30d} />
        <StatCard label="Quay lại" metric={m.returningCustomers} />
        <StatCard label="Tái đặt" metric={m.rebookingRate} />
      </div>
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold">Khách mới theo cửa sổ</h2>
        <ul className="space-y-2 text-sm">
          {buckets.map((b) => (
            <li key={b.d} className="flex justify-between">
              <span>≤ {b.d} ngày</span>
              <span className="font-semibold tabular-nums">{b.n}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
