"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  DEFAULT_RFM,
  loadRfmThresholds,
  retentionEffectiveness,
  type RfmThresholds,
} from "@/lib/retention";
import { useAppStore } from "@/stores/app-store";

export default function RetentionEffectivenessPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [t, setT] = useState<RfmThresholds>(DEFAULT_RFM);
  useEffect(() => {
    setT(loadRfmThresholds());
  }, []);

  const stats = useMemo(
    () => (bundle ? retentionEffectiveness(bundle, t) : null),
    [bundle, t],
  );

  if (!bundle || !stats) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hiệu quả giữ chân khách"
        description={stats.note}
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ["Tổng KH", stats.total, "/customers"],
            ["Returning", stats.returning, "/retention/returning"],
            ["Tỷ lệ quay lại %", stats.returningRate, "/reports/retention"],
            ["VIP", stats.vip, "/retention/vip"],
            ["At-risk", stats.atRisk, "/retention/at-risk"],
            ["Cơ hội tái đặt", stats.rebook, "/retention/rebooking"],
          ] as const
        ).map(([label, value, href]) => (
          <Link key={label} href={href}>
            <Card className="p-3 transition hover:border-brand">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="p-4 text-sm text-slate-600">
        Ngưỡng hiện tại: VIP ≥{t.vipMinVisits} lần / ≥
        {t.vipMinSpend.toLocaleString("vi-VN")}đ · Loyal ≥{t.loyalMinVisits} ·
        At-risk &gt;{t.atRiskDays}n · Inactive &gt;{t.inactiveDays}n. Chỉnh tại
        trang VIP/Loyal (Lưu RFM).
      </Card>
    </div>
  );
}
