import type {
  Customer,
  VerticalBundle,
  Workflow,
  WorkflowRun,
  ExecutionStep,
  CareTask,
  MessageLog,
} from "@/lib/types";
import { uid } from "@/lib/utils";

function nowIso() {
  return new Date().toISOString();
}

function evalCondition(
  customer: Customer,
  field?: string,
  op?: string,
  value?: string,
): boolean {
  const v = value ?? "";
  if (field === "consentZalo") {
    const actual = customer.consentZalo ? "true" : "false";
    return op === "neq" ? actual !== v : actual === (v || "true");
  }
  if (field === "hasZaloUid") {
    const actual = customer.zaloUid ? "true" : "false";
    return op === "neq" ? actual !== v : actual === (v || "true");
  }
  if (field === "status") {
    return op === "neq" ? customer.status !== v : customer.status === v;
  }
  if (field === "totalSpend") {
    const n = customer.totalSpend;
    const t = Number(v);
    if (op === "gt") return n > t;
    if (op === "gte") return n >= t;
    if (op === "lt") return n < t;
    if (op === "lte") return n <= t;
    return n === t;
  }
  if (field === "completedServiceCount") {
    const n = customer.completedServiceCount;
    const t = Number(v);
    if (op === "gt") return n > t;
    if (op === "gte") return n >= t;
    if (op === "lt") return n < t;
    if (op === "lte") return n <= t;
    return n === t;
  }
  return true;
}

/**
 * Mock runner: walk graph from TRIGGER synchronously (DELAY = logged as waiting then continue).
 * Mutates a shallow-cloned bundle fields via returned patch.
 */
