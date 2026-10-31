"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function TeamSettingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Team & Permissions"
        description="Danh sách thành viên demo · ma trận quyền chi tiết vẫn TBD"
      />
      <div className="space-y-2">
        {bundle.team.map((m) => {
          const br = bundle.branches.find((b) => b.id === m.branchId);
          return (
            <Card
              key={m.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-slate-500">{br?.name ?? "—"}</p>
              </div>
              <Badge status="active" label={m.role} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
