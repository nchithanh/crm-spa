import type { Booking, TechShift } from "@/lib/types";

const BLOCKING: Booking["status"][] = [
  "upcoming",
  "confirmed",
  "in_service",
];

function range(startIso: string, durationMinutes: number) {
  const start = Date.parse(startIso);
  const end = start + durationMinutes * 60_000;
  return { start, end };
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return aStart < bEnd && bStart < aEnd;
}

export type ConflictHit = {
  type: "technician" | "resource" | "shift";
  message: string;
  bookingId?: string;
};

/** Kiểm tra trùng KTV / giường và ca làm (mock). */
export function findBookingConflicts(opts: {
  bookings: Booking[];
  shifts: TechShift[];
  scheduledAt: string;
  durationMinutes: number;
  technicianId?: string;
  resourceId?: string;
  ignoreBookingId?: string;
}): ConflictHit[] {
  const {
    bookings,
    shifts,
    scheduledAt,
    durationMinutes,
    technicianId,
    resourceId,
    ignoreBookingId,
  } = opts;
  const { start, end } = range(scheduledAt, durationMinutes);
  const hits: ConflictHit[] = [];
  const day = scheduledAt.slice(0, 10);
  const hour = new Date(scheduledAt).getHours();
  const endHour = new Date(end).getHours() + (new Date(end).getMinutes() > 0 ? 1 : 0);

  if (technicianId) {
    const dayShifts = shifts.filter(
      (s) => s.technicianId === technicianId && s.date === day,
    );
    if (dayShifts.length > 0) {
      const inShift = dayShifts.some(
        (s) => hour >= s.startHour && endHour <= s.endHour,
      );
      if (!inShift) {
        hits.push({
          type: "shift",
          message: "Khung giờ nằm ngoài ca làm của KTV trong ngày này.",
        });
      }
    }
  }

  for (const b of bookings) {
    if (b.id === ignoreBookingId) continue;
    if (!BLOCKING.includes(b.status)) continue;
    const dur = b.durationMinutes ?? 60;
    const br = range(b.scheduledAt, dur);
    if (!overlaps(start, end, br.start, br.end)) continue;

    if (technicianId && b.technicianId === technicianId) {
      hits.push({
        type: "technician",
        message: `Trùng KTV với lịch ${b.serviceName}`,
        bookingId: b.id,
      });
    }
    if (resourceId && b.resourceId === resourceId) {
      hits.push({
        type: "resource",
        message: `Trùng giường/phòng với lịch ${b.serviceName}`,
        bookingId: b.id,
      });
    }
  }

  return hits;
}
