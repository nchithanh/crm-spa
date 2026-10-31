import type {
  Booking,
  CareTask,
  Customer,
  CustomerPackage,
  VerticalBundle,
  WorkflowRun,
} from "@/lib/types";

export function daysSince(iso: string, now = Date.now()): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 9999;
  return Math.floor((now - t) / 86_400_000);
}

export function daysUntilBirthday(birthday: string, now = new Date()): number {
  if (!birthday) return 9999;
  const parts = birthday.split("-").map(Number);
  const m = parts[1];
  const d = parts[2];
  if (!m || !d) return 9999;
  const next = new Date(now.getFullYear(), m - 1, d);
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type MetricValue =
  | { available: true; value: number; definition: string }
  | { available: false; reason: string; definition: string };

export type DashboardMetrics = {
  totalCustomers: MetricValue;
  newCustomers30d: MetricValue;
  returningCustomers: MetricValue;
  atRiskCustomers: MetricValue;
  upcomingBookings: MetricValue;
  overdueTasks: MetricValue;
  openTasks: MetricValue;
  activeWorkflows: MetricValue;
  executionsToday: MetricValue;
  successfulExecutions: MetricValue;
  failedExecutions: MetricValue;
  messagesSent: MetricValue;
  messagesFailed: MetricValue;
  rebookingRate: MetricValue;
  totalSpend: MetricValue;
  todayBookings: MetricValue;
  todayRevenueMock: MetricValue;
  packagesLow: MetricValue;
};

function ok(value: number, definition: string): MetricValue {
  return { available: true, value, definition };
}

function na(reason: string, definition: string): MetricValue {
  return { available: false, reason, definition };
}

export function computeDashboardMetrics(
  bundle: VerticalBundle,
  now = Date.now(),
): DashboardMetrics {
  const { customers, bookings, tasks, workflows, runs, messages, posConnected } =
    bundle;

  const returning = customers.filter((c) => c.completedServiceCount >= 2);
  const atRisk = customersAtRisk(customers, now);
  const new30 = customers.filter((c) => daysSince(c.firstVisitAt, now) <= 30);
  const upcoming = bookings.filter(
    (b) =>
      b.status === "upcoming" ||
      b.status === "confirmed" ||
      b.status === "in_service",
  );
  const overdue = tasks.filter(
    (t) => t.status === "open" && Date.parse(t.dueAt) < now,
  );
  const openTasks = tasks.filter((t) => t.status === "open");
  const today = startOfToday();
  const tomorrow = today + 86_400_000;
  const todayBks = bookings.filter((b) => {
    const t = Date.parse(b.scheduledAt);
    return t >= today && t < tomorrow;
  });
  const todayRev = todayBks
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => {
      const svc = bundle.services.find((s) => s.id === b.serviceId);
      return sum + (svc?.priceVnd ?? 0);
    }, 0);
  const lowPkgs = (bundle.packages ?? []).filter(
    (p) => p.status === "active" && p.remainingSessions > 0 && p.remainingSessions <= 2,
  );
  const runsToday = runs.filter((r) => Date.parse(r.startedAt) >= today);
  const okRuns = runs.filter((r) => r.status === "succeeded");
  const failRuns = runs.filter((r) => r.status === "failed");
  const sent = messages.filter((m) => m.status === "sent");
  const failedMsg = messages.filter((m) => m.status === "failed");

  const withHistory = customers.filter((c) => c.completedServiceCount >= 1);
  const rebooked = withHistory.filter((c) =>
    bookings.some((b) => b.customerId === c.id && b.status === "upcoming"),
  );

  const rebookingDef =
    "% khách đã từng dùng DV và đang có booking upcoming";

  return {
    totalCustomers: ok(customers.length, "Tổng hồ sơ khách trong tenant demo"),
    newCustomers30d: ok(new30.length, "firstVisitAt trong 30 ngày gần nhất"),
    returningCustomers: ok(returning.length, "completedServiceCount ≥ 2"),
    atRiskCustomers: ok(
      atRisk.length,
      "Đã từng dùng DV, >60 ngày chưa ghé, không inactive",
    ),
    upcomingBookings: ok(
      upcoming.length,
      "Booking status = upcoming (Ops projection)",
    ),
    overdueTasks: ok(overdue.length, "Care task open và dueAt < now"),
    openTasks: ok(openTasks.length, "Care task đang open"),
    activeWorkflows: ok(
      workflows.filter((w) => w.status === "active").length,
      "Workflow status = active",
    ),
    executionsToday: ok(
      runsToday.length,
      "WorkflowRun startedAt ≥ hôm nay",
    ),
    successfulExecutions: ok(okRuns.length, "Tổng run succeeded"),
    failedExecutions: ok(failRuns.length, "Tổng run failed"),
    messagesSent: ok(sent.length, "MessageLog status = sent"),
    messagesFailed: ok(failedMsg.length, "MessageLog status = failed"),
    rebookingRate:
      withHistory.length >= 5
        ? ok(
            Math.round((rebooked.length / withHistory.length) * 100),
            rebookingDef,
          )
        : na("Cần ≥5 khách có lịch sử DV", rebookingDef),
    totalSpend: posConnected
      ? ok(
          customers.reduce((s, c) => s + c.totalSpend, 0),
          "Tổng chi tiêu từ POS tích hợp",
        )
      : na("Chưa kết nối Dolphin POS hợp lệ", "Tổng chi tiêu từ POS tích hợp"),
    todayBookings: ok(
      todayBks.length,
      "Booking scheduledAt trong ngày hôm nay",
    ),
    todayRevenueMock: ok(
      todayRev,
      "Ước doanh thu mock = tổng giá catalog của booking completed hôm nay (không thay POS)",
    ),
    packagesLow: ok(
      lowPkgs.length,
      "Gói active còn ≤ 2 buổi",
    ),
  };
}

export function bookingsToday(bookings: Booking[], now = Date.now()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = start.getTime() + 86_400_000;
  return bookings
    .filter((b) => {
      const t = Date.parse(b.scheduledAt);
      return t >= start.getTime() && t < end;
    })
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function packagesNearlyEmpty(packages: CustomerPackage[]) {
  return packages.filter(
    (p) => p.status === "active" && p.remainingSessions > 0 && p.remainingSessions <= 2,
  );
}

export function customersAtRisk(customers: Customer[], now = Date.now()) {
  return customers.filter(
    (c) =>
      c.status !== "inactive" &&
      c.completedServiceCount >= 1 &&
      daysSince(c.lastVisitAt, now) > 60,
  );
}

export function customersBirthdaySoon(customers: Customer[], withinDays = 30) {
  return customers.filter((c) => daysUntilBirthday(c.birthday) <= withinDays);
}

export function customersNeedingFollowUp(
  tasks: CareTask[],
  customers: Customer[],
) {
  const ids = new Set(
    tasks.filter((t) => t.status === "open").map((t) => t.customerId),
  );
  return customers.filter((c) => ids.has(c.id));
}

export function upcomingForCustomer(
  bookings: Booking[],
  customerId: string,
): Booking | undefined {
  return bookings
    .filter(
      (b) =>
        b.customerId === customerId &&
        (b.status === "upcoming" ||
          b.status === "confirmed" ||
          b.status === "in_service"),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
}

export function runsForWorkflow(runs: WorkflowRun[], workflowId: string) {
  return runs.filter((r) => r.workflowId === workflowId);
}
