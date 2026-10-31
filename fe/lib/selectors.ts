import {
  computeDashboardMetrics,
  customersAtRisk,
  customersBirthdaySoon,
  daysSince,
  type DashboardMetrics,
} from "@/lib/metrics";
import type { CareTask, Customer, VerticalBundle } from "@/lib/types";
import { startOfDay } from "@/lib/mock-clock";

/** Alias SoT — mọi widget dashboard phải gọi selectors, không hardcode số. */
export function getCustomerStats(bundle: VerticalBundle): DashboardMetrics {
  return computeDashboardMetrics(bundle);
}

export function getReturningCustomers(bundle: VerticalBundle): Customer[] {
  return bundle.customers.filter((c) => c.completedServiceCount >= 2);
}

export function getInactiveCustomers(
  bundle: VerticalBundle,
  now = Date.now(),
): Customer[] {
  return bundle.customers.filter(
    (c) =>
      c.status === "inactive" ||
      (c.completedServiceCount >= 1 && daysSince(c.lastVisitAt, now) > 90),
  );
}

export function getAtRiskCustomers(
  bundle: VerticalBundle,
  now = Date.now(),
): Customer[] {
  return customersAtRisk(bundle.customers, now);
}

export function getUpcomingBookings(bundle: VerticalBundle) {
  return bundle.bookings
    .filter((b) =>
      ["upcoming", "confirmed", "in_service"].includes(b.status),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function getOverdueTasks(bundle: VerticalBundle, now = Date.now()) {
  return bundle.tasks.filter(
    (t) => t.status === "open" && Date.parse(t.dueAt) < now,
  );
}

export function getCareTasksByStaff(
  bundle: VerticalBundle,
  staffName: string,
): CareTask[] {
  return bundle.tasks.filter((t) => t.assigneeName === staffName);
}

export function getTodayCareQueue(bundle: VerticalBundle, now = Date.now()) {
  const start = startOfDay(now);
  const end = start + 86_400_000;
  return bundle.tasks
    .filter((t) => {
      if (t.status !== "open") return false;
      const due = Date.parse(t.dueAt);
      return due < end;
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export function getBirthdayOpportunities(bundle: VerticalBundle) {
  return customersBirthdaySoon(bundle.customers);
}

export function getLowPackages(bundle: VerticalBundle) {
  return (bundle.packages ?? []).filter(
    (p) =>
      p.status === "active" &&
      p.remainingSessions > 0 &&
      p.remainingSessions <= 2,
  );
}

export function getWorkflowStats(bundle: VerticalBundle) {
  const m = computeDashboardMetrics(bundle);
  return {
    active: m.activeWorkflows,
    executionsToday: m.executionsToday,
    succeeded: m.successfulExecutions,
    failed: m.failedExecutions,
    messagesSent: m.messagesSent,
  };
}

/** Dashboard Care Today — lý do + ưu tiên (rule-based demo) */
export function getCareTodayRows(bundle: VerticalBundle, now = Date.now()) {
  return getTodayCareQueue(bundle, now).slice(0, 12).map((t) => {
    const c = bundle.customers.find((x) => x.id === t.customerId);
    const overdue = Date.parse(t.dueAt) < now;
    return {
      id: t.id,
      customerName: c?.fullName ?? t.customerId,
      customerId: t.customerId,
      reason: t.title,
      assigneeName: t.assigneeName,
      priority: t.priority ?? (overdue ? "high" : "medium"),
      dueAt: t.dueAt,
      overdue,
      type: t.type ?? "general",
    };
  });
}

export function getInactiveCount(bundle: VerticalBundle, now = Date.now()) {
  return getInactiveCustomers(bundle, now).length;
}

export function getRebookingOpportunities(bundle: VerticalBundle) {
  const upcomingIds = new Set(
    getUpcomingBookings(bundle).map((b) => b.customerId),
  );
  return bundle.customers
    .filter(
      (c) =>
        c.completedServiceCount >= 1 &&
        !upcomingIds.has(c.id) &&
        c.status !== "inactive",
    )
    .slice(0, 40);
}
