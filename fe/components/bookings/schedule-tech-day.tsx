"use client";

import { Badge } from "@/components/ui/badge";
import type {
  Booking,
  Customer,
  SpaResource,
  TeamMember,
  TechShift,
} from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function ScheduleTechDay({
  date,
  bookings,
  technicians,
  customers,
  resources,
  shifts,
  selectedId,
  onSelect,
  onChangeDate,
}: {
  date: string; // YYYY-MM-DD
  bookings: Booking[];
  technicians: TeamMember[];
  customers: Customer[];
  resources: SpaResource[];
  shifts: TechShift[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChangeDate: (isoDate: string) => void;
}) {
  const dayBookings = bookings
    .filter((b) => dayKey(b.scheduledAt) === date)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const unassigned = dayBookings.filter((b) => !b.technicianId);

  function shiftDay(delta: number) {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + delta);
    onChangeDate(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <button
          type="button"
          className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100"
          onClick={() => shiftDay(-1)}
        >
          ← Trước
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-wide text-[var(--brand-600)] uppercase">
            Lịch theo KTV
          </p>
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="text-sm font-bold text-slate-900 outline-none"
          />
        </div>
        <button
          type="button"
          className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100"
          onClick={() => shiftDay(1)}
        >
          Sau →
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-3">
        <div
          className="grid min-w-[40rem] gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.max(technicians.length, 1) + (unassigned.length ? 1 : 0)}, minmax(11rem, 1fr))`,
          }}
        >
          {technicians.map((tech) => {
            const items = dayBookings.filter((b) => b.technicianId === tech.id);
            const shift = shifts.find(
              (s) => s.technicianId === tech.id && s.date === date,
            );
            return (
              <div
                key={tech.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/80"
              >
                <div className="border-b border-slate-200 px-3 py-2">
                  <p className="text-sm font-bold text-slate-900">{tech.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {items.length} lịch
                    {shift
                      ? ` · ca ${shift.startHour}–${shift.endHour}h`
                      : " · nghỉ / chưa có ca"}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col gap-2 p-2">
                  {items.length === 0 ? (
                    <li className="rounded-[10px] border border-dashed border-slate-200 bg-white px-2 py-6 text-center text-xs text-slate-400">
                      Trống
                    </li>
                  ) : (
                    items.map((b) => {
                      const c = customers.find((x) => x.id === b.customerId);
                      const active = selectedId === b.id;
                      return (
                        <li key={b.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(b.id)}
                            className={`w-full rounded-[10px] border px-2.5 py-2 text-left transition ${
                              active
                                ? "border-[var(--brand-400)] bg-[var(--brand-50)]"
                                : "border-slate-100 bg-white hover:border-brand"
                            }`}
                          >
                            <p className="text-[11px] font-semibold text-[var(--brand-700)]">
                              {formatDateTime(b.scheduledAt).split(" ").pop()}
                              {b.durationMinutes
                                ? ` · ${b.durationMinutes}′`
                                : ""}
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                              {b.serviceName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {c?.fullName ?? "—"}
                              {b.resourceId
                                ? ` · ${resources.find((r) => r.id === b.resourceId)?.name ?? ""}`
                                : ""}
                            </p>
                            <div className="mt-1">
                              <Badge status={b.status} />
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            );
          })}
          {unassigned.length > 0 ? (
            <div className="flex flex-col rounded-2xl border border-amber-200 bg-amber-50/50">
              <div className="border-b border-amber-200 px-3 py-2">
                <p className="text-sm font-bold">Chưa gán KTV</p>
                <p className="text-[11px] text-slate-500">
                  {unassigned.length} lịch
                </p>
              </div>
              <ul className="flex flex-col gap-2 p-2">
                {unassigned.map((b) => {
                  const c = customers.find((x) => x.id === b.customerId);
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(b.id)}
                        className="w-full rounded-[10px] border border-amber-100 bg-white px-2.5 py-2 text-left"
                      >
                        <p className="text-xs font-bold">{b.serviceName}</p>
                        <p className="text-[11px] text-slate-500">
                          {c?.fullName} · {formatDateTime(b.scheduledAt)}
                        </p>
                        <Badge status={b.status} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
