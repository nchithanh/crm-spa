"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function PosIntegrationPage() {
  const bundle = useAppStore((s) => s.bundle);
  const togglePos = useAppStore((s) => s.togglePos);
  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tích hợp Dolphin POS"
        description="Doanh thu totalSpend gated bởi posConnected"
        actions={
          <Link href="/finance">
            <Button variant="outline">Công nợ stub</Button>
          </Link>
        }
      />
      <Card className="flex max-w-lg flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Dolphin POS</p>
          <p className="text-sm text-slate-500">
            Bật mock → Dashboard hiện totalSpend. Không phải engine kế toán.
          </p>
          <div className="mt-2">
            <Badge
              status={bundle.posConnected ? "connected" : "disconnected"}
            />
          </div>
        </div>
        <Button onClick={togglePos}>
          {bundle.posConnected ? "Ngắt (mock)" : "Kết nối (mock)"}
        </Button>
      </Card>
    </div>
  );
}
