"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

const LINKS = [
  {
    href: "/settings/organization",
    title: "Doanh nghiệp",
    desc: "Tên tổ chức demo",
  },
  {
    href: "/settings/branches",
    title: "Chi nhánh",
    desc: "Danh sách cơ sở",
  },
  {
    href: "/settings/team",
    title: "Nhân viên",
    desc: "Team demo",
  },
  {
    href: "/settings/permissions",
    title: "Vai trò & phân quyền",
    desc: "Ma trận demo · chưa enforce",
  },
  {
    href: "/settings/zalo",
    title: "Zalo OA",
    desc: "Bật/tắt OA mock",
  },
  {
    href: "/settings/integrations/ops",
    title: "Dolphin Ops",
    desc: "Mock connect flag · lịch từ dataset",
  },
  {
    href: "/settings/integrations/pos",
    title: "Dolphin POS",
    desc: "Mock · doanh thu gated posConnected",
  },
  {
    href: "/settings/industry",
    title: "Cấu hình ngành",
    desc: "Schema hồ sơ Spa / Nails / Salon",
  },
  {
    href: "/settings/shifts",
    title: "Ca làm KTV",
    desc: "Xem ca · cảnh báo ngoài ca",
  },
  {
    href: "/settings/notifications",
    title: "Thông báo",
    desc: "Preference mock + ghi activity",
  },
  {
    href: "/settings/activity",
    title: "Nhật ký hoạt động",
    desc: "Activity log mock",
  },
  {
    href: "/finance",
    title: "Công nợ (POS stub)",
    desc: "Không phải engine kế toán — mock / link POS",
  },
];

export default function SettingsPage() {
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const bundle = useAppStore((s) => s.bundle);
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader title="Cài đặt" description="Cấu hình demo FE-first" />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold">Reset demo data</p>
          <p className="text-xs text-slate-500">
            Xóa thay đổi localStorage của vertical{" "}
            <span className="font-semibold">{bundle?.label}</span> và nạp lại
            seed gốc (Spa ≥52 KH). Không gọi Backend.
          </p>
          {flash ? (
            <p className="mt-1 text-xs font-medium text-emerald-700">{flash}</p>
          ) : null}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (
              !window.confirm(
                "Reset toàn bộ dữ liệu demo của lĩnh vực hiện tại?",
              )
            ) {
              return;
            }
            resetDemoData();
            setFlash("Đã reset seed. Refresh các trang để thấy số liệu gốc.");
          }}
        >
          Reset demo
        </Button>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full p-4 transition hover:border-brand hover:shadow-md">
              <p className="font-bold">{l.title}</p>
              <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
