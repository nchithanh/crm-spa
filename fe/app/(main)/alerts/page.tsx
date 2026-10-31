"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getAtRiskCustomers, getOverdueTasks, getLowPackages } from "@/lib/selectors";
import { useAppStore } from "@/stores/app-store";

export default function AlertsPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const overdue = getOverdueTasks(bundle).slice(0, 10);
  const atRisk = getAtRiskCustomers(bundle).slice(0, 8);
  const low = getLowPackages(bundle).slice(0, 8);
  const failedZalo = bundle.messages
    .filter((m) => m.status === "failed")
    .slice(0, 8);
  const failedRuns = bundle.runs
    .filter((r) => r.status === "failed")
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cảnh báo & cơ hội"
        description="Rule-based demo · không AI churn"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <AlertBlock
          title="Task quá hạn"
          href="/tasks"
          items={overdue.map((t) => ({
            id: t.id,
            label: t.title,
            href: `/customers/${t.customerId}`,
            badge: "overdue",
          }))}
        />
        <AlertBlock
          title="Zalo failed"
          href="/communication/history"
          items={failedZalo.map((m) => ({
            id: m.id,
            label: m.error || "failed",
            href: `/communication?customerId=${m.customerId}`,
            badge: "failed",
          }))}
        />
        <AlertBlock
          title="At-risk"
          href="/retention/at-risk"
          items={atRisk.map((c) => ({
            id: c.id,
            label: c.fullName,
            href: `/customers/${c.id}`,
            badge: "inactive",
          }))}
        />
        <AlertBlock
          title="Gói ≤2 buổi"
          href="/packages"
          items={low.map((p) => ({
            id: p.id,
            label: `${p.serviceName} · còn ${p.remainingSessions}`,
            href: `/customers/${p.customerId}`,
            badge: "active",
          }))}
        />
        <AlertBlock
          title="Workflow failed"
          href="/automations/runs"
          items={failedRuns.map((r) => ({
            id: r.id,
            label: r.workflowName,
            href: `/automations/runs/${r.id}`,
            badge: "failed",
          }))}
        />
      </div>
    </div>
  );
}

function AlertBlock({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: { id: string; label: string; href: string; badge: string }[];
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex justify-between">
        <h2 className="text-sm font-bold">{title}</h2>
        <Link
          href={href}
          className="text-[11px] font-semibold text-[var(--brand-600)]"
        >
          Xem
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Không có.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={i.href} className="truncate hover:text-[var(--brand-600)]">
                {i.label}
              </Link>
              <Badge status={i.badge} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
