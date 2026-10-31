"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

type Pref = { id: string; label: string; on: boolean };

const DEFAULTS: Pref[] = [
  { id: "care_overdue", label: "Task care quá hạn", on: true },
  { id: "booking_today", label: "Lịch hôm nay", on: true },
  { id: "zalo_failed", label: "Zalo gửi lỗi", on: true },
  { id: "campaign_done", label: "Campaign hoàn tất", on: false },
  { id: "wf_failed", label: "Workflow run lỗi", on: true },
];

export default function NotificationsSettingsPage() {
  const pushActivity = useAppStore((s) => s.pushActivity);
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [flash, setFlash] = useState("");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Thông báo"
        description="Preference mock (local state) · chưa push thật"
      />
      <Card className="divide-y divide-slate-100 overflow-hidden">
        {prefs.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <p className="text-sm font-medium">{p.label}</p>
            <Button
              size="sm"
              variant={p.on ? "default" : "outline"}
              onClick={() =>
                setPrefs((list) =>
                  list.map((x) =>
                    x.id === p.id ? { ...x, on: !x.on } : x,
                  ),
                )
              }
            >
              {p.on ? "Bật" : "Tắt"}
            </Button>
          </div>
        ))}
      </Card>
      <Button
        onClick={() => {
          pushActivity({
            kind: "settings",
            title: "Saved notification prefs",
            detail: prefs
              .filter((p) => p.on)
              .map((p) => p.id)
              .join(", "),
          });
          setFlash("Đã lưu preference (mock) + ghi activity log.");
        }}
      >
        Lưu
      </Button>
      {flash ? <p className="text-sm text-emerald-700">{flash}</p> : null}
    </div>
  );
}
