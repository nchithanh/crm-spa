"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCareTasksByStaff } from "@/lib/selectors";
import { revenueByTechnician } from "@/lib/report-ops";
import { formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function StaffReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const staff = bundle.team.filter(
    (t) => t.role === "staff" || t.role === "manager",
  );
  const techs = bundle.team.filter((t) => t.role === "technician");
  const byTech = revenueByTechnician(bundle, techs);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hiệu suất nhân viên chăm sóc"
        description="Task open theo NV · DT KTV mock"
        actions={
          <Link href="/settings/team">
            <Button variant="outline">Team</Button>
          </Link>
        }
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-bold">Care tasks (open) theo NV</h2>
          <ul className="space-y-2 text-sm">
            {staff.map((s) => {
              const open = getCareTasksByStaff(bundle, s.name).filter(
                (t) => t.status === "open",
              ).length;
              return (
                <li key={s.id} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="font-semibold tabular-nums">{open}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-bold">DT mock theo KTV</h2>
          <ul className="space-y-2 text-sm">
            {byTech.map((r) => (
              <li key={r.name} className="flex justify-between gap-2">
                <span className="truncate">
                  {r.name} <span className="text-slate-400">×{r.count}</span>
                </span>
                <span className="font-semibold tabular-nums">
                  {formatVnd(r.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
