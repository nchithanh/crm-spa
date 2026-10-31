"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { CARE_TYPE_LABELS, careDashboardStats } from "@/lib/care-utils";
import { getTodayCareQueue } from "@/lib/selectors";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function CareOverviewPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const stats = careDashboardStats(bundle);
  const todayQueue = getTodayCareQueue(bundle).slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tổng quan chăm sóc"
        description="Care Center hub — số liệu từ mock dataset thống nhất"
        actions={
          <Link
            href="/tasks"
            className="inline-flex min-h-9 items-center rounded-xl bg-[var(--brand-500)] px-3 text-sm font-semibold text-white"
          >
            Mở việc chăm sóc
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {(
          [
            ["Đang mở", stats.open, "/tasks"],
            ["Quá hạn", stats.overdue, "/tasks"],
            ["Hôm nay", stats.today, "/today"],
            ["Của tôi", stats.mine, "/tasks/mine"],
            ["Đã xong", stats.done, "/tasks"],
          ] as const
        ).map(([label, value, href]) => (
          <Link key={label} href={href}>
            <Card className="p-3 transition hover:border-brand">
              <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                {label}
              </p>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  label === "Quá hạn" && value > 0 ? "text-debt" : ""
                }`}
              >
                {value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-bold">Theo loại (đang mở)</h2>
          <ul className="mt-3 space-y-2">
            {Object.entries(CARE_TYPE_LABELS).map(([k, label]) => (
              <li key={k} className="flex justify-between text-sm">
                <Link
                  href="/tasks"
                  className="text-slate-700 hover:text-[var(--brand-600)]"
                >
                  {label}
                </Link>
                <span className="font-semibold tabular-nums">
                  {stats.byType[k] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-bold">Hàng đợi hôm nay / quá hạn</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {todayQueue.length === 0 ? (
              <li className="py-4 text-sm text-slate-400">Không có việc.</li>
            ) : (
              todayQueue.map((t) => {
                const c = bundle.customers.find((x) => x.id === t.customerId);
                return (
                  <li key={t.id} className="py-2">
                    <Link href="/tasks" className="block hover:bg-slate-50">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        {c?.fullName} · {t.assigneeName} ·{" "}
                        {formatDateTime(t.dueAt)}
                      </p>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/care/birthdays" className="text-[var(--brand-600)]">
              Sinh nhật
            </Link>
            <Link href="/care/aftercare" className="text-[var(--brand-600)]">
              Sau DV
            </Link>
            <Link href="/care/inactive" className="text-[var(--brand-600)]">
              Lâu chưa ghé
            </Link>
            <Link href="/care/complaints" className="text-[var(--brand-600)]">
              Khiếu nại
            </Link>
            <Link
              href="/care/interactions"
              className="text-[var(--brand-600)]"
            >
              Tương tác
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
