import type { VerticalBundle } from "@/lib/types";

/** Backfill fields for thinner verticals / legacy shapes */
export function normalizeBundle(bundle: VerticalBundle): VerticalBundle {
  const debts = bundle.debts ?? [];
  return {
    ...bundle,
    team: bundle.team ?? [],
    notes: bundle.notes ?? [],
    services: bundle.services ?? [],
    packages: bundle.packages ?? [],
    resources: bundle.resources ?? [],
    shifts: bundle.shifts ?? [],
    campaigns: bundle.campaigns ?? [],
    activityLog: bundle.activityLog ?? [],
    opsConnected: bundle.opsConnected ?? false,
    debts,
    currentUserName: bundle.currentUserName ?? "Demo User",
    customers: bundle.customers.map((c, i) => ({
      ...c,
      code: c.code || `${bundle.id.toUpperCase()}-${1000 + i + 1}`,
      firstVisitAt: c.firstVisitAt || c.lastVisitAt,
      source:
        c.source ??
        (["zalo", "walk_in", "referral", "facebook", "web"] as const)[i % 5],
      debtVnd:
        typeof c.debtVnd === "number"
          ? c.debtVnd
          : debts
              .filter((d) => d.customerId === c.id && d.status !== "paid")
              .reduce((s, d) => s + (d.amountVnd - d.paidVnd), 0),
    })),
    tasks: bundle.tasks.map((t) => ({
      ...t,
      assigneeName: t.assigneeName || bundle.currentUserName || "Staff",
    })),
  };
}
