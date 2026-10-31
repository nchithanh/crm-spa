import type {
  Segment,
  SegmentCriterion,
  VerticalBundle,
  Workflow,
  WorkflowRun,
} from "@/lib/types";
import {
  buildReminderGraph,
  buildSampleGraph,
  emptyDraftGraph,
} from "@/lib/workflow-graph";
import { uid } from "@/lib/utils";

type LooseSegment = Omit<Segment, "criteria"> & { criteria?: SegmentCriterion[] };
type LooseWorkflow = Omit<Workflow, "graph" | "version"> & {
  graph?: Workflow["graph"];
  version?: number;
};
type LooseBundle = Omit<
  VerticalBundle,
  | "segments"
  | "workflows"
  | "runs"
  | "team"
  | "notes"
  | "currentUserName"
  | "services"
  | "packages"
  | "resources"
  | "shifts"
  | "debts"
> & {
  segments: LooseSegment[];
  workflows: LooseWorkflow[];
  runs?: WorkflowRun[];
  team?: VerticalBundle["team"];
  notes?: VerticalBundle["notes"];
  services?: VerticalBundle["services"];
  packages?: VerticalBundle["packages"];
  resources?: VerticalBundle["resources"];
  shifts?: VerticalBundle["shifts"];
  debts?: VerticalBundle["debts"];
  currentUserName?: string;
};

function criteriaFor(seg: LooseSegment): SegmentCriterion[] {
  if (seg.criteria?.length) return seg.criteria;
  if (seg.id.includes("vip") || seg.name.toLowerCase().includes("vip")) {
    return [
      {
        id: uid("crit"),
        field: "totalSpend",
        op: "gte",
        value: "10000000",
      },
      {
        id: uid("crit"),
        field: "tags",
        op: "contains",
        value: seg.id.includes("nail") ? "gel" : "lieu",
      },
    ];
  }
  if (seg.name.toLowerCase().includes("lâu") || seg.name.toLowerCase().includes("win")) {
    return [
      {
        id: uid("crit"),
        field: "lastVisitAt",
        op: "days_since_gt",
        value: "60",
      },
    ];
  }
  if (seg.name.toLowerCase().includes("sinh nhật")) {
    return [
      {
        id: uid("crit"),
        field: "birthday",
        op: "lte",
        value: "30",
      },
    ];
  }
  if (seg.name.toLowerCase().includes("hóa chất") || seg.name.toLowerCase().includes("gel")) {
    return [
      {
        id: uid("crit"),
        field: "tags",
        op: "contains",
        value: seg.name.toLowerCase().includes("gel") ? "gel" : "nhuom",
      },
    ];
  }
  if (seg.name.toLowerCase().includes("gói")) {
    return [
      {
        id: uid("crit"),
        field: "activePackage",
        op: "has_package_tag",
        value: "true",
      },
    ];
  }
  return [
    {
      id: uid("crit"),
      field: "customerStatus",
      op: "eq",
      value: "active",
    },
  ];
}

function graphFor(wf: LooseWorkflow, templateId: string): Workflow["graph"] {
  if (wf.graph) return wf.graph;
  if (wf.trigger === "booking.created") {
    return buildReminderGraph({
      trigger: wf.trigger,
      templateId,
    });
  }
  if (wf.trigger === "booking.completed") {
    return buildSampleGraph({
      trigger: wf.trigger,
      templateId,
      taskTitle: "Follow-up sau dịch vụ",
    });
  }
  return emptyDraftGraph(wf.trigger || "manual");
}

export function enrichVerticalBundle(raw: LooseBundle): VerticalBundle {
  const defaultTpl =
    raw.templates.find((t) => t.approval === "approved")?.id ??
    raw.templates[0]?.id ??
    "";

  const segments: Segment[] = raw.segments.map((s) => {
    const criteria = criteriaFor(s);
    return {
      ...s,
      criteria,
      criteriaSummary:
        s.criteriaSummary?.length > 0
          ? s.criteriaSummary
          : criteria.map((c) => `${c.field} ${c.op} ${c.value}`),
    };
  });

  const workflows: Workflow[] = raw.workflows.map((w) => {
    const graph = graphFor(w, defaultTpl);
    // ensure SEND_ZALO nodes have template if empty
    for (const n of graph.nodes) {
      if (n.type === "SEND_ZALO_TEMPLATE" && !n.data.templateId) {
        n.data.templateId = defaultTpl;
      }
    }
    return {
      ...w,
      version: w.version ?? 1,
      graph,
      nodeCount: graph.nodes.length,
    };
  });

  const sampleRun: WorkflowRun | null =
    workflows[0] && raw.customers[0]
      ? {
          id: `run_seed_${raw.id}`,
          workflowId: workflows[0].id,
          workflowName: workflows[0].name,
          workflowVersion: workflows[0].version,
          customerId: raw.customers[0].id,
          status: workflows[0].errorCount > 0 ? "failed" : "succeeded",
          startedAt: "2026-10-29T10:00:00",
          steps: [
            {
              nodeId: "seed_t",
              nodeType: "TRIGGER",
              status: "succeeded",
              message: `Trigger ${workflows[0].trigger}`,
              at: "2026-10-29T10:00:00",
            },
            {
              nodeId: "seed_d",
              nodeType: "DELAY",
              status: "succeeded",
              message: "Delay mock",
              at: "2026-10-29T10:00:01",
            },
            {
              nodeId: "seed_z",
              nodeType: "SEND_ZALO_TEMPLATE",
              status: workflows[0].errorCount > 0 ? "failed" : "succeeded",
              message:
                workflows[0].errorCount > 0
                  ? "Lỗi gửi mẫu (seed)"
                  : "Đã gửi template",
              at: "2026-10-29T10:00:02",
            },
          ],
          error: workflows[0].errorCount > 0 ? "Lỗi gửi mẫu (seed)" : "",
        }
      : null;

  return {
    ...raw,
    team: raw.team ?? [],
    notes: raw.notes ?? [],
    services: raw.services ?? [],
    packages: raw.packages ?? [],
    resources: raw.resources ?? [],
    shifts: raw.shifts ?? [],
    debts: raw.debts ?? [],
    currentUserName: raw.currentUserName ?? "Demo User",
    segments,
    workflows,
    runs: raw.runs?.length ? raw.runs : sampleRun ? [sampleRun] : [],
  };
}