export function runWorkflowMock(
  bundle: VerticalBundle,
  workflow: Workflow,
  customerId: string,
): {
  run: WorkflowRun;
  tasks: CareTask[];
  messages: MessageLog[];
  customers: Customer[];
} {
  const customer = bundle.customers.find((c) => c.id === customerId);
  const steps: ExecutionStep[] = [];
  let error = "";
  let status: WorkflowRun["status"] = "succeeded";

  const customers = bundle.customers.map((c) => ({
    ...c,
    tags: [...c.tags],
  }));
  const tasks = [...bundle.tasks];
  const messages = [...bundle.messages];

  if (!customer) {
    const run: WorkflowRun = {
      id: uid("run"),
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowVersion: workflow.version,
      customerId,
      status: "failed",
      startedAt: nowIso(),
      steps: [],
      error: "Không tìm thấy khách",
    };
    return { run, tasks, messages, customers };
  }

  const cus = customers.find((c) => c.id === customerId)!;
  const { nodes, edges } = workflow.graph;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outs = (id: string, handle?: string) =>
    edges.filter(
      (e) =>
        e.source === id &&
        (handle === undefined ||
          e.sourceHandle === handle ||
          (!e.sourceHandle && handle === "true")),
    );

  const trigger = nodes.find((n) => n.type === "TRIGGER");
  if (!trigger) {
    status = "failed";
    error = "Thiếu TRIGGER";
  } else {
    let current: string | null = trigger.id;
    const guard = new Set<string>();

    while (current) {
      if (guard.has(current)) {
        status = "failed";
        error = "Cycle khi chạy";
        break;
      }
      guard.add(current);
      const node = byId.get(current);
      if (!node) break;

      if (node.type === "TRIGGER") {
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: `Trigger ${node.data.triggerEvent}`,
          at: nowIso(),
          input: `customerId=${customerId}`,
          output: `event=${node.data.triggerEvent}`,
        });
        current = outs(node.id)[0]?.target ?? null;
        continue;
      }

      if (node.type === "DELAY") {
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "waiting",
          message: `Delay ${node.data.delayHours}h (mock: bỏ qua chờ)`,
          at: nowIso(),
          input: `hours=${node.data.delayHours}`,
          output: "scheduled (mock skip)",
        });
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: "Delay xong (mock)",
          at: nowIso(),
          input: `hours=${node.data.delayHours}`,
          output: "resumed",
        });
        current = outs(node.id)[0]?.target ?? null;
        continue;
      }

      if (node.type === "CONDITION") {
        const ok = evalCondition(
          cus,
          node.data.conditionField,
          node.data.conditionOp,
          node.data.conditionValue,
        );
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: `Điều kiện → ${ok ? "true" : "false"}`,
          at: nowIso(),
          input: `${node.data.conditionField} ${node.data.conditionOp} ${node.data.conditionValue}`,
          output: String(ok),
        });
        current =
          outs(node.id, ok ? "true" : "false")[0]?.target ??
          outs(node.id)[0]?.target ??
          null;
        continue;
      }

      if (node.type === "SEND_ZALO_TEMPLATE") {
        const tpl = bundle.templates.find(
          (t) => t.id === node.data.templateId,
        );
        if (!bundle.zaloConnected) {
          steps.push({
            nodeId: node.id,
            nodeType: node.type,
            status: "failed",
            message: "OA chưa kết nối",
            at: nowIso(),
          });
          status = "failed";
          error = "OA chưa kết nối";
          break;
        }
        if (!cus.consentZalo) {
          steps.push({
            nodeId: node.id,
            nodeType: node.type,
            status: "failed",
            message: "Thiếu consent Zalo",
            at: nowIso(),
          });
          status = "failed";
          error = "Thiếu consent";
          break;
        }
        if (!tpl) {
          steps.push({
            nodeId: node.id,
            nodeType: node.type,
            status: "failed",
            message: "Template không tồn tại",
            at: nowIso(),
          });
          status = "failed";
          error = "Template missing";
          break;
        }
        if (tpl.recipientMode === "uid" && !cus.zaloUid) {
          const msg: MessageLog = {
            id: uid("msg"),
            customerId: cus.id,
            templateId: tpl.id,
            status: "failed",
            sentAt: nowIso(),
            error: "Thiếu Zalo UID — template yêu cầu UID",
          };
          messages.push(msg);
          steps.push({
            nodeId: node.id,
            nodeType: node.type,
            status: "failed",
            message: msg.error,
            at: nowIso(),
          });
          status = "failed";
          error = msg.error;
          break;
        }
        messages.push({
          id: uid("msg"),
          customerId: cus.id,
          templateId: tpl.id,
          status: "sent",
          sentAt: nowIso(),
          error: "",
        });
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: `Đã gửi «${tpl.name}»`,
          at: nowIso(),
          input: `template=${tpl.id}; mode=${tpl.recipientMode}`,
          output: "message.status=sent (mock)",
        });
        current = outs(node.id)[0]?.target ?? null;
        continue;
      }

      if (node.type === "ADD_TAG") {
        const tag = String(node.data.tag ?? "").trim();
        if (tag && !cus.tags.includes(tag)) cus.tags.push(tag);
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: `Tag «${tag}»`,
          at: nowIso(),
          input: `tag=${tag}`,
          output: `tags=[${cus.tags.join(",")}]`,
        });
        current = outs(node.id)[0]?.target ?? null;
        continue;
      }

      if (node.type === "CREATE_TASK") {
        const title = String(node.data.taskTitle ?? "Care task");
        tasks.push({
          id: uid("task"),
          title,
          customerId: cus.id,
          dueAt: nowIso(),
          status: "open",
          source: "workflow",
          assigneeName: cus.assigneeName || bundle.currentUserName,
          type: "follow_up",
          priority: "medium",
        });
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: `Tạo task «${title}»`,
          at: nowIso(),
          input: `title=${title}`,
          output: "task.status=open",
        });
        current = outs(node.id)[0]?.target ?? null;
        continue;
      }

      if (node.type === "END") {
        steps.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "succeeded",
          message: "End",
          at: nowIso(),
          input: "",
          output: "completed",
        });
        current = null;
        continue;
      }

      current = null;
    }
  }

  const run: WorkflowRun = {
    id: uid("run"),
    workflowId: workflow.id,
    workflowName: workflow.name,
    workflowVersion: workflow.version,
    customerId,
    status,
    startedAt: nowIso(),
    steps,
    error,
  };

  return { run, tasks, messages, customers };
}

export function runActiveWorkflowsForEvent(
  bundle: VerticalBundle,
  event: string,
  customerId: string,
): ReturnType<typeof runWorkflowMock>[] {
  return bundle.workflows
    .filter((w) => w.status === "active" && w.trigger === event)
    .map((w) => runWorkflowMock(bundle, w, customerId));
}
