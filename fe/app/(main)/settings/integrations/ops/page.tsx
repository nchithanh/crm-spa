"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function OpsIntegrationPage() {
  const bundle = useAppStore((s) => s.bundle);
  const toggleOps = useAppStore((s) => s.toggleOps);
  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tích hợp Dolphin Ops"
        description="Mock flag · không sync booking engine thật"
        actions={
          <Link href="/bookings">
            <Button variant="outline">Xem lịch (mock)</Button>
          </Link>
        }
      />
      <Card className="flex max-w-lg flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Dolphin Ops</p>
          <p className="text-sm text-slate-500">
            Lịch hẹn / ca KTV đọc từ dataset mock. Bật flag chỉ để demo UI
            tích hợp.
          </p>
          <div className="mt-2">
            <Badge
              status={bundle.opsConnected ? "connected" : "disconnected"}
            />
          </div>
        </div>
        <Button onClick={toggleOps}>
          {bundle.opsConnected ? "Ngắt (mock)" : "Kết nối (mock)"}
        </Button>
      </Card>
    </div>
  );
}
