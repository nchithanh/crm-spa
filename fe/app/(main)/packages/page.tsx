"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

type Filter = "all" | "active" | "low" | "exhausted" | "expired";

export default function PackagesPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (!bundle) return [];
    return (bundle.packages ?? []).filter((p) => {
      if (filter === "all") return true;
      if (filter === "low") {
        return (
          p.status === "active" &&
          p.remainingSessions > 0 &&
          p.remainingSessions <= 2
        );
      }
      return p.status === filter;
    });
  }, [bundle, filter]);

  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Liệu trình / gói còn lại"
        description="CustomerPackage mock · không booking engine mới"
        actions={
          <Link href="/services">
            <Button variant="outline">Catalog</Button>
          </Link>
        }
      />

      <Card className="mb-4 flex flex-wrap gap-2 p-3">
        {(
          [
            ["all", "Tất cả"],
            ["active", "Active"],
            ["low", "≤2 buổi"],
            ["exhausted", "Hết buổi"],
            ["expired", "Hết hạn"],
          ] as const
        ).map(([v, label]) => (
          <Button
            key={v}
            size="sm"
            variant={filter === v ? "default" : "outline"}
            onClick={() => setFilter(v)}
          >
            {label}
          </Button>
        ))}
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Không có gói khớp" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((p) => {
              const c = bundle.customers.find((x) => x.id === p.customerId);
              return (
                <li key={p.id}>
                  <Link
                    href={`/customers/${p.customerId}`}
                    className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{p.serviceName}</p>
                      <p className="text-sm text-slate-500">
                        {c?.fullName ?? p.customerId} · còn{" "}
                        {p.remainingSessions}/{p.totalSessions} ·{" "}
                        {formatVnd(p.paidVnd)}
                      </p>
                    </div>
                    <Badge status={p.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
