"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarDays, Columns3, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingForm } from "@/components/bookings/booking-form";
import { ScheduleTechDay } from "@/components/bookings/schedule-tech-day";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import type { Booking, BookingStatus } from "@/lib/types";

const ScheduleCalendar = dynamic(
  () =>
    import("@/components/bookings/schedule-calendar").then(
      (m) => m.ScheduleCalendar,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-white text-sm text-slate-500">
        Đang tải lịch…
      </div>
    ),
  },
);

type StatusFilter = "all" | BookingStatus;
type CanvasMode = "calendar" | "tech";

export default function BookingsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const simulateBookingEvent = useAppStore((s) => s.simulateBookingEvent);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const setAftercareNote = useAppStore((s) => s.setAftercareNote);
  const [aftercareDraft, setAftercareDraft] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [branchId, setBranchId] = useState<string | "all">("all");
  const [techFilter, setTechFilter] = useState<string | "all">("all");
  const [mode, setMode] = useState<CanvasMode>("tech");
  const [techDate, setTechDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showBook, setShowBook] = useState(false);

  const techs = useMemo(
    () => (bundle?.team ?? []).filter((t) => t.role === "technician"),
    [bundle],
  );

  const filtered = useMemo(() => {
    if (!bundle) return [];
    const needle = q.trim().toLowerCase();
    return bundle.bookings
      .filter((b) => (status === "all" ? true : b.status === status))
      .filter((b) => (branchId === "all" ? true : b.branchId === branchId))
      .filter((b) =>
        techFilter === "all" ? true : b.technicianId === techFilter,
      )
      .filter((b) => {
        if (!needle) return true;
        const c = bundle.customers.find((x) => x.id === b.customerId);
        const br = bundle.branches.find((x) => x.id === b.branchId);
        const tech = bundle.team.find((t) => t.id === b.technicianId);
        return (
          b.serviceName.toLowerCase().includes(needle) ||
          (c?.fullName ?? "").toLowerCase().includes(needle) ||
          (br?.name ?? "").toLowerCase().includes(needle) ||
          (tech?.name ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [bundle, q, status, branchId, techFilter]);

  if (!bundle) return null;

  const selected = bundle.bookings.find((b) => b.id === selectedId) ?? null;
  const selectedCustomer = selected
    ? bundle.customers.find((c) => c.id === selected.customerId)
    : null;
  const selectedBranch = selected
    ? bundle.branches.find((b) => b.id === selected.branchId)
    : null;
  const selectedTech = selected
    ? bundle.team.find((t) => t.id === selected.technicianId)
    : null;
  const selectedPkg = selected?.customerPackageId
    ? bundle.packages.find((p) => p.id === selected.customerPackageId)
    : null;
  const selectedRes = selected?.resourceId
    ? bundle.resources.find((r) => r.id === selected.resourceId)
    : null;

  const statusChips: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp tới" },
    { id: "confirmed", label: "Đã XN" },
    { id: "in_service", label: "Đang làm" },
    { id: "completed", label: "Xong" },
    { id: "no_show", label: "No-show" },
    { id: "cancelled", label: "Huỷ" },
  ];

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100svh-4.25rem-5.75rem)] flex-col max-lg:h-[calc(100svh-4.25rem-6.75rem)] sm:-mx-5 sm:-my-5 lg:h-[calc(100svh-4.25rem)]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-200 lg:flex-row">
        <section className="relative min-h-[42svh] min-w-0 flex-1 bg-white lg:min-h-0">
          <div className="absolute top-3 left-3 z-10 flex rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              aria-label="Theo KTV"
              onClick={() => setMode("tech")}
              className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${
                mode === "tech"
                  ? "bg-[var(--brand-500)] text-white"
                  : "text-slate-500"
              }`}
            >
              <Columns3 size={14} /> KTV
            </button>
            <button
              type="button"
              aria-label="Lịch tháng"
              onClick={() => setMode("calendar")}
              className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${
                mode === "calendar"
                  ? "bg-[var(--brand-500)] text-white"
                  : "text-slate-500"
              }`}
            >
              <CalendarDays size={14} /> Tháng
            </button>
          </div>
          {mode === "tech" ? (
            <ScheduleTechDay
              date={techDate}
              bookings={filtered}
              technicians={techs}
              customers={bundle.customers}
              resources={bundle.resources}
              shifts={bundle.shifts}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChangeDate={setTechDate}
            />
          ) : (
            <ScheduleCalendar
              bookings={filtered}
              customers={bundle.customers}
              technicians={techs}
              onSelect={setSelectedId}
            />
          )}
        </section>

        <aside className="maps-panel flex max-h-[48svh] w-full shrink-0 flex-col overflow-hidden border-t border-slate-200 bg-white lg:max-h-none lg:w-[22.5rem] lg:border-t-0 lg:border-l">
          <div className="border-b border-slate-100 px-3 pt-3 pb-2">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--brand-600)] uppercase">
                  Lịch hẹn · Ops
                </p>
                <h1 className="text-base font-bold text-slate-900">
                  {filtered.length} lịch
                </h1>
              </div>
              <Button size="sm" onClick={() => setShowBook((v) => !v)}>
                <Plus size={14} /> Đặt lịch
              </Button>
            </div>

            {showBook ? (
              <Card className="mb-2 p-3">
                <BookingForm
                  onDone={(id) => {
                    setSelectedId(id);
                    setShowBook(false);
                    setNote("Đã tạo lịch từ catalog");
                  }}
                />
              </Card>
            ) : null}

            <label className="relative block">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm KH, DV, KTV…"
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pr-8 pl-8 text-sm outline-none focus:border-[var(--brand-400)] focus:bg-white"
              />
              {q ? (
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
                  onClick={() => setQ("")}
                  aria-label="Xoá"
                >
                  <X size={14} />
                </button>
              ) : null}
            </label>

            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {statusChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatus(chip.id)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                    status === chip.id
                      ? "bg-[var(--brand-500)] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setTechFilter("all")}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  techFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Mọi KTV
              </button>
              {techs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setTechFilter((prev) => (prev === t.id ? "all" : t.id))
                  }
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    techFilter === t.id
                      ? "bg-slate-800 text-white"
                      : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setBranchId("all")}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  branchId === "all"
                    ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
                    : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Mọi CN
              </button>
              {bundle.branches.map((br) => (
                <button
                  key={br.id}
                  type="button"
                  onClick={() =>
                    setBranchId((prev) => (prev === br.id ? "all" : br.id))
                  }
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    branchId === br.id
                      ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
                      : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {br.name}
                </button>
              ))}
            </div>
          </div>

          {note ? (
            <div className="border-b border-[var(--brand-100)] bg-[var(--brand-50)] px-3 py-2 text-xs text-[var(--brand-700)]">
              {note}{" "}
              <Link
                href="/automations/runs"
                className="font-semibold underline"
              >
                Executions
              </Link>
            </div>
          ) : null}

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                Không có lịch khớp bộ lọc.
              </li>
            ) : (
              filtered.slice(0, 80).map((b) => listRow(b))
            )}
          </ul>

          {selected ? (
            <div className="border-t border-slate-200 bg-white px-3 py-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{selected.serviceName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(selected.scheduledAt)}
                    {selected.durationMinutes
                      ? ` · ${selected.durationMinutes}′`
                      : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedBranch?.name} · {selectedCustomer?.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    KTV: {selectedTech?.name ?? "—"}
                    {selectedRes ? ` · ${selectedRes.name}` : ""}
                  </p>
                  {selectedPkg ? (
                    <p className="text-xs font-semibold text-[var(--brand-700)]">
                      Gói: còn {selectedPkg.remainingSessions}/
                      {selectedPkg.totalSessions}
                    </p>
                  ) : null}
                  {selected.aftercareNote ? (
                    <p className="mt-1 text-xs text-slate-600">
                      Aftercare: {selected.aftercareNote}
                    </p>
                  ) : null}
                  <div className="mt-1">
                    <Badge status={selected.status} />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  className="text-slate-400"
                  onClick={() => setSelectedId(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <Link
                href={`/customers/${selected.customerId}`}
                className="mb-2 block text-xs font-semibold text-[var(--brand-600)] underline"
              >
                Mở Customer 360
              </Link>
              <div className="mb-2 flex flex-wrap gap-1">
                {(
                  [
                    ["confirmed", "XN"],
                    ["in_service", "Đang làm"],
                    ["completed", "Xong"],
                    ["no_show", "No-show"],
                    ["cancelled", "Huỷ"],
                  ] as const
                ).map(([st, label]) => (
                  <Button
                    key={st}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (st === "completed") {
                        const n = simulateBookingEvent(
                          selected.id,
                          "booking.completed",
                        );
                        setNote(
                          `Hoàn thành (+ trừ gói nếu có) · ${n} workflow`,
                        );
                        return;
                      }
                      if (st === "cancelled") {
                        const n = simulateBookingEvent(
                          selected.id,
                          "booking.cancelled",
                        );
                        setNote(`Huỷ · ${n} workflow`);
                        return;
                      }
                      updateBookingStatus(selected.id, st);
                      setNote(`Đổi status → ${st}`);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <div className="mb-2 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500">
                  Ghi chú sau liệu trình
                </p>
                <input
                  className="h-9 w-full rounded-[10px] border border-slate-200 px-2 text-xs"
                  placeholder="VD: Da ổn, nhắc chống nắng…"
                  value={aftercareDraft}
                  onChange={(e) => setAftercareDraft(e.target.value)}
                  onFocus={() =>
                    setAftercareDraft(selected.aftercareNote ?? "")
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAftercareNote(selected.id, aftercareDraft.trim());
                    setNote("Đã lưu ghi chú aftercare");
                  }}
                >
                  Lưu ghi chú
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const n = simulateBookingEvent(
                      selected.id,
                      "booking.created",
                    );
                    setNote(`booking.created → ${n} workflow`);
                  }}
                >
                  Sim created
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );

  function listRow(b: Booking) {
    const c = bundle!.customers.find((x) => x.id === b.customerId);
    const tech = bundle!.team.find((t) => t.id === b.technicianId);
    const active = selectedId === b.id;
    return (
      <li key={b.id} className="border-b border-slate-50">
        <button
          type="button"
          onClick={() => setSelectedId(b.id)}
          className={`flex w-full flex-col gap-1 px-3 py-3 text-left transition ${
            active ? "bg-[var(--brand-50)]" : "hover:bg-slate-50"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {b.serviceName}
            </p>
            <Badge status={b.status} />
          </div>
          <p className="text-xs font-medium text-[var(--brand-700)]">
            {c?.fullName ?? "—"}
          </p>
          <p className="text-[11px] text-slate-500">
            {formatDateTime(b.scheduledAt)}
            {tech ? ` · ${tech.name}` : ""}
          </p>
        </button>
      </li>
    );
  }
}
