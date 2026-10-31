"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SegmentBuilder } from "@/components/segments/segment-builder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function SegmentDetailPage() {
  const params = useParams<{ id: string }>();
  const bundle = useAppStore((s) => s.bundle);
  const deleteSegment = useAppStore((s) => s.deleteSegment);
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (!bundle) return null;
  const segment = bundle.segments.find((s) => s.id === params.id);

  if (!segment) {
    return (
      <Card className="p-6 text-sm">
        Không tìm thấy.{" "}
        <Link href="/segments" className="text-[var(--brand-600)]">
          Quay lại
        </Link>
      </Card>
    );
  }

  if (editing) {
    return <SegmentBuilder initial={segment} />;
  }

  const members = bundle.customers.filter((c) =>
    segment.memberIds.includes(c.id),
  );

  return (
    <div>
      <PageHeader
        title={segment.name}
        description={segment.description}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Sửa builder
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!window.confirm(`Xóa “${segment.name}”?`)) return;
                deleteSegment(segment.id);
                router.push("/segments");
              }}
            >
              Xóa
            </Button>
            <Link href="/segments">
              <Button variant="outline">Danh sách</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-bold">
            Tiêu chí · {(segment.matchMode ?? "and").toUpperCase()}
          </h2>
          <ul className="space-y-2">
            {(segment.criteria?.length
              ? segment.criteria.map(
                  (c) => `${c.field} ${c.op} ${c.value}`,
                )
              : segment.criteriaSummary
            ).map((c) => (
              <li
                key={c}
                className="rounded-[10px] border border-slate-100 px-3 py-2 text-sm"
              >
                {c}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-bold">
            Thành viên ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có thành viên.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/customers/${m.id}`}
                    className="block rounded-[10px] border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <p className="font-medium">{m.fullName}</p>
                    <p className="text-xs text-slate-500">{m.phone}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
