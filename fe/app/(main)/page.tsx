"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { OpsCharts } from "@/components/dashboard/ops-charts";
import { openQuickSearch } from "@/components/layout/quick-search";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat";
import { getCampaignStats } from "@/lib/campaign-utils";
import {
  bookingsToday,
  customersBirthdaySoon,
  packagesNearlyEmpty,
} from "@/lib/metrics";
import {
  getAtRiskCustomers,
  getCareTodayRows,
  getCustomerStats,
  getInactiveCount,
  getRebookingOpportunities,
  getUpcomingBookings,
  getWorkflowStats,
} from "@/lib/selectors";
import { getRecentColumns, type RecentColumn } from "@/lib/recents";
import { formatDateTime, formatVnd } from "@/lib/utils";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores/app-store";

type RecentState = { columns: RecentColumn[]; isFallback: boolean };

export default function DashboardPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [recent, setRecent] = useState<RecentState | null>(null);

  useEffect(() => {
    setRecent(getRecentColumns());
  }, []);

  if (!bundle) return <DashboardSkeleton />;

  const m = getCustomerStats(bundle);
  const wf = getWorkflowStats(bundle);
  const camp = getCampaignStats(bundle);
  const careToday = getCareTodayRows(bundle).slice(0, 4);
  const atRisk = getAtRiskCustomers(bundle).slice(0, 6);
  const inactiveN = getInactiveCount(bundle);
  const birthdays = customersBirthdaySoon(bundle.customers).slice(0, 6);
  const todayList = bookingsToday(bundle.bookings).slice(0, 8);
  const lowPkgs = packagesNearlyEmpty(bundle.packages).slice(0, 6);
  const upcoming = getUpcomingBookings(bundle).slice(0, 6);
  const rebook = getRebookingOpportunities(bundle).slice(0, 6);
  const failed = bundle.runs.filter((r) => r.status === "failed").slice(0, 5);
  const failedMsg = bundle.messages
    .filter((x) => x.status === "failed")
    .slice(0, 5);

  return (
    <div className="space-y-5 lg:pt-[10vh]">
      {/* Hero: AI quick search */}
      <section className="mx-auto w-full max-w-5xl space-y-4 pt-2 pb-1 text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--brand-500)] uppercase">
            {bundle.orgName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Hôm nay bạn cần gì?
          </h1>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-1.5">
          <button
            type="button"
            onClick={openQuickSearch}
            aria-label="Tìm chức năng, thao tác"
            className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-[var(--brand-300)] hover:shadow-sm"
          >
            <Search size={18} className="shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-400">
              Tìm chức năng, thao tác…
            </span>
            <span className="hidden shrink-0 items-center gap-1 sm:flex">
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Ctrl
              </kbd>
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                K
              </kbd>
            </span>
          </button>
        </div>
      </section>

      {/* Recently opened features — 3 cột × 5 */}
      <section
        aria-labelledby="dash-recent"
        className="mx-auto w-full max-w-5xl"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2
            id="dash-recent"
            className="text-xs font-bold tracking-wide text-slate-500 uppercase"
          >
            {recent?.isFallback ? "Gợi ý nhanh" : "Gần đây"}
          </h2>
          <button
            type="button"
            onClick={openQuickSearch}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--brand-600)] hover:underline"
          >
            Tất cả chức năng
            <ChevronRight size={12} />
          </button>
        </div>

        {recent === null ? (
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, c) => (
              <div
                key={c}
                className="space-y-1.5 border-b border-[var(--border)] pb-4 last:border-b-0 sm:border-b-0 sm:pb-0"
              >
                <Skeleton className="h-3 w-24" />
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            {recent.columns.map((column) => (
              <div
                key={column.id}
                className="min-w-0 border-b border-[var(--border)] pb-4 last:border-b-0 sm:border-b-0 sm:pb-0"
              >
                <h3 className="mb-1.5 px-2.5 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                  {column.title}
                </h3>
                <ul className="space-y-0.5">
                  {column.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition hover:bg-[var(--brand-50)]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 group-hover:text-[var(--brand-700)]">
                            {item.label}
                          </span>
                          <ChevronRight
                            size={14}
                            className="shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* A. Business Snapshot */}
      <section aria-labelledby="dash-a">
        <h2
          id="dash-a"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          A · Ảnh chụp kinh doanh
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Tổng khách" metric={m.totalCustomers} href="/customers" />
          <StatCard label="Mới 30 ngày" metric={m.newCustomers30d} href="/customers" />
          <StatCard label="Quay lại (≥2 DV)" metric={m.returningCustomers} />
          <StatCard
            label="Chưa quay lại"
            metric={{
              available: true,
              value: inactiveN,
              definition: "Inactive / >90 ngày",
            }}
            href="/retention/inactive"
          />
          <StatCard label="Lịch sắp tới" metric={m.upcomingBookings} href="/bookings" />
          <StatCard label="Việc quá hạn" metric={m.overdueTasks} href="/tasks" />
        </div>
      </section>

      {/* B. Customer Growth */}
      <section aria-labelledby="dash-b">
        <h2
          id="dash-b"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          B · Tăng trưởng khách
        </h2>
        <OpsCharts bundle={bundle} />
      </section>

      {/* C. Retention Insights + D. Customer Care Today */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section aria-labelledby="dash-c">
          <h2
            id="dash-c"
            className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
          >
            C · Giữ chân khách
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2">
            <StatCard label="Tỷ lệ tái đặt" metric={m.rebookingRate} href="/reports/retention" />
            <StatCard label="Nguy cơ rời" metric={m.atRiskCustomers} href="/retention/at-risk" />
            <StatCard
              label="Cơ hội tái đặt"
              metric={{
                available: true,
                value: rebook.length,
                definition: "Có DV, chưa có lịch sắp tới",
              }}
              href="/bookings/rebooking"
            />
            <StatCard label="Doanh thu (POS)" metric={m.totalSpend} money />
          </div>
        </section>

        <section aria-labelledby="dash-d">
          <h2
            id="dash-d"
            className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
          >
            D · Chăm sóc hôm nay
          </h2>
          <Card className="overflow-hidden">
            {careToday.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Không có việc chăm sóc hôm nay.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {careToday.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/customers/${row.customerId}`}
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {row.customerName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {row.reason} · {row.assigneeName} · hạn{" "}
                          {formatDateTime(row.dueAt)}
                        </p>
                      </div>
                      <Badge
                        status={row.overdue ? "overdue" : row.priority}
                        label={row.priority}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>

      {/* E. Automation Health */}
      <section aria-labelledby="dash-e">
        <h2
          id="dash-e"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          E · Sức khỏe tự động
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <StatCard label="Luồng đang chạy" metric={wf.active} href="/automations" />
          <StatCard label="Lần chạy hôm nay" metric={wf.executionsToday} href="/automations/runs" />
          <StatCard label="Chạy thành công" metric={wf.succeeded} href="/automations/runs" />
          <StatCard label="Chạy lỗi" metric={wf.failed} href="/automations/runs" />
          <StatCard label="Việc đang mở" metric={m.openTasks} href="/care" />
        </div>
      </section>

      {/* F. Zalo & Campaign */}
      <section aria-labelledby="dash-f">
        <h2
          id="dash-f"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          F · Zalo & chiến dịch
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <StatCard label="Zalo đã gửi" metric={m.messagesSent} href="/communication/history" />
          <StatCard label="Zalo lỗi" metric={m.messagesFailed} href="/communication/history" />
          <StatCard
            label="Chiến dịch"
            metric={{
              available: true,
              value: camp.total,
              definition: "Tổng chiến dịch",
            }}
            href="/campaigns"
          />
          <StatCard
            label="Chiến dịch đã gửi"
            metric={{
              available: true,
              value: camp.sent,
              definition: "Số tin đã gửi từ chiến dịch",
            }}
            href="/campaigns/analytics"
          />
          <Card className="flex items-center gap-2 p-3">
            <Badge
              status={bundle.zaloConnected ? "connected" : "disconnected"}
            />
            <Link
              href="/settings/zalo"
              className="text-xs font-semibold text-[var(--brand-600)]"
            >
              Cài đặt OA
            </Link>
          </Card>
        </div>
      </section>

      {/* G. Ops today lists */}
      <section aria-labelledby="dash-g">
        <h2
          id="dash-g"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          G · Ca hôm nay & cơ hội
        </h2>
        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard label="Lịch hôm nay" metric={m.todayBookings} href="/bookings" />
          <StatCard label="DT hôm nay (mock)" metric={m.todayRevenueMock} money />
          <StatCard label="Gói ≤2 buổi" metric={m.packagesLow} href="/packages" />
          <StatCard label="Lịch sắp tới" metric={m.upcomingBookings} href="/bookings" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <InsightList
            title="Lịch hôm nay"
            href="/bookings"
            items={todayList.map((b) => {
              const c = bundle.customers.find((x) => x.id === b.customerId);
              const tech = bundle.team.find((t) => t.id === b.technicianId);
              return {
                id: b.id,
                title: b.serviceName,
                meta: `${c?.fullName ?? "—"} · ${formatDateTime(b.scheduledAt)}${tech ? ` · ${tech.name}` : ""}`,
                href: `/bookings`,
                badge: b.status,
              };
            })}
          />
          <InsightList
            title="Gói sắp hết buổi"
            href="/packages"
            items={lowPkgs.map((p) => {
              const c = bundle.customers.find((x) => x.id === p.customerId);
              return {
                id: p.id,
                title: p.serviceName,
                meta: `${c?.fullName ?? "—"} · còn ${p.remainingSessions}/${p.totalSessions} · ${formatVnd(p.paidVnd)}`,
                href: `/customers/${p.customerId}`,
                badge: "active",
              };
            })}
          />
          <InsightList
            title="Nguy cơ rời"
            href="/retention/at-risk"
            items={atRisk.map((c) => ({
              id: c.id,
              title: c.fullName,
              meta: `${c.code} · ${formatDateTime(c.lastVisitAt)}`,
              href: `/customers/${c.id}`,
              badge: "inactive",
            }))}
          />
          <InsightList
            title="Sắp sinh nhật"
            href="/care/birthdays"
            items={birthdays.map((c) => ({
              id: c.id,
              title: c.fullName,
              meta: c.birthday,
              href: `/customers/${c.id}`,
              badge: "vip",
            }))}
          />
          <InsightList
            title="Chưa tái đặt"
            href="/bookings/rebooking"
            items={rebook.map((c) => ({
              id: c.id,
              title: c.fullName,
              meta: `${c.completedServiceCount} DV · ${formatDateTime(c.lastVisitAt)}`,
              href: `/customers/${c.id}`,
              badge: "open",
            }))}
          />
          <InsightList
            title="Lịch sắp tới"
            href="/bookings"
            items={upcoming.map((b) => {
              const c = bundle.customers.find((x) => x.id === b.customerId);
              return {
                id: b.id,
                title: b.serviceName,
                meta: `${c?.fullName ?? "—"} · ${formatDateTime(b.scheduledAt)}`,
                href: `/customers/${b.customerId}`,
                badge: "upcoming",
              };
            })}
          />
          <InsightList
            title="Tự động chạy lỗi"
            href="/automations/runs"
            items={failed.map((r) => ({
              id: r.id,
              title: r.workflowName,
              meta: r.error || r.status,
              href: `/automations/runs/${r.id}`,
              badge: "failed",
            }))}
          />
          <InsightList
            title="Zalo lỗi"
            href="/communication/history"
            items={failedMsg.map((msg) => {
              const c = bundle.customers.find((x) => x.id === msg.customerId);
              return {
                id: msg.id,
                title: c?.fullName ?? msg.customerId,
                meta: msg.error || "failed",
                href: `/communication?customerId=${msg.customerId}`,
                badge: "failed",
              };
            })}
          />
        </div>
      </section>
    </div>
  );
}

function InsightList({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: {
    id: string;
    title: string;
    meta: string;
    href: string;
    badge: string;
  }[];
}) {
  return (
    <Card className="flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        <Link
          href={href}
          className="text-[11px] font-semibold text-[var(--brand-600)]"
        >
          Xem
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Không có mục.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((i) => (
            <li key={i.id}>
              <Link
                href={i.href}
                className="flex items-start justify-between gap-2 py-2 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.title}</p>
                  <p className="truncate text-[11px] text-slate-500">{i.meta}</p>
                </div>
                <Badge status={i.badge === "overdue" ? "overdue" : i.badge} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
