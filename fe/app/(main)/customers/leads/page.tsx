"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getLeadCustomers, SOURCE_LABELS } from "@/lib/customer-utils";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function CustomerLeadsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const leads = useMemo(
    () => (bundle ? getLeadCustomers(bundle.customers) : []),
    [bundle],
  );

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Khách hàng tiềm năng"
        description="Lead = chưa hoàn thành dịch vụ lần nào (completedServiceCount = 0)"
        actions={
          <Link href="/customers/new">
            <Button>Thêm lead</Button>
          </Link>
        }
      />
      {leads.length === 0 ? (
        <EmptyState
          title="Không có lead"
          description="Mọi khách đều đã có ít nhất 1 lần DV."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {leads.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{c.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {c.code} · {c.phone} · Tạo/ghé{" "}
                      {formatDate(c.firstVisitAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={c.status} />
                    <span className="text-xs text-slate-500">
                      {SOURCE_LABELS[c.source ?? "other"]}
                    </span>
                    <span className="text-xs text-slate-600">
                      {c.assigneeName || "Chưa gán"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
