"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CARE_PRIORITY_LABELS,
  CARE_TYPE_LABELS,
  normalizeTask,
} from "@/lib/care-utils";
import type { CareTask, VerticalBundle } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const COLS = [
  { id: "overdue", title: "Quá hạn", match: (t: CareTask, now: number) => t.status === "open" && Date.parse(t.dueAt) < now },
  { id: "today", title: "Hôm nay", match: (t: CareTask, now: number) => {
    if (t.status !== "open") return false;
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    const due = Date.parse(t.dueAt);
    return due >= start && due < start + 86_400_000;
  }},
  { id: "later", title: "Sắp tới", match: (t: CareTask, now: number) => {
    if (t.status !== "open") return false;
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return Date.parse(t.dueAt) >= d.getTime() + 86_400_000;
  }},
  { id: "done", title: "Hoàn thành", match: (t: CareTask) => t.status === "done" },
] as const;

export function TaskBoard({
  tasks,
  bundle,
  onSelect,
}: {
  tasks: CareTask[];
  bundle: VerticalBundle;
  onSelect: (id: string) => void;
}) {
  const now = Date.now();
  const normalized = tasks.map(normalizeTask);

  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {COLS.map((col) => {
        const rows = normalized.filter((t) => col.match(t, now));
        return (
          <div key={col.id} className="min-w-0">
            <p className="mb-2 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
              {col.title} · {rows.length}
            </p>
            <div className="space-y-2">
              {rows.slice(0, 12).map((t) => {
                const c = bundle.customers.find((x) => x.id === t.customerId);
                return (
                  <Card
                    key={t.id}
                    className="cursor-pointer p-3 transition hover:border-brand"
                    onClick={() => onSelect(t.id)}
                  >
                    <div className="mb-1 flex flex-wrap gap-1">
                      <Badge status={t.type} label={CARE_TYPE_LABELS[t.type]} />
                      <Badge
                        status={t.priority}
                        label={CARE_PRIORITY_LABELS[t.priority]}
                      />
                    </div>
                    <p className="text-sm font-semibold leading-snug">{t.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      <Link
                        href={`/customers/${t.customerId}`}
                        className="font-medium text-[var(--brand-600)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c?.fullName ?? "—"}
                      </Link>
                      {" · "}
                      {t.assigneeName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDateTime(t.dueAt)}
                    </p>
                  </Card>
                );
              })}
              {rows.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  Trống
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
