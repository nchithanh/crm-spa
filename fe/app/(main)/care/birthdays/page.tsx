"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { customersNeedingBirthdayCare } from "@/lib/care-utils";
import { useAppStore } from "@/stores/app-store";

export default function CareBirthdaysPage() {
  const bundle = useAppStore((s) => s.bundle);
  const createCareTask = useAppStore((s) => s.createCareTask);

  const list = useMemo(
    () => (bundle ? customersNeedingBirthdayCare(bundle.customers) : []),
    [bundle],
  );

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sinh nhật khách hàng"
        description="Rule demo: SN trong 14 ngày tới — không phải AI"
      />
      {list.length === 0 ? (
        <EmptyState title="Không có SN trong 14 ngày" />
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
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
                  SN {c.birthday} · {c.assigneeName}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  createCareTask({
                    customerId: c.id,
                    title: `Chúc mừng sinh nhật ${c.fullName}`,
                    dueAt: new Date(Date.now() + 86400000).toISOString(),
                    assigneeName: c.assigneeName || bundle.currentUserName,
                    type: "birthday",
                    priority: "medium",
                  })
                }
              >
                Tạo việc SN
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
