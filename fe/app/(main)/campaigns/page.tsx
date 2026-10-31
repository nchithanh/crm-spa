"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  CAMPAIGN_KIND_LABEL,
  emptyCampaignDraft,
  getCampaignStats,
} from "@/lib/campaign-utils";
import type { Campaign, CampaignKind, CampaignStatus } from "@/lib/types";
import { formatDateTime, uid } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const KINDS = Object.keys(CAMPAIGN_KIND_LABEL) as CampaignKind[];

export default function CampaignsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const upsertCampaign = useAppStore((s) => s.upsertCampaign);
  const deleteCampaign = useAppStore((s) => s.deleteCampaign);
  const launchCampaign = useAppStore((s) => s.launchCampaign);
  const [flash, setFlash] = useState("");
  const [editing, setEditing] = useState<Campaign | null>(null);

  const stats = useMemo(
    () => (bundle ? getCampaignStats(bundle) : null),
    [bundle],
  );

  if (!bundle) return null;
  const campaigns = bundle.campaigns ?? [];

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      setFlash("Nhập tên chiến dịch.");
      return;
    }
    upsertCampaign({
      ...editing,
      id: editing.id || uid("camp"),
      createdAt: editing.createdAt || new Date().toISOString(),
    });
    setEditing(null);
    setFlash("Đã lưu campaign.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chiến dịch chăm sóc"
        description="Campaign ≠ Automation — đối tượng segment + thời gian · gửi Zalo batch mock"
        actions={
          <>
            <Link href="/campaigns/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link href="/communication">
              <Button variant="outline">Zalo Center</Button>
            </Link>
            <Button
              onClick={() =>
                setEditing(
                  emptyCampaignDraft(
                    bundle.segments[0]?.id ?? "",
                    bundle.templates.find((t) => t.approval === "approved")
                      ?.id ??
                      bundle.templates[0]?.id ??
                      "",
                  ),
                )
              }
            >
              Tạo campaign
            </Button>
          </>
        }
      />

      {stats ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Card className="p-3 text-sm">
            <p className="text-xs text-slate-500">Tổng</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-3 text-sm">
            <p className="text-xs text-slate-500">Completed</p>
            <p className="text-xl font-bold">{stats.completed}</p>
          </Card>
          <Card className="p-3 text-sm">
            <p className="text-xs text-slate-500">Sent (mock)</p>
            <p className="text-xl font-bold text-emerald-700">{stats.sent}</p>
          </Card>
          <Card className="p-3 text-sm">
            <p className="text-xs text-slate-500">Failed</p>
            <p className="text-xl font-bold text-rose-700">{stats.failed}</p>
          </Card>
        </div>
      ) : null}

      {flash ? (
        <p className="text-sm text-slate-600">{flash}</p>
      ) : null}

      {editing ? (
        <Card className="grid max-w-xl gap-3 p-4">
          <p className="text-sm font-bold">
            {editing.id ? "Sửa campaign" : "Campaign mới"}
          </p>
          <Input
            value={editing.name}
            onChange={(e) =>
              setEditing({ ...editing, name: e.target.value })
            }
            placeholder="Tên"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs">
              Loại
              <select
                className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
                value={editing.kind}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    kind: e.target.value as CampaignKind,
                  })
                }
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {CAMPAIGN_KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Status
              <select
                className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
                value={editing.status}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as CampaignStatus,
                  })
                }
              >
                {(
                  [
                    "draft",
                    "scheduled",
                    "running",
                    "paused",
                    "completed",
                  ] as CampaignStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-xs">
            Segment
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
              value={editing.segmentId}
              onChange={(e) =>
                setEditing({ ...editing, segmentId: e.target.value })
              }
            >
              {bundle.segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.memberIds.length})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Template
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
              value={editing.templateId}
              onChange={(e) =>
                setEditing({ ...editing, templateId: e.target.value })
              }
            >
              {bundle.templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.approval}
                </option>
              ))}
            </select>
          </label>
          <Input
            value={editing.note}
            onChange={(e) =>
              setEditing({ ...editing, note: e.target.value })
            }
            placeholder="Ghi chú"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>Lưu</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Hủy
            </Button>
          </div>
        </Card>
      ) : null}

      {campaigns.length === 0 ? (
        <EmptyState title="Chưa có campaign" />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const seg = bundle.segments.find((s) => s.id === c.segmentId);
            const tpl = bundle.templates.find((t) => t.id === c.templateId);
            return (
              <Card
                key={c.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{c.name}</p>
                    <Badge status={c.status} />
                    <Badge
                      status="pending"
                      label={CAMPAIGN_KIND_LABEL[c.kind]}
                    />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {seg?.name ?? "—"} · {tpl?.name ?? "—"} · lịch{" "}
                    {formatDateTime(c.scheduledAt)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Sent {c.sentCount} · Failed {c.failedCount}
                    {c.note ? ` · ${c.note}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const res = launchCampaign(c.id);
                      setFlash(
                        res.ok
                          ? `Đã gửi: ${res.sent} ok / ${res.failed} lỗi`
                          : res.error ?? "Lỗi",
                      );
                    }}
                  >
                    Launch mock
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing({ ...c })}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (!window.confirm(`Xóa «${c.name}»?`)) return;
                      deleteCampaign(c.id);
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
