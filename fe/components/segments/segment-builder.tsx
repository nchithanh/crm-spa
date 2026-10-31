"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  SEGMENT_FIELD_OPTIONS,
  criterionSummary,
  evaluateSegmentMembers,
} from "@/lib/segment-eval";
import type {
  Segment,
  SegmentCriterion,
  SegmentField,
  SegmentOp,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const OPS: { value: SegmentOp; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "contains", label: "contains" },
  { value: "days_since_gt", label: "ngày kể từ >" },
  { value: "days_since_lt", label: "ngày kể từ <" },
  { value: "has_upcoming", label: "có lịch sắp tới" },
  { value: "has_package_tag", label: "có gói active" },
];

export function SegmentBuilder({ initial }: { initial?: Segment }) {
  const bundle = useAppStore((s) => s.bundle);
  const upsertSegment = useAppStore((s) => s.upsertSegment);
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [matchMode, setMatchMode] = useState<"and" | "or">(
    initial?.matchMode ?? "and",
  );
  const [criteria, setCriteria] = useState<SegmentCriterion[]>(
    initial?.criteria?.length
      ? initial.criteria
      : [
          {
            id: uid("crit"),
            field: "completedServiceCount",
            op: "gte",
            value: "2",
          },
        ],
  );

  const memberIds = useMemo(() => {
    if (!bundle) return [];
    return evaluateSegmentMembers(
      bundle.customers,
      criteria,
      bundle.bookings,
      { matchMode, packages: bundle.packages },
    );
  }, [bundle, criteria, matchMode]);

  if (!bundle) return null;

  const members = bundle.customers.filter((c) => memberIds.includes(c.id));

  const save = () => {
    if (!name.trim()) return;
    const id = initial?.id ?? uid("seg");
    upsertSegment({
      id,
      name: name.trim(),
      description,
      criteria,
      matchMode,
      criteriaSummary: criteria.map(criterionSummary),
      memberIds,
    });
    router.push(`/segments/${id}`);
  };

  return (
    <div>
      <PageHeader
        title={initial ? "Sửa segment" : "Tạo segment"}
        description="Builder trực quan · preview realtime · dùng chung mock dataset"
        actions={
          <Link href="/segments">
            <Button variant="outline">Hủy</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Tên</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Mô tả</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div
            role="tablist"
            className="flex rounded-[10px] border border-slate-200 p-1"
          >
            {(
              [
                { id: "and" as const, label: "Khớp TẤT CẢ (AND)" },
                { id: "or" as const, label: "Khớp BẤT KỲ (OR)" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={matchMode === m.id}
                onClick={() => setMatchMode(m.id)}
                className={`h-9 flex-1 rounded-[8px] text-xs font-semibold ${
                  matchMode === m.id
                    ? "bg-[var(--brand-500)] text-white"
                    : "text-slate-500"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold">
              Tiêu chí · logic {matchMode.toUpperCase()}
            </p>
            {criteria.map((c, idx) => (
              <div key={c.id} className="relative">
                {idx > 0 ? (
                  <p className="mb-1 text-center text-[10px] font-bold tracking-wide text-[var(--brand-600)] uppercase">
                    {matchMode}
                  </p>
                ) : null}
                <div className="grid gap-2 rounded-[12px] border border-slate-200 bg-slate-50/80 p-2 sm:grid-cols-4">
                  <select
                    className="h-10 rounded-[10px] border border-slate-200 bg-white px-2 text-sm"
                    value={c.field}
                    onChange={(e) => {
                      const field = e.target.value as SegmentField;
                      setCriteria((list) =>
                        list.map((x, i) => (i === idx ? { ...x, field } : x)),
                      );
                    }}
                  >
                    {SEGMENT_FIELD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-[10px] border border-slate-200 bg-white px-2 text-sm"
                    value={c.op}
                    onChange={(e) => {
                      const op = e.target.value as SegmentOp;
                      setCriteria((list) =>
                        list.map((x, i) => (i === idx ? { ...x, op } : x)),
                      );
                    }}
                  >
                    {OPS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="h-10"
                    value={c.value}
                    placeholder={
                      c.op === "has_upcoming" || c.op === "has_package_tag"
                        ? "true / false"
                        : "Giá trị"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setCriteria((list) =>
                        list.map((x, i) => (i === idx ? { ...x, value } : x)),
                      );
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setCriteria((list) => list.filter((_, i) => i !== idx))
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                setCriteria((list) => [
                  ...list,
                  {
                    id: uid("crit"),
                    field: "tags",
                    op: "contains",
                    value: "",
                  },
                ])
              }
            >
              + Tiêu chí
            </Button>
          </div>

          <Button
            onClick={save}
            disabled={!name.trim() || criteria.length === 0}
          >
            Lưu segment
          </Button>
          <p className="text-[11px] text-slate-400">
            Segment có thể dùng làm đối tượng chiến dịch / automation (Pass 5–6).
          </p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-1 text-sm font-bold">
            Preview thành viên ({members.length})
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Tính lại mỗi khi đổi tiêu chí · cùng customer IDs với Directory /
            360.
          </p>
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">
              Không có khách khớp tiêu chí.
            </p>
          ) : (
            <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
              {members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/customers/${m.id}`}
                    className="block rounded-[10px] border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <p className="font-medium">{m.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {m.code} · {m.phone} · {m.completedServiceCount} DV
                    </p>
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
