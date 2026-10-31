"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getRebookingOpportunities } from "@/lib/selectors";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function RebookingPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const rows = getRebookingOpportunities(bundle);

  return (
    <div>
      <PageHeader
        title="Chưa tái đặt lịch"
        description="Có DV completed · chưa có lịch upcoming/confirmed · rule demo"
        actions={
          <Link href="/retention/rebooking">
            <Button variant="outline">Retention view</Button>
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Không có cơ hội tái đặt" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {rows.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{c.fullName}</p>
                    <p className="text-sm text-slate-500">
                      {c.completedServiceCount} DV · lần ghé{" "}
                      {formatDateTime(c.lastVisitAt)} · {c.assigneeName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--brand-600)]">
                    Mở 360
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
