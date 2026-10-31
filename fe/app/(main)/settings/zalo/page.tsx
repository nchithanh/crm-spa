"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function ZaloSettingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const toggleZalo = useAppStore((s) => s.toggleZalo);
  if (!bundle) return null;

  const sent = bundle.messages.filter((m) => m.status === "sent").length;
  const failed = bundle.messages.filter((m) => m.status === "failed").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Zalo Connection"
        description="Mock connect/disconnect — OAuth thật = Backend Dependency"
        actions={
          <Link href="/communication">
            <Button variant="outline">Zalo Center</Button>
          </Link>
        }
      />
      <Card className="flex max-w-lg flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Official Account</p>
          <p className="text-sm text-slate-500">{bundle.orgName} OA</p>
          <div className="mt-2">
            <Badge
              status={bundle.zaloConnected ? "connected" : "disconnected"}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            UID vs ZBS phone — template quyết định chế độ người nhận. Không giả
            định chỉ cần SĐT là gửi được OA.
          </p>
        </div>
        <Button onClick={toggleZalo}>
          {bundle.zaloConnected ? "Ngắt kết nối" : "Kết nối"}
        </Button>
      </Card>
      <div className="grid max-w-lg grid-cols-2 gap-2">
        <Card className="p-3">
          <p className="text-xs text-slate-500">Sent (mock)</p>
          <p className="text-xl font-bold text-emerald-700">{sent}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Failed</p>
          <p className="text-xl font-bold text-rose-700">{failed}</p>
        </Card>
      </div>
    </div>
  );
}
