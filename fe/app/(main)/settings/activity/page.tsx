"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { ActivityLogKind } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const FILTERS: Array<"all" | ActivityLogKind> = [
  "all",
  "campaign",
  "zalo",
  "workflow",
  "settings",
  "system",
];

export default function ActivityLogPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [filter, setFilter] = useState<"all" | ActivityLogKind>("all");

  const rows = useMemo(() => {
    if (!bundle) return [];
    const list = [...(bundle.activityLog ?? [])].sort((a, b) =>
      b.at.localeCompare(a.at),
    );
    if (filter === "all") return list;
    return list.filter((e) => e.kind === filter);
  }, [bundle, filter]);

  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Nhật ký hoạt động"
        description="Activity log mock · ghi khi toggle OA/POS/Ops · launch campaign"
      />
      <Card className="mb-4 flex flex-wrap gap-2 p-3">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </Card>
      {rows.length === 0 ? (
        <EmptyState title="Chưa có activity" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((e) => (
              <li key={e.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{e.title}</p>
                  <Badge status="pending" label={e.kind} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{e.detail}</p>
                <p className="text-xs text-slate-400">
                  {e.actorName} · {formatDateTime(e.at)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
