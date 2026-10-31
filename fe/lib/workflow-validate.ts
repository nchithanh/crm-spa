import type { WorkflowGraph } from "@/lib/types";
import { MAX_WORKFLOW_NODES } from "@/lib/types";

export type ValidationIssue = {
  code: string;
  message: string;
  nodeId?: string;
};

export function validateWorkflowGraph(graph: WorkflowGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = graph;

  if (nodes.length > MAX_WORKFLOW_NODES) {
    issues.push({
      code: "max_nodes",
      message: `Vượt giới hạn ${MAX_WORKFLOW_NODES} node (MVP).`,
    });
  }

  const triggers = nodes.filter((n) => n.type === "TRIGGER");
  if (triggers.length !== 1) {
    issues.push({
      code: "trigger_count",
      message: `Cần đúng 1 TRIGGER (hiện có ${triggers.length}).`,
      nodeId: triggers[0]?.id,
    });
  }

  const ends = nodes.filter((n) => n.type === "END");
  if (ends.length < 1) {
    issues.push({
      code: "end_missing",
      message: "Cần ít nhất 1 node END.",
    });
  }

  // Cycle detect (DFS)
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  let hasCycle = false;
  const dfs = (id: string) => {
    if (hasCycle) return;
    if (stack.has(id)) {
      hasCycle = true;
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const next of adj.get(id) ?? []) dfs(next);
    stack.delete(id);
  };
  for (const n of nodes) dfs(n.id);
  if (hasCycle) {
    issues.push({
      code: "cycle",
      message: "Graph có cycle — MVP không cho phép.",
    });
  }

  // Reachability from trigger
  if (triggers[0]) {
    const reach = new Set<string>();
    const q = [triggers[0].id];
    while (q.length) {
      const cur = q.shift()!;
      if (reach.has(cur)) continue;
      reach.add(cur);
      for (const next of adj.get(cur) ?? []) q.push(next);
    }
    for (const n of nodes) {
      if (!reach.has(n.id)) {
        issues.push({
          code: "unreachable",
          message: `Node «${n.data.label || n.type}» không reachable từ TRIGGER.`,
          nodeId: n.id,
        });
      }
    }
  }

  for (const n of nodes) {
    if (n.type === "DELAY" && !(Number(n.data.delayHours) > 0)) {
      issues.push({
        code: "delay",
        message: "DELAY cần delayHours > 0.",
        nodeId: n.id,
      });
    }
    if (n.type === "SEND_ZALO_TEMPLATE" && !n.data.templateId) {
      issues.push({
        code: "zalo_template",
        message: "SEND_ZALO_TEMPLATE cần chọn template.",
        nodeId: n.id,
      });
    }
    if (n.type === "ADD_TAG" && !String(n.data.tag ?? "").trim()) {
      issues.push({
        code: "tag",
        message: "ADD_TAG cần nhập tag.",
        nodeId: n.id,
      });
    }
    if (n.type === "CREATE_TASK" && !String(n.data.taskTitle ?? "").trim()) {
      issues.push({
        code: "task",
        message: "CREATE_TASK cần tiêu đề.",
        nodeId: n.id,
      });
    }
    if (n.type === "CONDITION") {
      const allowed = [
        "consentZalo",
        "status",
        "totalSpend",
        "completedServiceCount",
        "hasZaloUid",
      ];
      if (!allowed.includes(String(n.data.conditionField))) {
        issues.push({
          code: "condition_field",
          message: `CONDITION field không hỗ trợ: ${n.data.conditionField}`,
          nodeId: n.id,
        });
      }
    }
  }

  // Orphan edges
  const ids = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) {
      issues.push({
        code: "bad_edge",
        message: "Edge trỏ tới node không tồn tại.",
      });
    }
  }

  return issues;
}
