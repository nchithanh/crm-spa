"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findBookingConflicts } from "@/lib/booking-conflict";
import { useAppStore } from "@/stores/app-store";

export function BookingForm({
  defaultCustomerId,
  onDone,
}: {
  defaultCustomerId?: string;
  onDone?: (bookingId: string) => void;
}) {
  const bundle = useAppStore((s) => s.bundle);
  const createBooking = useAppStore((s) => s.createBooking);

  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [serviceId, setServiceId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [err, setErr] = useState("");
  const [warn, setWarn] = useState<string[]>([]);

  const services = useMemo(
    () => (bundle?.services ?? []).filter((s) => s.active),
    [bundle],
  );
  const techs = useMemo(
    () => (bundle?.team ?? []).filter((t) => t.role === "technician"),
    [bundle],
  );
  const customer = bundle?.customers.find((c) => c.id === customerId);
  const resources = useMemo(() => {
    if (!bundle || !customer) return bundle?.resources ?? [];
    return bundle.resources.filter((r) => r.branchId === customer.branchId);
  }, [bundle, customer]);
  const pkgs = useMemo(
    () =>
      (bundle?.packages ?? []).filter(
        (p) =>
          p.customerId === customerId &&
          p.status === "active" &&
          p.remainingSessions > 0,
      ),
    [bundle, customerId],
  );

  if (!bundle) return null;

  const svc = services.find((s) => s.id === serviceId);

  function previewConflicts() {
    if (!svc || !when) return;
    const hits = findBookingConflicts({
      bookings: bundle!.bookings,
      shifts: bundle!.shifts,
      scheduledAt: new Date(when).toISOString(),
      durationMinutes: svc.durationMinutes,
      technicianId: technicianId || undefined,
      resourceId: resourceId || undefined,
    });
    setWarn(hits.map((h) => h.message));
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500">
        Khách hàng
        <select
          className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setPackageId("");
            setResourceId("");
          }}
          disabled={!!defaultCustomerId}
        >
          <option value="">Chọn khách…</option>
          {bundle.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-500">
        Dịch vụ (catalog)
        <select
          className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={serviceId}
          onChange={(e) => {
            setServiceId(e.target.value);
            const s = services.find((x) => x.id === e.target.value);
            if (s?.technicianIds?.[0]) setTechnicianId(s.technicianIds[0]);
          }}
        >
          <option value="">Chọn dịch vụ…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.durationMinutes}′ ·{" "}
              {s.priceVnd.toLocaleString("vi-VN")}đ
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-500">
        Kỹ thuật viên
        <select
          className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          onBlur={previewConflicts}
        >
          <option value="">Chưa gán</option>
          {techs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-500">
        Giường / phòng / ghế
        <select
          className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          onBlur={previewConflicts}
        >
          <option value="">Chưa chọn</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.kind})
            </option>
          ))}
        </select>
      </label>
      {pkgs.length > 0 ? (
        <label className="block text-xs font-semibold text-slate-500">
          Trừ từ gói (optional)
          <select
            className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
          >
            <option value="">Không trừ gói</option>
            {pkgs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.serviceName} · còn {p.remainingSessions}/{p.totalSessions}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block text-xs font-semibold text-slate-500">
        Thời gian
        <Input
          className="mt-1"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          onBlur={previewConflicts}
        />
      </label>
      {warn.length > 0 ? (
        <ul className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {warn.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}
      {err ? <p className="text-xs text-rose-600">{err}</p> : null}
      <Button
        size="sm"
        className="w-full"
        onClick={() => {
          if (!customerId || !serviceId || !when) {
            setErr("Chọn đủ khách, dịch vụ và thời gian.");
            return;
          }
          const iso = new Date(when).toISOString();
          const res = createBooking({
            customerId,
            serviceId,
            scheduledAt: iso,
            technicianId: technicianId || undefined,
            resourceId: resourceId || undefined,
            customerPackageId: packageId || undefined,
            status: "confirmed",
            allowConflict: false,
          });
          if (!res.id) {
            setErr(res.conflicts.join(" · ") || "Không tạo được lịch.");
            setWarn(res.conflicts);
            return;
          }
          setErr("");
          setWarn(res.conflicts);
          onDone?.(res.id);
        }}
      >
        Xác nhận đặt lịch
      </Button>
      {warn.length > 0 ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            if (!customerId || !serviceId || !when) return;
            const res = createBooking({
              customerId,
              serviceId,
              scheduledAt: new Date(when).toISOString(),
              technicianId: technicianId || undefined,
              resourceId: resourceId || undefined,
              customerPackageId: packageId || undefined,
              status: "confirmed",
              allowConflict: true,
            });
            if (res.id) onDone?.(res.id);
          }}
        >
          Vẫn lưu (bỏ qua trùng)
        </Button>
      ) : null}
    </div>
  );
}
