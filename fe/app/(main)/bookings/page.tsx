"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Columns3, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CalendarApi } from "@fullcalendar/core";
import { BookingForm } from "@/components/bookings/booking-form";
import type { CalendarView } from "@/components/bookings/schedule-calendar";
import { ScheduleTechDay } from "@/components/bookings/schedule-tech-day";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingsPageSkeleton, CalendarSkeleton } from "@/components/ui/skeleton";
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
    loading: () => <CalendarSkeleton />,
  },
);

const LIVE_STATUSES = new Set<BookingStatus>([
  "upcoming",
  "confirmed",
  "in_service",
]);

type StatusFilter = "live" | "all" | BookingStatus;
type CanvasMode = "day" | "week" | "month" | "tech";

const VIEW_PILLS: { id: CanvasMode; label: string; icon?: typeof Columns3 }[] = [
  { id: "day", label: "Ngày" },
  { id: "week", label: "Tuần" },
  { id: "month", label: "Tháng" },
  { id: "tech", label: "KTV", icon: Columns3 },
];

function toCalendarView(mode: CanvasMode): CalendarView {
  if (mode === "day") return "timeGridDay";
  if (mode === "month") return "dayGridMonth";
  return "timeGridWeek";
}

function formatTitle(date: Date, mode: CanvasMode) {
  if (mode === "tech" || mode === "day") {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (mode === "month") {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  }
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

function shiftIsoDate(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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
  const [mode, setMode] = useState<CanvasMode>("week");
  const [techDate, setTechDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [calTitle, setCalTitle] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showBook, setShowBook] = useState(false);
  const calApiRef = useRef<CalendarApi | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setShowBook(true);
    }
    const onNew = () => setShowBook(true);
    window.addEventListener("beauty:new-booking", onNew);
    return () => window.removeEventListener("beauty:new-booking", onNew);
  }, []);

  function closeOps() {
    setSelectedId(null);
    setShowBook(false);
  }

  const onApi = useCallback((api: CalendarApi) => {
    calApiRef.current = api;
    setCursorDate(api.getDate());
  }, []);

  const techs = useMemo(
    () => (bundle?.team ?? []).filter((t) => t.role === "technician"),
    [bundle],
  );

  const filtered = useMemo(() => {
    if (!bundle) return [];
    const needle = q.trim().toLowerCase();
    return bundle.bookings
      .filter((b) => {
        if (status === "all") return true;
        if (status === "live") return LIVE_STATUSES.has(b.status);
        return b.status === status;
      })
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

  if (!bundle) return <BookingsPageSkeleton />;

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

  const showOps = Boolean(selected || showBook);
  const titleDate = mode === "tech" ? new Date(`${techDate}T12:00:00`) : cursorDate;
  const toolbarTitle =
    mode === "tech" || !calTitle ? formatTitle(titleDate, mode) : calTitle;

  const statusChips: { id: StatusFilter; label: string }[] = [
    { id: "live", label: "Ca tới" },
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp tới" },
    { id: "confirmed", label: "Đã XN" },
    { id: "in_service", label: "Đang làm" },
    { id: "completed", label: "Xong" },
    { id: "no_show", label: "No-show" },
    { id: "cancelled", label: "Huỷ" },
  ];

  function goToday() {
    if (mode === "tech") {
      setTechDate(new Date().toISOString().slice(0, 10));
      return;
    }
    calApiRef.current?.today();
    setCursorDate(calApiRef.current?.getDate() ?? new Date());
  }

  function goPrev() {
    if (mode === "tech") {
      setTechDate((d) => shiftIsoDate(d, -1));
      return;
    }
    calApiRef.current?.prev();
    setCursorDate(calApiRef.current?.getDate() ?? cursorDate);
  }

  function goNext() {
    if (mode === "tech") {
      setTechDate((d) => shiftIsoDate(d, 1));
      return;
    }
    calApiRef.current?.next();
    setCursorDate(calApiRef.current?.getDate() ?? cursorDate);
  }

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100svh-4.25rem-5.75rem)] flex-col max-lg:h-[calc(100svh-4.25rem-6.75rem)] sm:-mx-5 sm:-my-5 lg:h-[calc(100svh-4.25rem)]">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex rounded-xl bg-slate-100 p-0.5">
          {VIEW_PILLS.map((pill) => {
            const Icon = pill.icon;
            const active = mode === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setMode(pill.id)}
                className={`inline-flex h-8 items-center gap-1 rounded-[10px] px-2.5 text-[11px] font-semibold ${
                  active
                    ? "bg-[var(--brand-500)] text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {Icon ? <Icon size={13} /> : null}
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Trước"
            onClick={goPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="min-w-[8.5rem] text-center text-sm font-bold text-slate-900">
            {toolbarTitle}
          </p>
          <button
            type="button"
            aria-label="Sau"
            onClick={goNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="h-8 rounded-xl px-2.5 text-[11px] font-semibold text-[var(--brand-600)] hover:bg-[var(--brand-50)]"
          >
            Hôm nay
          </button>
        </div>

        <label className="relative min-w-[10rem] flex-1 lg:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm KH, DV, KTV…"
            className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50 pr-7 pl-8 text-xs outline-none focus:border-[var(--brand-400)] focus:bg-white"
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

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
        >
          {statusChips.map((chip) => (
            <option key={chip.id} value={chip.id}>
              {chip.label}
            </option>
          ))}
        </select>
        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="h-8 max-w-[8rem] rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
        >
          <option value="all">Mọi KTV</option>
          {techs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="h-8 max-w-[8rem] rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
        >
          <option value="all">Mọi CN</option>
          {bundle.branches.map((br) => (
            <option key={br.id} value={br.id}>
              {br.name}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setShowBook((v) => !v)}
        >
          <Plus size={14} /> Đặt lịch
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-200 lg:flex-row">
        <section className="relative min-h-[42svh] min-w-0 flex-1 bg-white lg:min-h-0">
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
              view={toCalendarView(mode)}
              bookings={filtered}
              customers={bundle.customers}
              technicians={techs}
              onSelect={setSelectedId}
              onApi={onApi}
              onTitle={setCalTitle}
            />
          )}
        </section>

        {showOps ? (
          <>
            <button
              type="button"
              aria-label="Đóng"
              onClick={closeOps}
              className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
            />
            <aside className="maps-panel fixed inset-x-0 bottom-0 z-[60] flex max-h-[92svh] w-full flex-col overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:static lg:inset-auto lg:z-auto lg:max-h-none lg:w-[22.5rem] lg:shrink-0 lg:overflow-hidden lg:rounded-none lg:border-t-0 lg:border-l lg:pb-0">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 lg:hidden" />
            <div className="border-b border-slate-100 px-3 pt-3 pb-2">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--brand-600)] uppercase">
                    Lịch hẹn · Ops
                  </p>
                  <h1 className="text-base font-bold text-slate-900">
                    {selected ? selected.serviceName : "Đặt lịch mới"}
                  </h1>
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  className="text-slate-400"
                  onClick={closeOps}
                >
                  <X size={16} />
                </button>
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

            {selected ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 max-lg:flex-none max-lg:overflow-visible">
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
                  <p className="text-xs font-semibold text-emerald-700">
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
                <Link
                  href={`/customers/${selected.customerId}`}
                  className="mt-2 block text-xs font-semibold text-[var(--brand-600)] underline"
                >
                  Mở Customer 360
                </Link>
                <div className="mt-2 flex flex-wrap gap-1">
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
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Ghi chú sau liệu trình
                  </p>
                  <input
                    className="h-9 w-full rounded-xl border border-slate-200 px-2 text-xs"
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
                <div className="mt-2 flex flex-wrap gap-1.5">
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
          </>
        ) : null}
      </div>
    </div>
  );
}
