"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { buildInteractionFeed } from "@/lib/care-utils";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function CareInteractionsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const [q, setQ] = useState("");
  const feed = useMemo(() => {
    if (!bundle) return [];
    const all = buildInteractionFeed(bundle);
    if (!q.trim()) return all.slice(0, 80);
    const needle = q.toLowerCase();
    return all
      .filter((r) => {
        const c = bundle.customers.find((x) => x.id === r.customerId);
        return `${r.title} ${r.detail} ${c?.fullName ?? ""}`
          .toLowerCase()
          .includes(needle);
      })
      .slice(0, 80);
  }, [bundle, q]);

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lịch sử tương tác"
        description="Gộp task · staff note · Zalo message từ cùng dataset"
      />
      <Input
        placeholder="Lọc theo khách / nội dung…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />
      {feed.length === 0 ? (
        <EmptyState title="Không có tương tác" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {feed.map((r) => {
              const c = bundle.customers.find((x) => x.id === r.customerId);
              return (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      status={
                        r.kind === "zalo"
                          ? "sent"
                          : r.kind === "note"
                            ? "open"
                            : "follow_up"
                      }
                      label={r.kind}
                    />
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(r.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.detail}</p>
                  <Link
                    href={`/customers/${r.customerId}`}
                    className="text-xs font-semibold text-[var(--brand-600)]"
                  >
                    {c?.fullName ?? r.customerId}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
