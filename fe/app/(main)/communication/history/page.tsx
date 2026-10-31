"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { MessageStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

type Filter = "all" | MessageStatus | "campaign";

export default function MessageHistoryPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (!bundle) return [];
    return bundle.messages.filter((m) => {
      if (filter === "all") return true;
      if (filter === "campaign") return Boolean(m.campaignId);
      return m.status === filter;
    });
  }, [bundle, filter]);

  if (!bundle) return null;

  const failedCount = bundle.messages.filter((m) => m.status === "failed")
    .length;

  return (
    <div>
      <PageHeader
        title="Lịch sử tin nhắn"
        description={`Failed: ${failedCount} · filter theo status / campaign`}
        actions={
          <>
            <Link href="/communication">
              <Button variant="outline">Soạn tin</Button>
            </Link>
            <Link href="/communication?failed=1">
              <Button variant="danger">Composer · xem lỗi</Button>
            </Link>
          </>
        }
      />

      <Card className="mb-4 flex flex-wrap gap-2 p-3">
        {(
          [
            ["all", "Tất cả"],
            ["sent", "Sent"],
            ["failed", "Failed"],
            ["pending", "Pending"],
            ["campaign", "Từ campaign"],
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
        <EmptyState title="Không có tin khớp bộ lọc" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((m) => {
              const c = bundle.customers.find((x) => x.id === m.customerId);
              const t = bundle.templates.find((x) => x.id === m.templateId);
              const camp = m.campaignId
                ? bundle.campaigns?.find((x) => x.id === m.campaignId)
                : null;
              return (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/customers/${m.customerId}`}
                      className="font-semibold text-[var(--brand-600)]"
                    >
                      {c?.fullName ?? m.customerId}
                    </Link>
                    <Badge status={m.status} />
                    {camp ? (
                      <Badge status="pending" label={camp.name} />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {t?.name ?? m.templateId} · {formatDateTime(m.sentAt)}
                  </p>
                  {m.error ? (
                    <p className="mt-1 text-xs text-rose-600">{m.error}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
