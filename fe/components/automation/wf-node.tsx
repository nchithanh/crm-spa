"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { WorkflowNodeType } from "@/lib/types";

const COLORS: Record<WorkflowNodeType, string> = {
  TRIGGER: "border-sky-400 bg-sky-50",
  DELAY: "border-amber-400 bg-amber-50",
  CONDITION: "border-violet-400 bg-violet-50",
  SEND_ZALO_TEMPLATE: "border-[var(--brand-400)] bg-[var(--brand-50)]",
  ADD_TAG: "border-slate-400 bg-slate-50",
  CREATE_TASK: "border-orange-400 bg-orange-50",
  END: "border-slate-500 bg-white",
};

export type WfFlowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
  subtitle?: string;
  invalid?: boolean;
};

export function WfFlowNode({ data, selected }: NodeProps) {
  const d = data as WfFlowNodeData;
  const isCondition = d.nodeType === "CONDITION";
  const isTrigger = d.nodeType === "TRIGGER";
  const isEnd = d.nodeType === "END";

  return (
    <div
      className={cn(
        "min-w-[10rem] rounded-[12px] border-2 px-3 py-2 shadow-sm",
        COLORS[d.nodeType],
        selected && "ring-2 ring-[var(--brand-500)]",
        d.invalid && "border-rose-500 ring-2 ring-rose-300",
      )}
    >
      {!isTrigger ? (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !bg-slate-500"
        />
      ) : null}
      <p className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
        {d.nodeType}
      </p>
      <p className="text-sm font-semibold text-slate-900">{d.label}</p>
      {d.subtitle ? (
        <p className="mt-0.5 max-w-[12rem] truncate text-xs text-slate-500">
          {d.subtitle}
        </p>
      ) : null}
      {!isEnd && !isCondition ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2.5 !w-2.5 !bg-[var(--brand-600)]"
        />
      ) : null}
      {isCondition ? (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: "35%" }}
            className="!h-2.5 !w-2.5 !bg-[var(--brand-600)]"
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: "70%" }}
            className="!h-2.5 !w-2.5 !bg-rose-500"
          />
          <div className="mt-1 flex justify-between text-[9px] font-semibold text-slate-500">
            <span />
            <span className="flex flex-col items-end gap-2">
              <span>true</span>
              <span>false</span>
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
