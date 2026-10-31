"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { cn, formatDate, formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function FinancePage() {
  const bundle = useAppStore((s) => s.bundle);
  const payDebt = useAppStore((s) => s.payDebt);
  if (!bundle) return null;

  const openDebts = bundle.debts.filter((d) => d.status !== "paid");
  const totalOpen = openDebts.reduce(
    (s, d) => s + (d.amountVnd - d.paidVnd),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Công nợ"
        description="Mock thu nợ — không thay sổ kế toán / POS"
      />
      <Card className="mb-3 border-rose-200 bg-debt-soft p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase">
          Tổng còn phải thu
        </p>
        <p
          className={cn(
            "text-2xl font-bold tabular-nums",
            totalOpen > 0 ? "text-debt" : "text-gain",
          )}
        >
          {formatVnd(totalOpen)}
        </p>
        <p className="text-xs text-slate-500">{openDebts.length} khoản mở</p>
      </Card>
      <ul className="space-y-2">
        {bundle.debts.length === 0 ? (
          <Card className="p-4 text-sm text-slate-500">Chưa có công nợ.</Card>
        ) : (
          bundle.debts.map((d) => {
            const c = bundle.customers.find((x) => x.id === d.customerId);
            const remain = d.amountVnd - d.paidVnd;
            const badgeStatus =
              d.status === "open"
                ? "debt_open"
                : d.status === "partial"
                  ? "partial"
                  : "paid";
            return (
              <Card
                key={d.id}
                className={cn(
                  "flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between",
                  remain > 0 && "border-rose-100",
                )}
              >
                <div>
                  <Link
                    href={`/customers/${d.customerId}`}
                    className="font-semibold text-[var(--brand-600)] underline"
                  >
                    {c?.fullName ?? d.customerId}
                  </Link>
                  <p className="text-sm text-slate-600">{d.reason}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(d.createdAt)} · Đã thu {formatVnd(d.paidVnd)} /
                    {formatVnd(d.amountVnd)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={badgeStatus} />
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      remain > 0 ? "text-debt" : "text-gain",
                    )}
                  >
                    {formatVnd(remain)}
                  </span>
                  {d.status !== "paid" ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => payDebt(d.id, remain)}
                    >
                      Thu đủ
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })
        )}
      </ul>
    </div>
  );
}
