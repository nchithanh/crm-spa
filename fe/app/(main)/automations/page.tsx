"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import type { WorkflowStatus } from "@/lib/types";

const STATUS_FILTERS: Array<{ value: "all" | WorkflowStatus; label: string }> =
  [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "draft", label: "Draft" },
  ];

export default function AutomationsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const setWorkflowStatus = useAppStore((s) => s.setWorkflowStatus);
  const createWorkflowDraft = useAppStore((s) => s.createWorkflowDraft);
  const cloneWorkflow = useAppStore((s) => s.cloneWorkflow);
  const deleteWorkflow = useAppStore((s) => s.deleteWorkflow);
  const router = useRouter();
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStatus>(
    "all",
  );
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!bundle) return [];
    const needle = q.trim().toLowerCase();
    return bundle.workflows.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        w.name.toLowerCase().includes(needle) ||
        w.trigger.toLowerCase().includes(needle)
      );
    });
  }, [bundle, statusFilter, q]);

  if (!bundle) return null;

  const toggle = (id: string, status: WorkflowStatus) => {
    if (status === "active") {
      setWorkflowStatus(id, "paused");
      setErr("");
      return;
    }
    const res = setWorkflowStatus(id, "active");
    setErr(res.ok ? "" : res.errors.join("; "));
  };

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Workflow Builder · clone/xóa · filter · execution history"
        actions={
          <>
            <Link href="/automations/runs">
              <Button variant="outline">Executions</Button>
            </Link>
            <Button
              onClick={() => {
                const id = createWorkflowDraft();
                if (id) router.push(`/automations/${id}`);
              }}
            >
              Tạo workflow
            </Button>
          </>
        }
      />

      {err ? (
        <Card className="mb-3 border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </Card>
      ) : null}

      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={statusFilter === f.value ? "default" : "outline"}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {f.value !== "all" ? (
                <span className="ml-1 text-[10px] opacity-80">
                  (
                  {
                    bundle.workflows.filter((w) => w.status === f.value)
                      .length
                  }
                  )
                </span>
              ) : null}
            </Button>
          ))}
        </div>
        <input
          className="h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm sm:max-w-xs"
          placeholder="Tìm tên / trigger…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Không có workflow khớp bộ lọc" />
      ) : (
        <div className="space-y-3">
          {rows.map((w) => (
            <Card
              key={w.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{w.name}</p>
                  <Badge status={w.status} />
                  <span className="text-xs text-slate-400">v{w.version}</span>
                  {w.errorCount > 0 ? (
                    <Badge status="failed" label={`${w.errorCount} lỗi`} />
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Trigger: {w.trigger} · {w.nodeCount} node · cập nhật{" "}
                  {formatDateTime(w.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {w.status === "draft" ? (
                  <Button size="sm" onClick={() => toggle(w.id, "draft")}>
                    Activate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={w.status === "active" ? "outline" : "default"}
                    onClick={() => toggle(w.id, w.status)}
                  >
                    {w.status === "active" ? "Pause" : "Activate"}
                  </Button>
                )}
                <Link href={`/automations/${w.id}`}>
                  <Button size="sm" variant="secondary">
                    Mở canvas
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const id = cloneWorkflow(w.id);
                    if (id) {
                      setErr("");
                      router.push(`/automations/${id}`);
                    }
                  }}
                >
                  Clone
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Xóa workflow «${w.name}»? (draft/paused an toàn hơn; active cũng xóa được ở mock)`,
                      )
                    ) {
                      return;
                    }
                    deleteWorkflow(w.id);
                    setErr("");
                  }}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
