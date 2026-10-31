"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TaskBoard } from "@/components/care/task-board";
import { TaskDetailDrawer } from "@/components/care/task-detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  CARE_PRIORITY_LABELS,
  CARE_TYPE_LABELS,
  filterCareTasks,
  normalizeTask,
  type CareViewFilter,
} from "@/lib/care-utils";
import type { CareTaskPriority, CareTaskType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function TasksPage() {
  const bundle = useAppStore((s) => s.bundle);
  const completeTask = useAppStore((s) => s.completeTask);
  const createCareTask = useAppStore((s) => s.createCareTask);
  const updateCareTask = useAppStore((s) => s.updateCareTask);
  const cancelCareTask = useAppStore((s) => s.cancelCareTask);

  const [view, setView] = useState<CareViewFilter>("all");
  const [layout, setLayout] = useState<"table" | "board">("table");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftCustomer, setDraftCustomer] = useState("");
  const [draftType, setDraftType] = useState<CareTaskType>("follow_up");
  const [draftPriority, setDraftPriority] =
    useState<CareTaskPriority>("medium");

  const rows = useMemo(() => {
    if (!bundle) return [];
    return filterCareTasks(bundle.tasks, {
      view,
      me: bundle.currentUserName,
      type,
      priority,
      q,
    });
  }, [bundle, view, type, priority, q]);

  const selected = bundle?.tasks.find((t) => t.id === selectedId) ?? null;

  if (!bundle) return null;
  const cus = draftCustomer || bundle.customers[0]?.id || "";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Việc cần chăm sóc"
        description="Care Center · table / board · CRUD mock đầy đủ"
        actions={
          <>
            <Link href="/care">
              <Button variant="outline" size="sm">
                Tổng quan Care
              </Button>
            </Link>
            <Link href="/tasks/mine">
              <Button variant="secondary" size="sm">
                Việc của tôi
              </Button>
            </Link>
          </>
        }
      />

      <Card className="space-y-3 p-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Đang mở"],
              ["mine", "Của tôi"],
              ["today", "Hôm nay"],
              ["overdue", "Quá hạn"],
              ["upcoming", "Sắp đến hạn"],
              ["done", "Đã xong"],
              ["cancelled", "Đã hủy"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                view === id
                  ? "bg-[var(--brand-500)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:inline-block" />
          {(
            [
              ["table", "Bảng"],
              ["board", "Board"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setLayout(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                layout === id
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Tìm tiêu đề / mô tả / ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="h-11 rounded-[10px] border border-slate-200 px-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">Mọi loại</option>
            {Object.entries(CARE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-[10px] border border-slate-200 px-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="all">Mọi ưu tiên</option>
            {Object.entries(CARE_PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="grid gap-2 p-3 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
        <select
          className="h-10 rounded-[10px] border border-slate-200 px-2 text-sm"
          value={cus}
          onChange={(e) => setDraftCustomer(e.target.value)}
        >
          {bundle.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>
        <Input
          className="h-10"
          placeholder="Tiêu đề task mới"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
        />
        <select
          className="h-10 rounded-[10px] border border-slate-200 px-2 text-sm"
          value={draftType}
          onChange={(e) => setDraftType(e.target.value as CareTaskType)}
        >
          {Object.entries(CARE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-[10px] border border-slate-200 px-2 text-sm"
          value={draftPriority}
          onChange={(e) =>
            setDraftPriority(e.target.value as CareTaskPriority)
          }
        >
          {Object.entries(CARE_PRIORITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          className="h-10"
          onClick={() => {
            if (!draftTitle.trim() || !cus) return;
            createCareTask({
              customerId: cus,
              title: draftTitle.trim(),
              dueAt: new Date(Date.now() + 86400000).toISOString(),
              assigneeName: bundle.currentUserName,
              type: draftType,
              priority: draftPriority,
            });
            setDraftTitle("");
            setView("mine");
          }}
        >
          Tạo
        </Button>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Không có việc trong bộ lọc này" />
      ) : layout === "board" ? (
        <TaskBoard
          tasks={rows}
          bundle={bundle}
          onSelect={setSelectedId}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 md:grid">
            <div className="col-span-3">Việc</div>
            <div className="col-span-2">Khách</div>
            <div className="col-span-2">Loại / ưu tiên</div>
            <div className="col-span-2">Phụ trách</div>
            <div className="col-span-2">Hạn</div>
            <div className="col-span-1">TT</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {rows.map((raw) => {
              const t = normalizeTask(raw);
              const c = bundle.customers.find((x) => x.id === t.customerId);
              const overdue =
                t.status === "open" && Date.parse(t.dueAt) < Date.now();
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className="grid w-full gap-1 px-3 py-3 text-left hover:bg-slate-50 md:grid-cols-12 md:items-center md:gap-2"
                  >
                    <div className="md:col-span-3">
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-[11px] text-slate-400">{t.id}</p>
                    </div>
                    <div className="text-sm md:col-span-2">
                      <Link
                        href={`/customers/${t.customerId}`}
                        className="font-medium text-[var(--brand-600)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c?.fullName ?? "—"}
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1 md:col-span-2">
                      <Badge status={t.type} label={CARE_TYPE_LABELS[t.type]} />
                      <Badge
                        status={t.priority}
                        label={CARE_PRIORITY_LABELS[t.priority]}
                      />
                    </div>
                    <div className="text-sm text-slate-600 md:col-span-2">
                      {t.assigneeName}
                    </div>
                    <div className="text-sm text-slate-600 md:col-span-2">
                      {formatDateTime(t.dueAt)}
                      {overdue ? (
                        <Badge
                          className="ml-1"
                          status="overdue"
                          label="Quá hạn"
                        />
                      ) : null}
                    </div>
                    <div className="md:col-span-1">
                      <Badge status={t.status} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <TaskDetailDrawer
        task={selected}
        bundle={bundle}
        onClose={() => setSelectedId(null)}
        onComplete={(id, note) => {
          completeTask(id, note);
          setSelectedId(null);
        }}
        onCancel={(id, note) => {
          cancelCareTask(id, note);
          setSelectedId(null);
        }}
        onSave={(id, patch) => {
          updateCareTask(id, patch);
        }}
      />
    </div>
  );
}
