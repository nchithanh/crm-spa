"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { careDashboardStats } from "@/lib/care-utils";
import { getCustomerStats, getCareTodayRows } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function CareReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);
  const care = careDashboardStats(bundle);
  const today = getCareTodayRows(bundle);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hiệu quả chăm sóc"
        description="Open / overdue / done · Care Center"
        actions={
          <Link href="/care">
            <Button variant="outline">Care hub</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Open" metric={m.openTasks} />
        <StatCard label="Overdue" metric={m.overdueTasks} />
        <StatCard
          label="Done"
          metric={{
            available: true,
            value: care.done,
            definition: "Tasks done",
          }}
        />
        <StatCard
          label="Care today"
          metric={{
            available: true,
            value: today.length,
            definition: "Queue hôm nay",
          }}
        />
      </div>
      <Card className="p-4 text-sm text-slate-600">
        Chi tiết board/list tại <Link href="/tasks" className="font-semibold text-[var(--brand-600)]">/tasks</Link>.
      </Card>
    </div>
  );
}
