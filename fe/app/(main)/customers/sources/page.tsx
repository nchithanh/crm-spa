"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SOURCE_LABELS } from "@/lib/customer-utils";
import type { CustomerSource } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";

export default function CustomerSourcesPage() {
  const bundle = useAppStore((s) => s.bundle);

  const rows = useMemo(() => {
    if (!bundle) return [];
    const map = new Map<CustomerSource, number>();
    for (const key of Object.keys(SOURCE_LABELS) as CustomerSource[]) {
      map.set(key, 0);
    }
    for (const c of bundle.customers) {
      const s = (c.source ?? "other") as CustomerSource;
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    const total = bundle.customers.length || 1;
    return [...map.entries()]
      .map(([source, count]) => ({
        source,
        label: SOURCE_LABELS[source],
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [bundle]);

  if (!bundle) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nguồn khách hàng"
        description="Phân bổ theo source trên mock dataset thống nhất"
        actions={
          <Link href="/customers">
            <Button variant="outline">Directory</Button>
          </Link>
        }
      />
      <div className="space-y-2">
        {rows.map((r) => (
          <Card key={r.source} className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold">{r.label}</p>
              <p className="text-sm tabular-nums text-slate-600">
                {r.count} · {r.pct}%
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[var(--brand-500)]"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
            <Link
              href="/customers"
              className="mt-2 inline-block text-xs font-semibold text-[var(--brand-600)]"
            >
              Xem trong directory (lọc Nguồn trên bộ lọc)
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
