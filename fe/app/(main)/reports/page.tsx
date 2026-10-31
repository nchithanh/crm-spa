"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat";
import {
  computeDashboardMetrics,
  customersAtRisk,
  customersBirthdaySoon,
} from "@/lib/metrics";
import {
  noShowStats,
  revenueByDay,
  revenueByService,
  revenueByTechnician,
} from "@/lib/report-ops";
import { formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const SUB = [
  { href: "/reports/growth", title: "Tăng trưởng KH" },
  { href: "/reports/customers", title: "Phân tích khách" },
  { href: "/reports/retention", title: "Tỷ lệ quay lại" },
  { href: "/reports/care", title: "Hiệu quả care" },
  { href: "/reports/automation", title: "Automation" },
  { href: "/reports/zalo", title: "Zalo" },
  { href: "/reports/staff", title: "NV chăm sóc" },
];

export default function ReportsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const m = computeDashboardMetrics(bundle);
  const atRisk = customersAtRisk(bundle.customers).length;
  const bday = customersBirthdaySoon(bundle.customers).length;
  const techs = bundle.team.filter((t) => t.role === "technician");
  const byDay = revenueByDay(bundle, 14);
  const bySvc = revenueByService(bundle).slice(0, 8);
  const byTech = revenueByTechnician(bundle, techs);
  const ns = noShowStats(bundle.bookings);
  const maxDay = Math.max(...byDay.map((d) => d.amount), 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Báo cáo"
        description="DT mock từ catalog × booking completed · retention · no-show (không thay POS)"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SUB.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="p-3 text-sm font-semibold transition hover:border-[var(--brand-500)]">
              {s.title}
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-xs font-bold text-slate-500 uppercase">
          Vận hành & no-show
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard label="Lịch hôm nay" metric={m.todayBookings} />
          <StatCard label="DT hôm nay (mock)" metric={m.todayRevenueMock} money />
          <Card className="p-3">
            <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              No-show
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums">{ns.noShow}</p>
            <p className="text-[10px] text-slate-400">
              {ns.rate}% trên {ns.relevant} lịch kết thúc
            </p>
          </Card>
          <StatCard label="Tỷ lệ tái đặt" metric={m.rebookingRate} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-slate-500 uppercase">
          Doanh thu mock 14 ngày
        </h2>
        <Card className="p-4">
          <div className="flex h-36 items-end gap-1">
            {byDay.map((d) => (
              <div
                key={d.date}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                title={`${d.date}: ${formatVnd(d.amount)}`}
              >
                <div
                  className="w-full max-w-[1.5rem] rounded-t bg-[var(--brand-500)]/80"
                  style={{
                    height: `${Math.max(4, (d.amount / maxDay) * 100)}%`,
                  }}
                />
                <span className="text-[9px] text-slate-400">
                  {d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm font-bold">DT theo dịch vụ</p>
          <ul className="mt-3 space-y-2">
            {bySvc.length === 0 ? (
              <li className="text-sm text-slate-500">Chưa có completed.</li>
            ) : (
              bySvc.map((s) => (
                <li
                  key={s.name}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="truncate">
                    {s.name}{" "}
                    <span className="text-slate-400">×{s.count}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatVnd(s.amount)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-bold">DT theo KTV</p>
          <ul className="mt-3 space-y-2">
            {byTech.length === 0 ? (
              <li className="text-sm text-slate-500">Chưa có completed.</li>
            ) : (
              byTech.map((s) => (
                <li
                  key={s.name}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="truncate">
                    {s.name}{" "}
                    <span className="text-slate-400">×{s.count}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatVnd(s.amount)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-bold text-slate-500 uppercase">
          Retention
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard label="Tổng khách" metric={m.totalCustomers} />
          <StatCard label="Mới 30 ngày" metric={m.newCustomers30d} />
          <StatCard label="Quay lại" metric={m.returningCustomers} />
          <Card className="p-3 text-sm">
            <p>
              Nguy cơ rời: <strong>{atRisk}</strong>
            </p>
            <p>
              Sinh nhật 30 ngày: <strong>{bday}</strong>
            </p>
          </Card>
        </div>
      </section>

      <Card className="border-dashed p-4 text-sm text-slate-500">
        Số tiền trên báo cáo là <strong>mock từ giá catalog</strong>. Tổng chi
        tiêu khách vẫn ẩn khi chưa kết nối POS (
        {bundle.posConnected ? "POS OK" : "chưa POS"}).
      </Card>
    </div>
  );
}
