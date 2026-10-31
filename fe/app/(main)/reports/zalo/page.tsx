"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import { getCampaignStats } from "@/lib/campaign-utils";
import { getCustomerStats } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function ZaloReportPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = getCustomerStats(bundle);
  const camp = getCampaignStats(bundle);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hiệu quả Zalo"
        description="Sent / failed mock · OA status"
        actions={
          <Link href="/communication/history">
            <Button variant="outline">Lịch sử</Button>
          </Link>
        }
      />
      <Card className="flex items-center gap-3 p-3">
        <Badge status={bundle.zaloConnected ? "connected" : "disconnected"} />
        <span className="text-sm">OA {bundle.orgName}</span>
      </Card>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Sent" metric={m.messagesSent} />
        <StatCard label="Failed" metric={m.messagesFailed} />
        <StatCard
          label="Camp sent"
          metric={{
            available: true,
            value: camp.sent,
            definition: "Từ campaign",
          }}
        />
        <StatCard
          label="Delivery %"
          metric={{
            available: true,
            value: camp.deliveryRate,
            definition: "Campaign delivery mock",
          }}
        />
      </div>
    </div>
  );
}
