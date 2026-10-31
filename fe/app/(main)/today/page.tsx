"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { bookingsToday } from "@/lib/metrics";
import { getCareTodayRows } from "@/lib/selectors";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function TodayPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;
  const bookings = bookingsToday(bundle.bookings);
  const care = getCareTodayRows(bundle);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hoạt động hôm nay"
        description="Lịch + care queue · cùng mock clock/dataset"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-bold">
            Lịch hôm nay ({bookings.length})
          </h2>
          <ul className="divide-y divide-slate-100">
            {bookings.slice(0, 12).map((b) => {
              const c = bundle.customers.find((x) => x.id === b.customerId);
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="truncate">
                    {b.serviceName} · {c?.fullName} ·{" "}
                    {formatDateTime(b.scheduledAt)}
                  </span>
                  <Badge status={b.status} />
                </li>
              );
            })}
          </ul>
          <Link
            href="/bookings"
            className="mt-2 inline-block text-xs font-semibold text-[var(--brand-600)]"
          >
            Mở lịch
          </Link>
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-bold">Care today ({care.length})</h2>
          <ul className="divide-y divide-slate-100">
            {care.map((r) => (
              <li key={r.id} className="py-2 text-sm">
                <Link
                  href={`/customers/${r.customerId}`}
                  className="font-medium text-[var(--brand-600)]"
                >
                  {r.customerName}
                </Link>
                <p className="text-xs text-slate-500">
                  {r.reason} · {r.assigneeName}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
