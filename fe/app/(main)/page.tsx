"use client";

import Link from "next/link";
import { OpsCharts } from "@/components/dashboard/ops-charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
import { formatDateTime, formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function DashboardPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const m = getCustomerStats(bundle);
  const wf = getWorkflowStats(bundle);
  const camp = getCampaignStats(bundle);
  const careToday = getCareTodayRows(bundle);
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
    <div className="space-y-5">
      <PageHeader
        title="Business & Care Dashboard"
        description={`${bundle.orgName} · KPI từ selectors · Campaign + Automation tách biệt`}
      />

      {/* A. Business Snapshot */}
      <section aria-labelledby="dash-a">
        <h2
          id="dash-a"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          A · Business Snapshot
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
          <StatCard label="Task quá hạn" metric={m.overdueTasks} href="/tasks" />
        </div>
      </section>

      {/* B. Customer Growth */}
      <section aria-labelledby="dash-b">
        <h2
          id="dash-b"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          B · Customer Growth
        </h2>
        <OpsCharts bundle={bundle} />
      </section>

      {/* C. Retention Insights */}
      <section aria-labelledby="dash-c">
        <h2
          id="dash-c"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          C · Retention Insights
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
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

      {/* D. Customer Care Today */}
      <section aria-labelledby="dash-d">
        <h2
          id="dash-d"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          D · Customer Care Today
        </h2>
        <Card className="overflow-hidden">
          {careToday.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Không có việc care hôm nay.</p>
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

      {/* E. Automation Health */}
      <section aria-labelledby="dash-e">
        <h2
          id="dash-e"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          E · Automation Health
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <StatCard label="WF active" metric={wf.active} href="/automations" />
          <StatCard label="Run hôm nay" metric={wf.executionsToday} href="/automations/runs" />
          <StatCard label="Run OK" metric={wf.succeeded} href="/automations/runs" />
          <StatCard label="Run lỗi" metric={wf.failed} href="/automations/runs" />
          <StatCard label="Task mở" metric={m.openTasks} href="/care" />
        </div>
      </section>

      {/* F. Zalo & Campaign */}
      <section aria-labelledby="dash-f">
        <h2
          id="dash-f"
          className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          F · Zalo & Campaign
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <StatCard label="Zalo sent" metric={m.messagesSent} href="/communication/history" />
          <StatCard label="Zalo failed" metric={m.messagesFailed} href="/communication/history" />
          <StatCard
            label="Campaigns"
            metric={{
              available: true,
              value: camp.total,
              definition: "Tổng campaign",
            }}
            href="/campaigns"
          />
          <StatCard
            label="Camp sent"
            metric={{
              available: true,
              value: camp.sent,
              definition: "Sent từ campaign",
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
              OA settings
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
            title="Automation thất bại"
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
            title="Zalo failed"
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
