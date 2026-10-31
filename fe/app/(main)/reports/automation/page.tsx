"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { getWorkflowStats } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function AutomationReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const wf = getWorkflowStats(bundle);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hiệu quả Automation"
        description="Workflow success/fail từ selectors"
        actions={
          <Link href="/automations/runs">
            <Button variant="outline">Executions</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Active WF" metric={wf.active} />
        <StatCard label="Run hôm nay" metric={wf.executionsToday} />
        <StatCard label="Succeeded" metric={wf.succeeded} />
        <StatCard label="Failed" metric={wf.failed} />
      </div>
    </div>
  );
}
