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
  filterCareTasks,
  normalizeTask,
} from "@/lib/care-utils";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function MyTasksPage() {
  const bundle = useAppStore((s) => s.bundle);
  const completeTask = useAppStore((s) => s.completeTask);
  const updateCareTask = useAppStore((s) => s.updateCareTask);
  const cancelCareTask = useAppStore((s) => s.cancelCareTask);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!bundle) return [];
    return filterCareTasks(bundle.tasks, {
      view: "mine",
      me: bundle.currentUserName,
    });
  }, [bundle]);

  if (!bundle) return null;
  const selected = bundle.tasks.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Công việc của tôi"
        description={`Assignee = ${bundle.currentUserName}`}
        actions={
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              Tất cả việc
            </Button>
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Bạn không có việc mở" />
      ) : (
        <div className="space-y-2">
          {rows.map((raw) => {
            const t = normalizeTask(raw);
            const c = bundle.customers.find((x) => x.id === t.customerId);
            return (
              <Card
                key={t.id}
                className="flex cursor-pointer flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setSelectedId(t.id)}
              >
                <div>
                  <div className="flex flex-wrap gap-1">
                    <Badge status={t.type} label={CARE_TYPE_LABELS[t.type]} />
                    <Badge
                      status={t.priority}
                      label={CARE_PRIORITY_LABELS[t.priority]}
                    />
                  </div>
                  <p className="mt-1 font-semibold">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {c?.fullName} · hạn {formatDateTime(t.dueAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    completeTask(t.id, "Hoàn thành nhanh từ Việc của tôi");
                  }}
                >
                  Xong
                </Button>
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
