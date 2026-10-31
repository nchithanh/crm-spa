"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function BranchesSettingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  return (
    <div>
      <PageHeader title="Chi nhánh" />
      <div className="space-y-2">
        {bundle.branches.map((b) => (
          <Card key={b.id} className="p-4">
            <p className="font-semibold">{b.name}</p>
            <p className="text-sm text-slate-500">{b.address}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
