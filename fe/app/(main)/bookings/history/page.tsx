"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function BookingHistoryPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const rows = bundle.bookings
    .filter((b) => b.status === "completed")
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    .slice(0, 80);

  return (
    <div>
      <PageHeader
        title="Lịch sử sử dụng dịch vụ"
        description="Booking completed · đọc từ mock Ops dataset"
        actions={
          <Link href="/bookings">
            <Button variant="outline">Lịch hẹn</Button>
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Chưa có lịch completed" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((b) => {
              const c = bundle.customers.find((x) => x.id === b.customerId);
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{b.serviceName}</p>
                    <p className="text-sm text-slate-500">
                      <Link
                        href={`/customers/${b.customerId}`}
                        className="text-[var(--brand-600)]"
                      >
                        {c?.fullName ?? b.customerId}
                      </Link>{" "}
                      · {formatDateTime(b.scheduledAt)}
                    </p>
                    {b.aftercareNote ? (
                      <p className="text-xs text-slate-400">{b.aftercareNote}</p>
                    ) : null}
                  </div>
                  <Badge status="completed" />
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
