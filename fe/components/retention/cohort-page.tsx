"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  DEFAULT_RFM,
  loadRfmThresholds,
  type RfmThresholds,
  saveRfmThresholds,
} from "@/lib/retention";
import type { Customer } from "@/lib/types";
import { daysSince } from "@/lib/metrics";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function RetentionCohortPage({
  title,
  description,
  pick,
  showRfmEditor,
}: {
  title: string;
  description: string;
  pick: (customers: Customer[], t: RfmThresholds, pos: boolean) => Customer[];
  showRfmEditor?: boolean;
}) {
  const bundle = useAppStore((s) => s.bundle);
  const createCareTask = useAppStore((s) => s.createCareTask);
  const [t, setT] = useState<RfmThresholds>(DEFAULT_RFM);

  useEffect(() => {
    setT(loadRfmThresholds());
  }, []);

  const rows = useMemo(() => {
    if (!bundle) return [];
    return pick(bundle.customers, t, bundle.posConnected);
  }, [bundle, t, pick]);

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={`${description} · Rule-based demo (không phải AI)`}
        actions={
          <Link href="/retention/effectiveness">
            <Button variant="outline" size="sm">
              Hiệu quả giữ chân
            </Button>
          </Link>
        }
      />

      {showRfmEditor ? (
        <Card className="grid gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["vipMinVisits", "VIP ≥ lần DV"],
              ["vipMinSpend", "VIP ≥ chi tiêu"],
              ["loyalMinVisits", "Loyal ≥ lần"],
              ["atRiskDays", "At-risk > ngày"],
              ["inactiveDays", "Inactive > ngày"],
              ["returningMinVisits", "Returning ≥ lần"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="text-[10px] font-bold text-slate-400 uppercase"
            >
              {label}
              <input
                type="number"
                className="mt-1 h-9 w-full rounded-[10px] border border-slate-200 px-2 text-sm font-medium text-slate-800"
                value={t[key]}
                onChange={(e) =>
                  setT((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
          ))}
          <div className="flex items-end sm:col-span-3 lg:col-span-6">
            <Button
              size="sm"
              onClick={() => {
                saveRfmThresholds(t);
              }}
            >
              Lưu ngưỡng RFM (localStorage)
            </Button>
          </div>
        </Card>
      ) : null}

      <p className="text-sm text-slate-500">{rows.length} khách</p>

      {rows.length === 0 ? (
        <EmptyState title="Không có khách theo rule hiện tại" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.slice(0, 60).map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-semibold text-[var(--brand-600)]"
                  >
                    {c.fullName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {c.code} · {c.completedServiceCount} DV · ghé{" "}
                    {formatDate(c.lastVisitAt)} (
                    {daysSince(c.lastVisitAt)} ngày) · {c.assigneeName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={c.status} />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      createCareTask({
                        customerId: c.id,
                        title: `Care từ ${title}`,
                        dueAt: new Date(
                          Date.now() + 86400000,
                        ).toISOString(),
                        assigneeName:
                          c.assigneeName || bundle.currentUserName,
                        type: "rebooking",
                        priority: "medium",
                      })
                    }
                  >
                    Tạo care
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
