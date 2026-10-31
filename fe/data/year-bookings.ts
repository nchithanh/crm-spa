import type {
  Booking,
  BookingStatus,
  CatalogService,
} from "@/lib/types";

type Cust = { id: string; branchId: string };

/**
 * Sinh booking hardcode trải đều tháng 1→12 của `year`.
 * Gắn serviceId / technicianId / duration từ catalog khi có.
 */
export function buildYearBookings(opts: {
  prefix: string;
  year: number;
  customers: Cust[];
  services: CatalogService[];
  /** fallback nếu services rỗng */
  serviceNames?: string[];
  technicianIds: string[];
  resourceIds?: string[];
  density?: "rich" | "thin";
}): Booking[] {
  const {
    prefix,
    year,
    customers,
    services,
    serviceNames = [],
    technicianIds,
    resourceIds = [],
    density = "rich",
  } = opts;
  if (!customers.length) return [];
  if (!services.length && !serviceNames.length) return [];

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const out: Booking[] = [];
  let seq = 0;

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dow = new Date(year, month, day).getDay();
      const isWeekend = dow === 0 || dow === 6;
      let count: number;
      if (density === "rich") {
        count = isWeekend ? 1 + ((day + month) % 2) : 3 + ((day + month) % 3);
      } else {
        count = isWeekend ? (day % 3 === 0 ? 1 : 0) : 1 + (day % 2);
      }
      if (count === 0) continue;

      for (let s = 0; s < count; s++) {
        seq += 1;
        const cust = customers[(seq + day + month) % customers.length]!;
        const svc =
          services.length > 0
            ? services[(seq + s + month) % services.length]!
            : null;
        const serviceName = svc?.name ?? serviceNames[(seq + s) % serviceNames.length]!;
        const hour = 9 + ((seq + s * 2) % 9);
        const minute = s % 2 === 0 ? 0 : 30;
        const scheduled = new Date(year, month, day, hour, minute, 0, 0);
        const t = scheduled.getTime();

        let status: BookingStatus;
        if (t < todayStart) {
          const r = seq % 14;
          if (r === 0) status = "cancelled";
          else if (r === 1) status = "rescheduled";
          else if (r === 2) status = "no_show";
          else status = "completed";
        } else if (scheduled.toDateString() === now.toDateString()) {
          if (hour < now.getHours() - 1) status = "completed";
          else if (hour === now.getHours()) status = "in_service";
          else if (seq % 3 === 0) status = "confirmed";
          else status = "upcoming";
        } else {
          const r = seq % 17;
          if (r === 0) status = "cancelled";
          else if (r === 1) status = "rescheduled";
          else if (r === 2) status = "confirmed";
          else status = "upcoming";
        }

        let techId =
          technicianIds.length > 0
            ? technicianIds[(seq + s) % technicianIds.length]
            : undefined;
        if (svc?.technicianIds?.length) {
          techId =
            svc.technicianIds[(seq + s) % svc.technicianIds.length] ?? techId;
        }

        const branchResources = resourceIds.length
          ? resourceIds
          : [];
        // resource id list may be mixed branches — pick by index
        const resourceId =
          branchResources.length > 0
            ? branchResources[(seq + s) % branchResources.length]
            : undefined;

        out.push({
          id: `bk_${prefix}_${seq}`,
          customerId: cust.id,
          serviceId: svc?.id,
          serviceName,
          scheduledAt: scheduled.toISOString(),
          status,
          branchId: cust.branchId,
          technicianId: techId,
          resourceId,
          durationMinutes: svc?.durationMinutes ?? 60,
          aftercareNote:
            status === "completed" && seq % 5 === 0
              ? "Da ổn định, nhắc chống nắng."
              : undefined,
        });
      }
    }
  }

  return out;
}
