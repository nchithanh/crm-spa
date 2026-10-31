"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { evaluateSegmentMembers } from "@/lib/segment-eval";
import { useAppStore } from "@/stores/app-store";

export default function SegmentsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const deleteSegment = useAppStore((s) => s.deleteSegment);

  const rows = useMemo(() => {
    if (!bundle) return [];
    return bundle.segments.map((s) => {
      const live = evaluateSegmentMembers(
        bundle.customers,
        s.criteria?.length ? s.criteria : [],
        bundle.bookings,
        {
          matchMode: s.matchMode ?? "and",
          packages: bundle.packages,
        },
      );
      return { ...s, liveCount: live.length || s.memberIds.length };
    });
  }, [bundle]);

  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Phân nhóm khách hàng"
        description="Segment builder AND/OR · preview live · xóa được"
        actions={
          <Link href="/segments/new">
            <Button>Tạo segment</Button>
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="Chưa có segment" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((s) => (
            <Card key={s.id} className="flex h-full flex-col p-4">
              <Link href={`/segments/${s.id}`} className="flex-1">
                <p className="font-bold hover:text-[var(--brand-600)]">
                  {s.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                <p className="mt-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                  Logic {(s.matchMode ?? "and").toUpperCase()}
                </p>
                <ul className="mt-2 space-y-1">
                  {(s.criteriaSummary ?? []).slice(0, 4).map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold text-[var(--brand-600)]">
                  {s.liveCount} thành viên (live)
                </p>
              </Link>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Link href={`/segments/${s.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    Xem
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (!window.confirm(`Xóa segment “${s.name}”?`)) return;
                    deleteSegment(s.id);
                  }}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
