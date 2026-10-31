"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function ShiftsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const techs = useMemo(
    () => (bundle?.team ?? []).filter((t) => t.role === "technician"),
    [bundle],
  );
  const dayShifts = useMemo(
    () => (bundle?.shifts ?? []).filter((s) => s.date === date),
    [bundle, date],
  );

  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Ca làm KTV"
        description="Seed Mon–Sat · dùng để cảnh báo ngoài ca khi đặt lịch"
      />
      <label className="mb-3 block text-xs font-semibold text-slate-500">
        Ngày
        <input
          type="date"
          className="mt-1 block h-11 rounded-[10px] border border-slate-200 px-3 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <div className="space-y-2">
        {techs.map((t) => {
          const sh = dayShifts.find((s) => s.technicianId === t.id);
          return (
            <Card
              key={t.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {bundle.branches.find((b) => b.id === t.branchId)?.name}
                </p>
              </div>
              <p className="text-sm font-bold text-emerald-700">
                {sh ? `${sh.startHour}:00 – ${sh.endHour}:00` : "Nghỉ"}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
