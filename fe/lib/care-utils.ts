import { daysSince } from "@/lib/metrics";
import { startOfDay } from "@/lib/mock-clock";
import type {
  CareTask,
  CareTaskPriority,
  CareTaskType,
  Customer,
  VerticalBundle,
} from "@/lib/types";

export const CARE_TYPE_LABELS: Record<CareTaskType, string> = {
  follow_up: "Follow-up",
  post_service: "Sau dịch vụ",
  birthday: "Sinh nhật",
  rebooking: "Tái đặt lịch",
  consultation: "Tư vấn",
  complaint: "Khiếu nại",
  general: "Chăm sóc chung",
};

export const CARE_PRIORITY_LABELS: Record<CareTaskPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn",
};

export function normalizeTask(t: CareTask): CareTask & {
  type: CareTaskType;
  priority: CareTaskPriority;
} {
  return {
    ...t,
    type: t.type ?? "general",
    priority: t.priority ?? "medium",
  };
}

export type CareViewFilter =
  | "all"
  | "mine"
  | "today"
  | "overdue"
  | "upcoming"
  | "done"
  | "cancelled";

export function filterCareTasks(
  tasks: CareTask[],
  opts: {
    view: CareViewFilter;
    me: string;
    type?: string;
    priority?: string;
    q?: string;
    now?: number;
  },
): CareTask[] {
  const now = opts.now ?? Date.now();
  const start = startOfDay(now);
  const end = start + 86_400_000;
  const q = (opts.q ?? "").toLowerCase();

  return tasks
    .map(normalizeTask)
    .filter((t) => {
      if (opts.type && opts.type !== "all" && t.type !== opts.type) return false;
      if (opts.priority && opts.priority !== "all" && t.priority !== opts.priority)
        return false;
      if (q) {
        const hay = `${t.title} ${t.description ?? ""} ${t.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      switch (opts.view) {
        case "done":
          return t.status === "done";
        case "cancelled":
          return t.status === "cancelled";
        case "mine":
          return t.status === "open" && t.assigneeName === opts.me;
        case "overdue":
          return t.status === "open" && Date.parse(t.dueAt) < now;
        case "today": {
          if (t.status !== "open") return false;
          const due = Date.parse(t.dueAt);
          return due >= start && due < end;
        }
        case "upcoming": {
          if (t.status !== "open") return false;
          const due = Date.parse(t.dueAt);
          return due >= end;
        }
        case "all":
        default:
          return t.status === "open";
      }
    })
    .sort((a, b) => {
      const po: Record<CareTaskPriority, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      const pd =
        po[a.priority ?? "medium"] - po[b.priority ?? "medium"];
      if (pd !== 0) return pd;
      return a.dueAt.localeCompare(b.dueAt);
    });
}

export function careDashboardStats(bundle: VerticalBundle, now = Date.now()) {
  const me = bundle.currentUserName;
  const open = bundle.tasks.filter((t) => t.status === "open");
  const overdue = open.filter((t) => Date.parse(t.dueAt) < now);
  const start = startOfDay(now);
  const end = start + 86_400_000;
  const today = open.filter((t) => {
    const d = Date.parse(t.dueAt);
    return d >= start && d < end;
  });
  const mine = open.filter((t) => t.assigneeName === me);
  const done = bundle.tasks.filter((t) => t.status === "done");
  const byType: Record<string, number> = {};
  for (const t of open) {
    const ty = t.type ?? "general";
    byType[ty] = (byType[ty] ?? 0) + 1;
  }
  return {
    open: open.length,
    overdue: overdue.length,
    today: today.length,
    mine: mine.length,
    done: done.length,
    byType,
  };
}

export function buildInteractionFeed(bundle: VerticalBundle) {
  type Row = {
    id: string;
    at: string;
    kind: "task" | "note" | "zalo";
    title: string;
    detail: string;
    customerId: string;
  };
  const rows: Row[] = [];
  for (const t of bundle.tasks) {
    rows.push({
      id: `t_${t.id}`,
      at: t.completedAt ?? t.createdAt ?? t.dueAt,
      kind: "task",
      title: t.title,
      detail: `${t.status} · ${t.assigneeName}${t.resultNote ? ` · ${t.resultNote}` : ""}`,
      customerId: t.customerId,
    });
  }
  for (const n of bundle.notes) {
    rows.push({
      id: `n_${n.id}`,
      at: n.createdAt,
      kind: "note",
      title: "Ghi chú NV",
      detail: `${n.authorName}: ${n.body}`,
      customerId: n.customerId,
    });
  }
  for (const m of bundle.messages) {
    const tpl = bundle.templates.find((x) => x.id === m.templateId);
    rows.push({
      id: `m_${m.id}`,
      at: m.sentAt,
      kind: "zalo",
      title: tpl?.name ?? m.templateId,
      detail: m.status + (m.error ? ` — ${m.error}` : ""),
      customerId: m.customerId,
    });
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

export function customersNeedingBirthdayCare(
  customers: Customer[],
  now = new Date(),
): Customer[] {
  return customers.filter((c) => {
    if (!c.birthday) return false;
    // reuse metrics-style: birthday string YYYY-MM-DD
    const parts = c.birthday.split("-").map(Number);
    const m = parts[1];
    const d = parts[2];
    if (!m || !d) return false;
    const next = new Date(now.getFullYear(), m - 1, d);
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const days = Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
    return days >= 0 && days <= 14;
  });
}

export function inactiveForCare(
  customers: Customer[],
  now = Date.now(),
): Customer[] {
  return customers.filter(
    (c) =>
      c.completedServiceCount >= 1 &&
      daysSince(c.lastVisitAt, now) > 60 &&
      c.status !== "inactive",
  );
}
