"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import {
  CAMPAIGN_KIND_LABEL,
  getCampaignStats,
} from "@/lib/campaign-utils";
import { useAppStore } from "@/stores/app-store";

export default function CampaignAnalyticsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const stats = useMemo(
    () => (bundle ? getCampaignStats(bundle) : null),
    [bundle],
  );

  if (!bundle || !stats) return null;

  const byKind = (bundle.campaigns ?? []).reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.kind] = (acc[c.kind] ?? 0) + c.sentCount;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Phân tích chiến dịch"
        description="Sent / failed mock · không phải deliverability thật"
        actions={
          <Link href="/campaigns">
            <Button variant="outline">Danh sách</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard
          label="Campaign"
          metric={{
            available: true,
            value: stats.total,
            definition: "Tổng campaign trong bundle",
          }}
        />
        <StatCard
          label="Sent"
          metric={{
            available: true,
            value: stats.sent,
            definition: "Tổng message sent từ campaign",
          }}
        />
        <StatCard
          label="Failed"
          metric={{
            available: true,
            value: stats.failed,
            definition: "Thiếu consent / UID / OA",
          }}
        />
        <StatCard
          label="Delivery rate (mock)"
          metric={{
            available: true,
            value: stats.deliveryRate,
            definition: "sent / (sent+failed) %",
          }}
        />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold">Sent theo loại</h2>
        <ul className="space-y-2">
          {Object.keys(CAMPAIGN_KIND_LABEL).map((k) => (
            <li
              key={k}
              className="flex items-center justify-between text-sm"
            >
              <span>{CAMPAIGN_KIND_LABEL[k as keyof typeof CAMPAIGN_KIND_LABEL]}</span>
              <span className="font-semibold tabular-nums">
                {byKind[k] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {(bundle.campaigns ?? []).map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {CAMPAIGN_KIND_LABEL[c.kind]} · {c.sentCount} sent /{" "}
                  {c.failedCount} failed
                </p>
              </div>
              <Badge status={c.status} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
