import type { WorkflowGraph, WorkflowNodeType, WfNode } from "@/lib/types";
import { uid } from "@/lib/utils";

export const NODE_TYPES: WorkflowNodeType[] = [
  "TRIGGER",
  "DELAY",
  "CONDITION",
  "SEND_ZALO_TEMPLATE",
  "ADD_TAG",
  "CREATE_TASK",
  "END",
];

export function defaultNodeData(type: WorkflowNodeType): WfNode["data"] {
  switch (type) {
    case "TRIGGER":
      return { label: "Trigger", triggerEvent: "booking.completed" };
    case "DELAY":
      return { label: "Delay", delayHours: 24 };
    case "CONDITION":
      return {
        label: "Condition",
        conditionField: "consentZalo",
        conditionOp: "eq",
        conditionValue: "true",
      };
    case "SEND_ZALO_TEMPLATE":
      return { label: "Gửi Zalo", templateId: "" };
    case "ADD_TAG":
      return { label: "Gắn tag", tag: "cared" };
    case "CREATE_TASK":
      return { label: "Tạo task", taskTitle: "Liên hệ khách" };
    case "END":
      return { label: "End" };
  }
}

export function createNode(
  type: WorkflowNodeType,
  position: { x: number; y: number },
  data?: Partial<WfNode["data"]>,
): WfNode {
  return {
    id: uid("node"),
    type,
    position,
    data: { ...defaultNodeData(type), ...data },
  };
}

/** Linear aftercare graph: TRIGGER → DELAY → CONDITION → ZALO / END + TASK → END */
export function buildSampleGraph(opts: {
  trigger: string;
  templateId: string;
  tag?: string;
  taskTitle?: string;
}): WorkflowGraph {
  const trigger = createNode("TRIGGER", { x: 80, y: 120 }, {
    triggerEvent: opts.trigger,
  });
  const delay = createNode("DELAY", { x: 280, y: 120 }, { delayHours: 24 });
  const cond = createNode("CONDITION", { x: 480, y: 120 });
  const zalo = createNode("SEND_ZALO_TEMPLATE", { x: 720, y: 40 }, {
    templateId: opts.templateId,
  });
  const endOk = createNode("END", { x: 960, y: 40 });
  const task = createNode("CREATE_TASK", { x: 720, y: 220 }, {
    taskTitle: opts.taskTitle ?? "Gọi chăm sóc khách",
  });
  const tag = createNode("ADD_TAG", { x: 920, y: 220 }, {
    tag: opts.tag ?? "aftercare",
  });
  const endFail = createNode("END", { x: 1120, y: 220 });

  return {
    nodes: [trigger, delay, cond, zalo, endOk, task, tag, endFail],
    edges: [
      { id: uid("e"), source: trigger.id, target: delay.id },
      { id: uid("e"), source: delay.id, target: cond.id },
      {
        id: uid("e"),
        source: cond.id,
        target: zalo.id,
        sourceHandle: "true",
      },
      { id: uid("e"), source: zalo.id, target: endOk.id },
      {
        id: uid("e"),
        source: cond.id,
        target: task.id,
        sourceHandle: "false",
      },
      { id: uid("e"), source: task.id, target: tag.id },
      { id: uid("e"), source: tag.id, target: endFail.id },
    ],
  };
}

export function buildReminderGraph(opts: {
  trigger: string;
  templateId: string;
}): WorkflowGraph {
  const trigger = createNode("TRIGGER", { x: 80, y: 100 }, {
    triggerEvent: opts.trigger,
  });
  const delay = createNode("DELAY", { x: 300, y: 100 }, { delayHours: 24 });
  const zalo = createNode("SEND_ZALO_TEMPLATE", { x: 520, y: 100 }, {
    templateId: opts.templateId,
  });
  const end = createNode("END", { x: 740, y: 100 });
  return {
    nodes: [trigger, delay, zalo, end],
    edges: [
      { id: uid("e"), source: trigger.id, target: delay.id },
      { id: uid("e"), source: delay.id, target: zalo.id },
      { id: uid("e"), source: zalo.id, target: end.id },
    ],
  };
}

export function emptyDraftGraph(trigger = "booking.created"): WorkflowGraph {
  const triggerNode = createNode("TRIGGER", { x: 120, y: 120 }, {
    triggerEvent: trigger,
  });
  const end = createNode("END", { x: 360, y: 120 });
  return {
    nodes: [triggerNode, end],
    edges: [{ id: uid("e"), source: triggerNode.id, target: end.id }],
  };
}
