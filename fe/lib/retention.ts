import { daysSince } from "@/lib/metrics";
import type { Customer, VerticalBundle } from "@/lib/types";

export type RfmThresholds = {
  vipMinVisits: number;
  vipMinSpend: number;
  loyalMinVisits: number;
  atRiskDays: number;
  inactiveDays: number;
  returningMinVisits: number;
};

export const DEFAULT_RFM: RfmThresholds = {
  vipMinVisits: 8,
  vipMinSpend: 5_000_000,
  loyalMinVisits: 4,
  atRiskDays: 60,
  inactiveDays: 90,
  returningMinVisits: 2,
};

const RFM_KEY = "dolphin-beauty-crm-rfm";

export function loadRfmThresholds(): RfmThresholds {
  if (typeof window === "undefined") return { ...DEFAULT_RFM };
  try {
    const raw = window.localStorage.getItem(RFM_KEY);
    if (!raw) return { ...DEFAULT_RFM };
    return { ...DEFAULT_RFM, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_RFM };
  }
}

export function saveRfmThresholds(t: RfmThresholds) {
  window.localStorage.setItem(RFM_KEY, JSON.stringify(t));
}

/** Rule-based demo — không phải mô hình AI churn */
export function isVip(c: Customer, t: RfmThresholds, posConnected: boolean) {
  if (c.status === "vip") return true;
  if (c.completedServiceCount >= t.vipMinVisits) return true;
  if (posConnected && c.totalSpend >= t.vipMinSpend) return true;
  return false;
}

export function isLoyal(c: Customer, t: RfmThresholds) {
  return (
    c.completedServiceCount >= t.loyalMinVisits &&
    c.completedServiceCount < t.vipMinVisits &&
    c.status !== "inactive"
  );
}

export function isAtRisk(
  c: Customer,
  t: RfmThresholds,
  now = Date.now(),
) {
  return (
    c.completedServiceCount >= 1 &&
    c.status !== "inactive" &&
    daysSince(c.lastVisitAt, now) > t.atRiskDays &&
    daysSince(c.lastVisitAt, now) <= t.inactiveDays
  );
}

export function isInactiveCohort(
  c: Customer,
  t: RfmThresholds,
  now = Date.now(),
) {
  return (
    c.status === "inactive" ||
    (c.completedServiceCount >= 1 &&
      daysSince(c.lastVisitAt, now) > t.inactiveDays)
  );
}

export function isReturning(c: Customer, t: RfmThresholds) {
  return c.completedServiceCount >= t.returningMinVisits;
}

export function rebookingOpportunities(
  bundle: VerticalBundle,
  now = Date.now(),
) {
  const upcoming = new Set(
    bundle.bookings
      .filter((b) =>
        ["upcoming", "confirmed", "in_service"].includes(b.status),
      )
      .map((b) => b.customerId),
  );
  return bundle.customers.filter(
    (c) =>
      c.completedServiceCount >= 1 &&
      !upcoming.has(c.id) &&
      c.status !== "inactive" &&
      daysSince(c.lastVisitAt, now) >= 20,
  );
}

export function retentionEffectiveness(bundle: VerticalBundle, t: RfmThresholds) {
  const total = bundle.customers.length || 1;
  const returning = bundle.customers.filter((c) => isReturning(c, t)).length;
  const atRisk = bundle.customers.filter((c) => isAtRisk(c, t)).length;
  const inactive = bundle.customers.filter((c) =>
    isInactiveCohort(c, t),
  ).length;
  const vip = bundle.customers.filter((c) =>
    isVip(c, t, bundle.posConnected),
  ).length;
  const rebook = rebookingOpportunities(bundle).length;
  return {
    total,
    returning,
    returningRate: Math.round((returning / total) * 100),
    atRisk,
    inactive,
    vip,
    rebook,
    note: "Rule-based demo thresholds (localStorage) — không phải AI",
  };
}
