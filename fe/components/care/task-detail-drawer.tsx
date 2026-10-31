"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CARE_PRIORITY_LABELS,
  CARE_TYPE_LABELS,
  normalizeTask,
} from "@/lib/care-utils";
import type {
  CareTask,
  CareTaskPriority,
  CareTaskType,
  VerticalBundle,
} from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function TaskDetailDrawer({
  task,
  bundle,
  onClose,
  onComplete,
  onCancel,
  onSave,
}: {
  task: CareTask | null;
  bundle: VerticalBundle;
  onClose: () => void;
  onComplete: (id: string, note: string) => void;
  onCancel: (id: string, note: string) => void;
  onSave: (
    id: string,
    patch: {
      title: string;
      description: string;
      dueAt: string;
      assigneeName: string;
      priority: CareTaskPriority;
      type: CareTaskType;
    },
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [assigneeName, setAssignee] = useState("");
  const [priority, setPriority] = useState<CareTaskPriority>("medium");
  const [type, setType] = useState<CareTaskType>("general");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!task) return;
    const n = normalizeTask(task);
    setTitle(n.title);
    setDescription(n.description ?? "");
    setDueAt(n.dueAt.slice(0, 16));
    setAssignee(n.assigneeName);
    setPriority(n.priority);
    setType(n.type);
    setResult(n.resultNote ?? "");
  }, [task]);

  if (!task) return null;
  const c = bundle.customers.find((x) => x.id === task.customerId);
  const staff = [
    ...new Set([
      bundle.currentUserName,
      ...bundle.team.map((t) => t.name),
      ...bundle.customers.map((x) => x.assigneeName).filter(Boolean),
    ]),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Đóng"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {task.id}
            </p>
            <h2 className="text-base font-bold">Chi tiết việc chăm sóc</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-1">
            <Badge status={task.status} />
            <Badge status={type} label={CARE_TYPE_LABELS[type]} />
            <Badge status={priority} label={CARE_PRIORITY_LABELS[priority]} />
          </div>
          <p className="text-sm">
            Khách:{" "}
            <Link
              href={`/customers/${task.customerId}`}
              className="font-semibold text-[var(--brand-600)]"
            >
              {c?.fullName ?? task.customerId}
            </Link>
          </p>
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Tiêu đề
            <Input
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={task.status !== "open"}
            />
          </label>
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Mô tả
            <textarea
              className="mt-1 min-h-20 w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={task.status !== "open"}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">
              Loại
              <select
                className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
                value={type}
                disabled={task.status !== "open"}
                onChange={(e) => setType(e.target.value as CareTaskType)}
              >
                {Object.entries(CARE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">
              Ưu tiên
              <select
                className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
                value={priority}
                disabled={task.status !== "open"}
                onChange={(e) =>
                  setPriority(e.target.value as CareTaskPriority)
                }
              >
                {Object.entries(CARE_PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Hạn xử lý
            <input
              type="datetime-local"
              className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
              value={dueAt}
              disabled={task.status !== "open"}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </label>
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Phụ trách
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-2 text-sm"
              value={assigneeName}
              disabled={task.status !== "open"}
              onChange={(e) => setAssignee(e.target.value)}
            >
              {staff.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] text-slate-400">
            Nguồn: {task.source} · Tạo{" "}
            {task.createdAt ? formatDateTime(task.createdAt) : "—"}
          </p>
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Kết quả / ghi chú
            <textarea
              className="mt-1 min-h-16 w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Ghi chú khi hoàn thành / hủy"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4">
          {task.status === "open" ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  onSave(task.id, {
                    title,
                    description,
                    dueAt: new Date(dueAt).toISOString(),
                    assigneeName,
                    priority,
                    type,
                  })
                }
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => onComplete(task.id, result)}
              >
                Hoàn thành
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onCancel(task.id, result || "Đã hủy")}
              >
                Hủy việc
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Task đã {task.status === "done" ? "hoàn thành" : "hủy"} — chỉ xem.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
