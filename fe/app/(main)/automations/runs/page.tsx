"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import type { WorkflowRunStatus } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";

type RunFilter = "all" | WorkflowRunStatus;

const FILTERS: Array<{ value: RunFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "running", label: "Running" },
  { value: "waiting_delay", label: "Waiting delay" },
];

export default function RunsListPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [statusFilter, setStatusFilter] = useState<RunFilter>("all");
  const [wfFilter, setWfFilter] = useState("all");

  const rows = useMemo(() => {
    if (!bundle) return [];
    return bundle.runs.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (wfFilter !== "all" && r.workflowId !== wfFilter) return false;
      return true;
    });
  }, [bundle, statusFilter, wfFilter]);

  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Execution history"
        description="Snapshot version workflow · filter status / workflow"
        actions={
          <Link href="/automations">
            <Button variant="outline">Workflows</Button>
          </Link>
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={statusFilter === f.value ? "default" : "outline"}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <select
          className="h-10 rounded-[10px] border border-slate-200 px-3 text-sm sm:max-w-xs"
          value={wfFilter}
          onChange={(e) => setWfFilter(e.target.value)}
        >
          <option value="all">Mọi workflow</option>
          {bundle.workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Chưa có execution khớp bộ lọc" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => {
              const c = bundle.customers.find((x) => x.id === r.customerId);
              return (
                <li key={r.id}>
                  <Link
                    href={`/automations/runs/${r.id}`}
                    className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {r.workflowName}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          v{r.workflowVersion}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500">
                        {c?.fullName ?? r.customerId} ·{" "}
                        {formatDateTime(r.startedAt)} · {r.steps.length} bước
                      </p>
                    </div>
                    <Badge
                      status={
                        r.status === "failed"
                          ? "failed"
                          : r.status === "succeeded"
                            ? "sent"
                            : "pending"
                      }
                      label={r.status}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
