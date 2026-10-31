"use client";

import { create } from "zustand";
import { getVerticalBundle } from "@/data/seed";
import { runWorkflowMock, runActiveWorkflowsForEvent } from "@/lib/mock-runner";
import { criterionSummary, evaluateSegmentMembers } from "@/lib/segment-eval";
import type {
  ActivityLogEntry,
  Booking,
  BookingStatus,
  Campaign,
  CareTask,
  CatalogService,
  Customer,
  CustomerPackage,
  Segment,
  SegmentCriterion,
  VerticalBundle,
  VerticalId,
  Workflow,
  WorkflowGraph,
  WorkflowStatus,
} from "@/lib/types";
import { findBookingConflicts } from "@/lib/booking-conflict";
import { emptyDraftGraph } from "@/lib/workflow-graph";
import { validateWorkflowGraph } from "@/lib/workflow-validate";
import { uid } from "@/lib/utils";

const STORAGE_KEY = "dolphin-beauty-crm-vertical";
export const BUNDLE_STORAGE_PREFIX = "dolphin-beauty-crm-bundle:";
export const MOCK_STORE_VERSION = "v2";

type AppState = {
  hydrated: boolean;
  verticalId: VerticalId | null;
  bundle: VerticalBundle | null;
  hydrate: () => void;
  selectVertical: (id: VerticalId) => void;
  clearVertical: () => void;
  /** Nạp lại seed gốc — xóa patch localStorage của vertical hiện tại */
  resetDemoData: () => void;
  upsertCustomer: (customer: Customer) => void;
  upsertService: (service: CatalogService) => void;
  toggleServiceActive: (id: string) => void;
  upsertSegment: (segment: Segment) => void;
  deleteSegment: (id: string) => void;
  upsertWorkflow: (workflow: Workflow) => void;
  saveWorkflowGraph: (
    id: string,
    patch: { name?: string; trigger?: string; graph: WorkflowGraph },
  ) => { ok: boolean; errors: string[] };
  setWorkflowStatus: (id: string, status: WorkflowStatus) => {
    ok: boolean;
    errors: string[];
  };
  completeTask: (id: string, resultNote?: string) => void;
  createCareTask: (input: {
    customerId: string;
    title: string;
    dueAt: string;
    assigneeName: string;
    type?: import("@/lib/types").CareTaskType;
    description?: string;
    priority?: import("@/lib/types").CareTaskPriority;
  }) => void;
  updateCareTask: (
    id: string,
    patch: Partial<
      Pick<
        CareTask,
        | "title"
        | "description"
        | "dueAt"
        | "assigneeName"
        | "priority"
        | "type"
        | "resultNote"
        | "status"
      >
    >,
  ) => void;
  cancelCareTask: (id: string, resultNote?: string) => void;
  addCustomerNote: (customerId: string, body: string) => void;
  setCustomerTags: (customerId: string, tags: string[]) => void;
  assignCustomerStaff: (customerId: string, assigneeName: string) => void;
  bulkAddTags: (customerIds: string[], tags: string[]) => void;
  /** Giữ keepId, chuyển notes/tasks/bookings/messages/packages từ dropId rồi xóa drop */
  mergeCustomers: (keepId: string, dropId: string) => { ok: boolean; error?: string };
  toggleZalo: () => void;
  togglePos: () => void;
  toggleOps: () => void;
  upsertCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  /** Gửi mock tới memberIds của segment — ghi messages + counters */
  launchCampaign: (id: string) => {
    ok: boolean;
    sent: number;
    failed: number;
    error?: string;
  };
  sendZaloMessage: (input: {
    customerId: string;
    templateId: string;
  }) => { ok: boolean; error?: string };
  pushActivity: (entry: Omit<ActivityLogEntry, "id" | "at" | "actorName">) => void;
  createWorkflowDraft: () => string;
  cloneWorkflow: (id: string) => string | null;
  deleteWorkflow: (id: string) => void;
  runWorkflow: (workflowId: string, customerId: string) => string | null;
  simulateBookingEvent: (
    bookingId: string,
    event: "booking.created" | "booking.completed" | "booking.cancelled",
  ) => number;
  createBooking: (input: {
    customerId: string;
    serviceId: string;
    scheduledAt: string;
    technicianId?: string;
    resourceId?: string;
    branchId?: string;
    customerPackageId?: string;
    status?: BookingStatus;
    allowConflict?: boolean;
  }) => { id: string | null; conflicts: string[] };
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setAftercareNote: (bookingId: string, note: string) => void;
  sellPackage: (input: {
    customerId: string;
    serviceId: string;
    branchId?: string;
  }) => string | null;
  payDebt: (debtId: string, amountVnd: number) => void;
  previewSegmentMembers: (criteria: SegmentCriterion[]) => string[];
};

