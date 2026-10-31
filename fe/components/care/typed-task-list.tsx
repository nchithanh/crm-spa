"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TaskDetailDrawer } from "@/components/care/task-detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  CARE_PRIORITY_LABELS,
  CARE_TYPE_LABELS,
  normalizeTask,
} from "@/lib/care-utils";
import type { CareTaskType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function TypedTaskListPage({
  title,
  description,
  taskType,
  createDefaultTitle,
}: {
  title: string;
  description: string;
  taskType: CareTaskType;
  createDefaultTitle: string;
}) {
  const bundle = useAppStore((s) => s.bundle);
  const createCareTask = useAppStore((s) => s.createCareTask);
  const completeTask = useAppStore((s) => s.completeTask);
  const updateCareTask = useAppStore((s) => s.updateCareTask);
  const cancelCareTask = useAppStore((s) => s.cancelCareTask);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");

  const rows = useMemo(() => {
    if (!bundle) return [];
    return bundle.tasks
      .map(normalizeTask)
      .filter((t) => t.type === taskType && t.status === "open")
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }, [bundle, taskType]);

  if (!bundle) return null;
  const selected = bundle.tasks.find((t) => t.id === selectedId) ?? null;
  const cus = customerId || bundle.customers[0]?.id || "";

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              Care Center
            </Button>
          </Link>
        }
      />
      <Card className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <select
          className="h-10 flex-1 rounded-[10px] border border-slate-200 px-2 text-sm"
          value={cus}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          {bundle.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={() => {
            if (!cus) return;
            createCareTask({
              customerId: cus,
              title: createDefaultTitle,
              dueAt: new Date(Date.now() + 86400000).toISOString(),
              assigneeName: bundle.currentUserName,
              type: taskType,
              priority: taskType === "complaint" ? "urgent" : "medium",
            });
          }}
        >
          Tạo việc {CARE_TYPE_LABELS[taskType]}
        </Button>
      </Card>
      {rows.length === 0 ? (
        <EmptyState title="Không có việc mở loại này" />
      ) : (
        <div className="space-y-2">
          {rows.map((t) => {
            const c = bundle.customers.find((x) => x.id === t.customerId);
            return (
              <Card
                key={t.id}
                className="cursor-pointer p-3 hover:border-brand"
                onClick={() => setSelectedId(t.id)}
              >
                <div className="flex flex-wrap gap-1">
                  <Badge
                    status={t.priority}
                    label={CARE_PRIORITY_LABELS[t.priority]}
                  />
                </div>
                <p className="mt-1 font-semibold">{t.title}</p>
                <p className="text-xs text-slate-500">
                  {c?.fullName} · {t.assigneeName} · {formatDateTime(t.dueAt)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
      <TaskDetailDrawer
        task={selected}
        bundle={bundle}
        onClose={() => setSelectedId(null)}
        onComplete={(id, note) => {
          completeTask(id, note);
          setSelectedId(null);
        }}
        onCancel={(id, note) => {
          cancelCareTask(id, note);
          setSelectedId(null);
        }}
        onSave={(id, patch) => updateCareTask(id, patch)}
      />
    </div>
  );
}
