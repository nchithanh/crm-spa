"use client";

import { Input } from "@/components/ui/input";
import type { MessageTemplate, WfNode } from "@/lib/types";

export function NodeConfigPanel({
  node,
  templates,
  onChange,
}: {
  node: WfNode | null;
  templates: MessageTemplate[];
  onChange: (next: WfNode) => void;
}) {
  if (!node) {
    return (
      <div className="rounded-[12px] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        Chọn một node trên canvas để cấu hình.
      </div>
    );
  }

  const setData = (patch: Partial<WfNode["data"]>) =>
    onChange({ ...node, data: { ...node.data, ...patch } });

  return (
    <div className="space-y-3 rounded-[12px] border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {node.type}
        </p>
        <label className="mt-2 block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Nhãn</span>
          <Input
            value={node.data.label}
            onChange={(e) => setData({ label: e.target.value })}
          />
        </label>
      </div>

      {node.type === "TRIGGER" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Sự kiện</span>
          <select
            className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
            value={node.data.triggerEvent ?? "booking.created"}
            onChange={(e) => setData({ triggerEvent: e.target.value })}
          >
            <option value="booking.created">booking.created</option>
            <option value="booking.completed">booking.completed</option>
            <option value="booking.cancelled">booking.cancelled</option>
            <option value="manual">manual</option>
          </select>
        </label>
      ) : null}

      {node.type === "DELAY" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Giờ chờ</span>
          <Input
            type="number"
            min={1}
            value={node.data.delayHours ?? 24}
            onChange={(e) =>
              setData({ delayHours: Number(e.target.value) || 0 })
            }
          />
        </label>
      ) : null}

      {node.type === "CONDITION" ? (
        <>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Field</span>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
              value={node.data.conditionField ?? "consentZalo"}
              onChange={(e) => setData({ conditionField: e.target.value })}
            >
              <option value="consentZalo">consentZalo</option>
              <option value="hasZaloUid">hasZaloUid</option>
              <option value="status">status</option>
              <option value="totalSpend">totalSpend</option>
              <option value="completedServiceCount">
                completedServiceCount
              </option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Toán tử</span>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
              value={node.data.conditionOp ?? "eq"}
              onChange={(e) => setData({ conditionOp: e.target.value })}
            >
              <option value="eq">eq</option>
              <option value="neq">neq</option>
              <option value="gt">gt</option>
              <option value="gte">gte</option>
              <option value="lt">lt</option>
              <option value="lte">lte</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-slate-500">Giá trị</span>
            <Input
              value={node.data.conditionValue ?? ""}
              onChange={(e) => setData({ conditionValue: e.target.value })}
            />
          </label>
        </>
      ) : null}

      {node.type === "SEND_ZALO_TEMPLATE" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Template</span>
          <select
            className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
            value={node.data.templateId ?? ""}
            onChange={(e) => setData({ templateId: e.target.value })}
          >
            <option value="">— Chọn —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.recipientMode})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {node.type === "ADD_TAG" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Tag</span>
          <Input
            value={node.data.tag ?? ""}
            onChange={(e) => setData({ tag: e.target.value })}
          />
        </label>
      ) : null}

      {node.type === "CREATE_TASK" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-slate-500">Tiêu đề task</span>
          <Input
            value={node.data.taskTitle ?? ""}
            onChange={(e) => setData({ taskTitle: e.target.value })}
          />
        </label>
      ) : null}
    </div>
  );
}