function loadBundle(id: VerticalId): VerticalBundle {
  return structuredClone(getVerticalBundle(id));
}

function readPersistedBundle(id: VerticalId): VerticalBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${BUNDLE_STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VerticalBundle;
    if (!parsed || parsed.id !== id || !Array.isArray(parsed.customers)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearPersistedBundle(id: VerticalId) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${BUNDLE_STORAGE_PREFIX}${id}`);
}

function deductPackageSession(
  packages: CustomerPackage[],
  packageId: string,
): CustomerPackage[] {
  return packages.map((p) => {
    if (p.id !== packageId) return p;
    const remaining = Math.max(0, p.remainingSessions - 1);
    return {
      ...p,
      remainingSessions: remaining,
      status: remaining <= 0 ? "exhausted" : p.status,
    };
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  verticalId: null,
  bundle: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "spa" || raw === "nails" || raw === "salon") {
      const persisted = readPersistedBundle(raw);
      set({
        verticalId: raw,
        bundle: persisted ?? loadBundle(raw),
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true, verticalId: null, bundle: null });
  },

  selectVertical: (id) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    const persisted = readPersistedBundle(id);
    set({ verticalId: id, bundle: persisted ?? loadBundle(id) });
  },

  clearVertical: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ verticalId: null, bundle: null });
  },

  resetDemoData: () => {
    const id = get().verticalId;
    if (!id) return;
    clearPersistedBundle(id);
    set({ bundle: loadBundle(id) });
  },

  upsertCustomer: (customer) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const idx = bundle.customers.findIndex((c) => c.id === customer.id);
    const customers =
      idx >= 0
        ? bundle.customers.map((c) => (c.id === customer.id ? customer : c))
        : [...bundle.customers, { ...customer, id: customer.id || uid("cus") }];
    set({ bundle: { ...bundle, customers } });
  },

  upsertService: (service) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const id = service.id || uid("svc");
    const next: CatalogService = { ...service, id };
    const idx = bundle.services.findIndex((s) => s.id === id);
    const services =
      idx >= 0
        ? bundle.services.map((s) => (s.id === id ? next : s))
        : [...bundle.services, next];
    set({ bundle: { ...bundle, services } });
  },

  toggleServiceActive: (id) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const services = bundle.services.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s,
    );
    set({ bundle: { ...bundle, services } });
  },

  upsertSegment: (segment) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const memberIds = evaluateSegmentMembers(
      bundle.customers,
      segment.criteria,
      bundle.bookings,
      {
        matchMode: segment.matchMode ?? "and",
        packages: bundle.packages,
      },
    );
    const next: Segment = {
      ...segment,
      matchMode: segment.matchMode ?? "and",
      memberIds,
      criteriaSummary: segment.criteria.map(criterionSummary),
    };
    const idx = bundle.segments.findIndex((s) => s.id === next.id);
    const segments =
      idx >= 0
        ? bundle.segments.map((s) => (s.id === next.id ? next : s))
        : [...bundle.segments, next];
    set({ bundle: { ...bundle, segments } });
  },

  deleteSegment: (id) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        segments: bundle.segments.filter((s) => s.id !== id),
      },
    });
  },

  upsertWorkflow: (workflow) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const idx = bundle.workflows.findIndex((w) => w.id === workflow.id);
    const workflows =
      idx >= 0
        ? bundle.workflows.map((w) => (w.id === workflow.id ? workflow : w))
        : [...bundle.workflows, workflow];
    set({ bundle: { ...bundle, workflows } });
  },

  saveWorkflowGraph: (id, patch) => {
    const bundle = get().bundle;
    if (!bundle) return { ok: false, errors: ["No bundle"] };
    const issues = validateWorkflowGraph(patch.graph);
    const wf = bundle.workflows.find((w) => w.id === id);
    if (!wf) return { ok: false, errors: ["Workflow not found"] };
    const triggerNode = patch.graph.nodes.find((n) => n.type === "TRIGGER");
    const trigger =
      patch.trigger ??
      triggerNode?.data.triggerEvent ??
      wf.trigger;
    const next: Workflow = {
      ...wf,
      name: patch.name ?? wf.name,
      trigger,
      graph: patch.graph,
      nodeCount: patch.graph.nodes.length,
      updatedAt: new Date().toISOString(),
      version: wf.version + 1,
    };
    const workflows = bundle.workflows.map((w) => (w.id === id ? next : w));
    set({ bundle: { ...bundle, workflows } });
    return {
      ok: issues.length === 0,
      errors: issues.map((i) => i.message),
    };
  },

  setWorkflowStatus: (id, status) => {
    const bundle = get().bundle;
    if (!bundle) return { ok: false, errors: ["No bundle"] };
    const wf = bundle.workflows.find((w) => w.id === id);
    if (!wf) return { ok: false, errors: ["Not found"] };
    if (status === "active") {
      const issues = validateWorkflowGraph(wf.graph);
      if (issues.length) {
        return { ok: false, errors: issues.map((i) => i.message) };
      }
    }
    const workflows = bundle.workflows.map((w) =>
      w.id === id ? { ...w, status } : w,
    );
    set({ bundle: { ...bundle, workflows } });
    return { ok: true, errors: [] };
  },

  completeTask: (id, resultNote) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const tasks: CareTask[] = bundle.tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: "done",
            resultNote: resultNote ?? t.resultNote,
            completedAt: new Date().toISOString(),
          }
        : t,
    );
    set({ bundle: { ...bundle, tasks } });
  },

  createCareTask: (input) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const task: CareTask = {
      id: uid("task"),
      title: input.title,
      customerId: input.customerId,
      dueAt: input.dueAt,
      status: "open",
      source: "manual",
      assigneeName: input.assigneeName,
      type: input.type ?? "general",
      description: input.description ?? "",
      priority: input.priority ?? "medium",
      createdAt: new Date().toISOString(),
    };
    set({ bundle: { ...bundle, tasks: [task, ...bundle.tasks] } });
  },

  updateCareTask: (id, patch) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        tasks: bundle.tasks.map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      },
    });
  },

  cancelCareTask: (id, resultNote) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        tasks: bundle.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "cancelled",
                resultNote: resultNote ?? t.resultNote ?? "Đã hủy",
              }
            : t,
        ),
      },
    });
  },

  addCustomerNote: (customerId, body) => {
    const bundle = get().bundle;
    if (!bundle || !body.trim()) return;
    set({
      bundle: {
        ...bundle,
        notes: [
          {
            id: uid("note"),
            customerId,
            body: body.trim(),
            authorName: bundle.currentUserName,
            createdAt: new Date().toISOString(),
          },
          ...bundle.notes,
        ],
      },
    });
  },

  setCustomerTags: (customerId, tags) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        customers: bundle.customers.map((c) =>
          c.id === customerId ? { ...c, tags } : c,
        ),
      },
    });
  },

  assignCustomerStaff: (customerId, assigneeName) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        customers: bundle.customers.map((c) =>
          c.id === customerId ? { ...c, assigneeName } : c,
        ),
      },
    });
  },

  bulkAddTags: (customerIds, tags) => {
    const bundle = get().bundle;
    if (!bundle || tags.length === 0) return;
    const idSet = new Set(customerIds);
    set({
      bundle: {
        ...bundle,
        customers: bundle.customers.map((c) =>
          idSet.has(c.id)
            ? { ...c, tags: [...new Set([...c.tags, ...tags])] }
            : c,
        ),
      },
    });
  },

  mergeCustomers: (keepId, dropId) => {
    const bundle = get().bundle;
    if (!bundle) return { ok: false, error: "No bundle" };
    if (keepId === dropId) return { ok: false, error: "Same id" };
    const keep = bundle.customers.find((c) => c.id === keepId);
    const drop = bundle.customers.find((c) => c.id === dropId);
    if (!keep || !drop) return { ok: false, error: "Not found" };

    const mergedTags = [...new Set([...keep.tags, ...drop.tags, "merged"])];
    const merged: Customer = {
      ...keep,
      tags: mergedTags,
      notes: [keep.notes, drop.notes, `Merged from ${drop.code}`]
        .filter(Boolean)
        .join("\n"),
      completedServiceCount:
        keep.completedServiceCount + drop.completedServiceCount,
      totalSpend: keep.totalSpend + drop.totalSpend,
      firstVisitAt:
        keep.firstVisitAt < drop.firstVisitAt
          ? keep.firstVisitAt
          : drop.firstVisitAt,
      lastVisitAt:
        keep.lastVisitAt > drop.lastVisitAt
          ? keep.lastVisitAt
          : drop.lastVisitAt,
      email: keep.email || drop.email,
      zaloUid: keep.zaloUid || drop.zaloUid,
      debtVnd: (keep.debtVnd ?? 0) + (drop.debtVnd ?? 0),
    };

    const rehome = <T extends { customerId: string }>(rows: T[]) =>
      rows.map((r) =>
        r.customerId === dropId ? { ...r, customerId: keepId } : r,
      );

    set({
      bundle: {
        ...bundle,
        customers: [
          ...bundle.customers.filter((c) => c.id !== dropId && c.id !== keepId),
          merged,
        ],
        bookings: rehome(bundle.bookings),
        tasks: rehome(bundle.tasks),
        notes: rehome(bundle.notes),
        messages: rehome(bundle.messages),
        packages: rehome(bundle.packages),
        runs: rehome(bundle.runs),
        debts: rehome(bundle.debts ?? []),
      },
    });
    return { ok: true };
  },

  toggleZalo: () => {
    const bundle = get().bundle;
    if (!bundle) return;
    const next = !bundle.zaloConnected;
    const log: ActivityLogEntry = {
      id: uid("act"),
      at: new Date().toISOString(),
      kind: "zalo",
      title: next ? "OA connected" : "OA disconnected",
      detail: "Mock toggle Zalo OA",
      actorName: bundle.currentUserName,
    };
    set({
      bundle: {
        ...bundle,
        zaloConnected: next,
        activityLog: [log, ...(bundle.activityLog ?? [])],
      },
    });
  },

  togglePos: () => {
    const bundle = get().bundle;
    if (!bundle) return;
    const next = !bundle.posConnected;
    const log: ActivityLogEntry = {
      id: uid("act"),
      at: new Date().toISOString(),
      kind: "settings",
      title: next ? "POS connected (mock)" : "POS disconnected",
      detail: "Dolphin POS integration flag",
      actorName: bundle.currentUserName,
    };
    set({
      bundle: {
        ...bundle,
        posConnected: next,
        activityLog: [log, ...(bundle.activityLog ?? [])],
      },
    });
  },

  toggleOps: () => {
    const bundle = get().bundle;
    if (!bundle) return;
    const next = !bundle.opsConnected;
    const log: ActivityLogEntry = {
      id: uid("act"),
      at: new Date().toISOString(),
      kind: "settings",
      title: next ? "Ops connected (mock)" : "Ops disconnected",
      detail: "Dolphin Ops integration flag",
      actorName: bundle.currentUserName,
    };
    set({
      bundle: {
        ...bundle,
        opsConnected: next,
        activityLog: [log, ...(bundle.activityLog ?? [])],
      },
    });
  },

  pushActivity: (entry) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const log: ActivityLogEntry = {
      id: uid("act"),
      at: new Date().toISOString(),
      actorName: bundle.currentUserName,
      ...entry,
    };
    set({
      bundle: {
        ...bundle,
        activityLog: [log, ...(bundle.activityLog ?? [])],
      },
    });
  },

  upsertCampaign: (campaign) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const id = campaign.id || uid("camp");
    const next: Campaign = { ...campaign, id };
    const list = bundle.campaigns ?? [];
    const idx = list.findIndex((c) => c.id === id);
    const campaigns =
      idx >= 0 ? list.map((c) => (c.id === id ? next : c)) : [...list, next];
    set({ bundle: { ...bundle, campaigns } });
  },

  deleteCampaign: (id) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        campaigns: (bundle.campaigns ?? []).filter((c) => c.id !== id),
      },
    });
  },

  sendZaloMessage: ({ customerId, templateId }) => {
    const bundle = get().bundle;
    if (!bundle) return { ok: false, error: "No bundle" };
    const customer = bundle.customers.find((c) => c.id === customerId);
    const template = bundle.templates.find((t) => t.id === templateId);
    if (!customer || !template) return { ok: false, error: "Thiếu khách/template" };
    if (!bundle.zaloConnected) return { ok: false, error: "OA chưa kết nối" };
    if (!customer.consentZalo) return { ok: false, error: "Thiếu consent Zalo" };
    if (template.approval !== "approved") {
      return { ok: false, error: "Template chưa duyệt" };
    }
    if (template.recipientMode === "uid" && !customer.zaloUid) {
      const fail = {
        id: uid("msg"),
        customerId,
        templateId,
        status: "failed" as const,
        sentAt: new Date().toISOString(),
        error: "Thiếu Zalo UID — template yêu cầu UID",
      };
      set({
        bundle: { ...bundle, messages: [fail, ...bundle.messages] },
      });
      return { ok: false, error: fail.error };
    }
    const msg = {
      id: uid("msg"),
      customerId,
      templateId,
      status: "sent" as const,
      sentAt: new Date().toISOString(),
      error: "",
    };
    set({
      bundle: { ...bundle, messages: [msg, ...bundle.messages] },
    });
    return { ok: true };
  },

  launchCampaign: (id) => {
    const bundle = get().bundle;
    if (!bundle) return { ok: false, sent: 0, failed: 0, error: "No bundle" };
    const camp = (bundle.campaigns ?? []).find((c) => c.id === id);
    if (!camp) return { ok: false, sent: 0, failed: 0, error: "Không tìm thấy" };
    if (!bundle.zaloConnected) {
      return { ok: false, sent: 0, failed: 0, error: "OA chưa kết nối" };
    }
    const tpl = bundle.templates.find((t) => t.id === camp.templateId);
    if (!tpl || tpl.approval !== "approved") {
      return {
        ok: false,
        sent: 0,
        failed: 0,
        error: "Template chưa duyệt / thiếu",
      };
    }
    const seg = bundle.segments.find((s) => s.id === camp.segmentId);
    const memberIds =
      seg?.memberIds?.length
        ? seg.memberIds
        : evaluateSegmentMembers(
            bundle.customers,
            seg?.criteria ?? [],
            bundle.bookings,
            { matchMode: seg?.matchMode ?? "and", packages: bundle.packages },
          );

    let sent = 0;
    let failed = 0;
    const newMsgs = [...bundle.messages];
    for (const cid of memberIds) {
      const cus = bundle.customers.find((c) => c.id === cid);
      if (!cus) continue;
      if (!cus.consentZalo || (tpl.recipientMode === "uid" && !cus.zaloUid)) {
        failed += 1;
        newMsgs.unshift({
          id: uid("msg"),
          customerId: cid,
          templateId: tpl.id,
          campaignId: camp.id,
          status: "failed",
          sentAt: new Date().toISOString(),
          error: !cus.consentZalo
            ? "Thiếu consent"
            : "Thiếu Zalo UID",
        });
        continue;
      }
      sent += 1;
      newMsgs.unshift({
        id: uid("msg"),
        customerId: cid,
        templateId: tpl.id,
        campaignId: camp.id,
        status: "sent",
        sentAt: new Date().toISOString(),
        error: "",
      });
    }

    const log: ActivityLogEntry = {
      id: uid("act"),
      at: new Date().toISOString(),
      kind: "campaign",
      title: `Launch «${camp.name}»`,
      detail: `${sent} sent / ${failed} failed`,
      actorName: bundle.currentUserName,
    };

    set({
      bundle: {
        ...bundle,
        messages: newMsgs,
        campaigns: (bundle.campaigns ?? []).map((c) =>
          c.id === id
            ? {
                ...c,
                status: "completed",
                sentCount: c.sentCount + sent,
                failedCount: c.failedCount + failed,
              }
            : c,
        ),
        activityLog: [log, ...(bundle.activityLog ?? [])],
      },
    });
    return { ok: true, sent, failed };
  },

  createWorkflowDraft: () => {
    const bundle = get().bundle;
    if (!bundle) return "";
    const graph = emptyDraftGraph("booking.created");
    const id = uid("wf");
    const wf: Workflow = {
      id,
      name: "Workflow mới",
      status: "draft",
      trigger: "booking.created",
      nodeCount: graph.nodes.length,
      updatedAt: new Date().toISOString(),
      errorCount: 0,
      version: 1,
      graph,
    };
    set({ bundle: { ...bundle, workflows: [...bundle.workflows, wf] } });
    return id;
  },

  cloneWorkflow: (id) => {
    const bundle = get().bundle;
    if (!bundle) return null;
    const src = bundle.workflows.find((w) => w.id === id);
    if (!src) return null;
    const newId = uid("wf");
    const cloned: Workflow = {
      ...structuredClone(src),
      id: newId,
      name: `${src.name} (bản sao)`,
      status: "draft",
      version: 1,
      errorCount: 0,
      updatedAt: new Date().toISOString(),
      graph: {
        nodes: src.graph.nodes.map((n) => ({
          ...structuredClone(n),
        })),
        edges: src.graph.edges.map((e) => ({
          ...structuredClone(e),
          id: uid("e"),
        })),
      },
    };
    // Remap node ids to avoid collision when editing side by side
    const idMap = new Map<string, string>();
    cloned.graph.nodes = cloned.graph.nodes.map((n) => {
      const nid = uid("n");
      idMap.set(n.id, nid);
      return { ...n, id: nid };
    });
    cloned.graph.edges = cloned.graph.edges.map((e) => ({
      ...e,
      id: uid("e"),
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
    }));
    cloned.nodeCount = cloned.graph.nodes.length;
    set({
      bundle: { ...bundle, workflows: [...bundle.workflows, cloned] },
    });
    return newId;
  },

  deleteWorkflow: (id) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        workflows: bundle.workflows.filter((w) => w.id !== id),
      },
    });
  },

  runWorkflow: (workflowId, customerId) => {
    const bundle = get().bundle;
    if (!bundle) return null;
    const wf = bundle.workflows.find((w) => w.id === workflowId);
    if (!wf) return null;
    const result = runWorkflowMock(bundle, wf, customerId);
    const errorCount =
      result.run.status === "failed" ? wf.errorCount + 1 : wf.errorCount;
    set({
      bundle: {
        ...bundle,
        customers: result.customers,
        tasks: result.tasks,
        messages: result.messages,
        runs: [result.run, ...bundle.runs],
        workflows: bundle.workflows.map((w) =>
          w.id === workflowId ? { ...w, errorCount } : w,
        ),
      },
    });
    return result.run.id;
  },

  simulateBookingEvent: (bookingId, event) => {
    const bundle = get().bundle;
    if (!bundle) return 0;
    const booking = bundle.bookings.find((b) => b.id === bookingId);
    if (!booking) return 0;

    let nextBookings = bundle.bookings;
    let nextPackages = bundle.packages;
    if (event === "booking.completed") {
      nextBookings = bundle.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "completed" as const } : b,
      );
      if (booking.customerPackageId) {
        nextPackages = deductPackageSession(
          nextPackages,
          booking.customerPackageId,
        );
      }
      nextBookings = nextBookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              // giữ package id để lịch sử
            }
          : b,
      );
    }
    if (event === "booking.cancelled") {
      nextBookings = bundle.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
      );
    }

    let working: VerticalBundle = {
      ...bundle,
      bookings: nextBookings,
      packages: nextPackages,
    };
    const results = runActiveWorkflowsForEvent(
      working,
      event,
      booking.customerId,
    );
    for (const r of results) {
      working = {
        ...working,
        customers: r.customers,
        tasks: r.tasks,
        messages: r.messages,
        runs: [r.run, ...working.runs],
        workflows: working.workflows.map((w) =>
          w.id === r.run.workflowId && r.run.status === "failed"
            ? { ...w, errorCount: w.errorCount + 1 }
            : w,
        ),
      };
    }
    set({ bundle: working });
    return results.length;
  },

  createBooking: (input) => {
    const bundle = get().bundle;
    if (!bundle) return { id: null, conflicts: ["No bundle"] };
    const svc = bundle.services.find((s) => s.id === input.serviceId);
    if (!svc) return { id: null, conflicts: ["Thiếu dịch vụ"] };
    const customer = bundle.customers.find((c) => c.id === input.customerId);
    if (!customer) return { id: null, conflicts: ["Thiếu khách"] };
    const conflicts = findBookingConflicts({
      bookings: bundle.bookings,
      shifts: bundle.shifts,
      scheduledAt: input.scheduledAt,
      durationMinutes: svc.durationMinutes,
      technicianId: input.technicianId,
      resourceId: input.resourceId,
    });
    if (conflicts.length && !input.allowConflict) {
      return { id: null, conflicts: conflicts.map((c) => c.message) };
    }
    const id = uid("bk");
    const booking: Booking = {
      id,
      customerId: input.customerId,
      serviceId: svc.id,
      serviceName: svc.name,
      scheduledAt: input.scheduledAt,
      status: input.status ?? "confirmed",
      branchId: input.branchId ?? customer.branchId,
      technicianId: input.technicianId,
      resourceId: input.resourceId,
      durationMinutes: svc.durationMinutes,
      customerPackageId: input.customerPackageId,
    };
    set({
      bundle: { ...bundle, bookings: [...bundle.bookings, booking] },
    });
    return { id, conflicts: conflicts.map((c) => c.message) };
  },

  updateBookingStatus: (bookingId, status) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const booking = bundle.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    let packages = bundle.packages;
    let tasks = bundle.tasks;
    if (
      status === "completed" &&
      booking.status !== "completed" &&
      booking.customerPackageId
    ) {
      packages = deductPackageSession(packages, booking.customerPackageId);
      const pkg = packages.find((p) => p.id === booking.customerPackageId);
      if (pkg && pkg.remainingSessions <= 1 && pkg.remainingSessions >= 0) {
        tasks = [
          {
            id: uid("task"),
            title: `Nhắc gia hạn gói: ${pkg.serviceName} (còn ${pkg.remainingSessions})`,
            customerId: booking.customerId,
            dueAt: new Date(Date.now() + 86400000).toISOString(),
            status: "open",
            source: "workflow",
            assigneeName: bundle.currentUserName,
          },
          ...tasks,
        ];
      }
    }
    set({
      bundle: {
        ...bundle,
        packages,
        tasks,
        bookings: bundle.bookings.map((b) =>
          b.id === bookingId ? { ...b, status } : b,
        ),
      },
    });
  },

  setAftercareNote: (bookingId, note) => {
    const bundle = get().bundle;
    if (!bundle) return;
    set({
      bundle: {
        ...bundle,
        bookings: bundle.bookings.map((b) =>
          b.id === bookingId ? { ...b, aftercareNote: note } : b,
        ),
      },
    });
  },

  payDebt: (debtId, amountVnd) => {
    const bundle = get().bundle;
    if (!bundle) return;
    const debts = bundle.debts.map((d) => {
      if (d.id !== debtId) return d;
      const paid = Math.min(d.amountVnd, d.paidVnd + amountVnd);
      const status =
        paid >= d.amountVnd ? ("paid" as const) : ("partial" as const);
      return { ...d, paidVnd: paid, status };
    });
    const customers = bundle.customers.map((c) => ({
      ...c,
      debtVnd: debts
        .filter((d) => d.customerId === c.id && d.status !== "paid")
        .reduce((s, d) => s + (d.amountVnd - d.paidVnd), 0),
    }));
    set({ bundle: { ...bundle, debts, customers } });
  },

  sellPackage: (input) => {
    const bundle = get().bundle;
    if (!bundle) return null;
    const svc = bundle.services.find((s) => s.id === input.serviceId);
    if (!svc) return null;
    const customer = bundle.customers.find((c) => c.id === input.customerId);
    if (!customer) return null;
    const total = svc.sessionCount && svc.sessionCount > 0 ? svc.sessionCount : 5;
    const id = uid("pkg");
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 3);
    const pkg: CustomerPackage = {
      id,
      customerId: input.customerId,
      serviceId: svc.id,
      serviceName: svc.name,
      totalSessions: total,
      remainingSessions: total,
      purchasedAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
      branchId: input.branchId ?? customer.branchId,
      paidVnd: svc.priceVnd,
      status: "active",
    };
    set({
      bundle: { ...bundle, packages: [...bundle.packages, pkg] },
    });
    return id;
  },

  previewSegmentMembers: (criteria) => {
    const bundle = get().bundle;
    if (!bundle) return [];
    return evaluateSegmentMembers(
      bundle.customers,
      criteria,
      bundle.bookings,
      { packages: bundle.packages },
    );
  },
}));
