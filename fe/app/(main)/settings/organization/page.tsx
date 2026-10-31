"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function OrganizationSettingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  return (
    <div>
      <PageHeader title="Organization" description="Thông tin org (mock read-only)" />
      <Card className="max-w-lg space-y-3 p-4">
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Tên</span>
          <Input defaultValue={bundle.orgName} readOnly />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Lĩnh vực</span>
          <Input defaultValue={bundle.label} readOnly />
        </label>
      </Card>
    </div>
  );
}
