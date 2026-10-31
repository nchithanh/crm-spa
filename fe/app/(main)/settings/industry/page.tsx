"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PROFILE_LABELS } from "@/data/seed";
import { useAppStore } from "@/stores/app-store";

export default function IndustrySettingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const labels = PROFILE_LABELS[bundle.id];

  return (
    <div>
      <PageHeader
        title="Cấu hình ngành"
        description={`${bundle.label} · field hồ sơ chuyên môn (không trộn ngành)`}
      />
      <Card className="space-y-2 p-4">
        <p className="text-sm text-slate-600">
          Vertical hiện tại: <strong>{bundle.label}</strong>. Đổi lĩnh vực từ
          menu để xem profile schema khác.
        </p>
        <ul className="mt-3 space-y-2">
          {Object.entries(labels).map(([key, label]) => (
            <li
              key={key}
              className="flex justify-between rounded-[10px] bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium">{label}</span>
              <code className="text-xs text-slate-500">{key}</code>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
