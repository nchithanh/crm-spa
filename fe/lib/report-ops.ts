import type { Booking, CatalogService, TeamMember, VerticalBundle } from "@/lib/types";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function priceOf(b: Booking, services: CatalogService[]) {
  const svc = services.find((s) => s.id === b.serviceId);
  return svc?.priceVnd ?? 0;
}

/** DT mock theo ngày (completed) — 14 ngày gần nhất */
export function revenueByDay(bundle: VerticalBundle, days = 14) {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const b of bundle.bookings) {
    if (b.status !== "completed") continue;
    const k = dayKey(b.scheduledAt);
    if (!map.has(k)) continue;
    map.set(k, (map.get(k) ?? 0) + priceOf(b, bundle.services));
  }
  return [...map.entries()].map(([date, amount]) => ({ date, amount }));
}

export function revenueByService(bundle: VerticalBundle) {
  const map = new Map<string, { name: string; amount: number; count: number }>();
  for (const b of bundle.bookings) {
    if (b.status !== "completed") continue;
    const key = b.serviceId ?? b.serviceName;
    const cur = map.get(key) ?? {
      name: b.serviceName,
      amount: 0,
      count: 0,
    };
    cur.amount += priceOf(b, bundle.services);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function revenueByTechnician(
  bundle: VerticalBundle,
  techs: TeamMember[],
) {
  const map = new Map<string, { name: string; amount: number; count: number }>();
  for (const t of techs) {
    map.set(t.id, { name: t.name, amount: 0, count: 0 });
  }
  map.set("_none", { name: "Chưa gán", amount: 0, count: 0 });
  for (const b of bundle.bookings) {
    if (b.status !== "completed") continue;
    const key = b.technicianId ?? "_none";
    const cur = map.get(key) ?? { name: key, amount: 0, count: 0 };
    cur.amount += priceOf(b, bundle.services);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.values()]
    .filter((r) => r.count > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function noShowStats(bookings: Booking[]) {
  const relevant = bookings.filter((b) =>
    ["completed", "no_show", "cancelled"].includes(b.status),
  );
  const noShow = bookings.filter((b) => b.status === "no_show").length;
  const rate =
    relevant.length > 0 ? Math.round((noShow / relevant.length) * 100) : 0;
  return { noShow, relevant: relevant.length, rate };
}
