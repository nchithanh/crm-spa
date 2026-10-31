"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { inactiveForCare } from "@/lib/care-utils";
import { daysSince } from "@/lib/metrics";
import { useAppStore } from "@/stores/app-store";

export default function CareInactivePage() {
  const bundle = useAppStore((s) => s.bundle);
  const createCareTask = useAppStore((s) => s.createCareTask);

  const list = useMemo(
    () => (bundle ? inactiveForCare(bundle.customers) : []),
    [bundle],
  );

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Khách lâu chưa quay lại"
        description="Rule demo: đã từng DV và >60 ngày chưa ghé — không phải churn AI"
      />
      {list.length === 0 ? (
        <EmptyState title="Không có khách theo rule này" />
      ) : (
        <div className="space-y-2">
          {list.slice(0, 40).map((c) => (
            <Card
              key={c.id}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/customers/${c.id}`}
                  className="font-semibold text-[var(--brand-600)]"
                >
                  {c.fullName}
                </Link>
                <p className="text-xs text-slate-500">
                  {daysSince(c.lastVisitAt)} ngày chưa ghé · {c.assigneeName}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  createCareTask({
                    customerId: c.id,
                    title: "Win-back — hỏi lý do lâu chưa ghé",
                    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
                    assigneeName: c.assigneeName || bundle.currentUserName,
                    type: "rebooking",
                    priority: "high",
                  })
                }
              >
                Tạo win-back
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
