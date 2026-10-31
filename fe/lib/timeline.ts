import type { VerticalBundle } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  at: string;
  kind: string;
  title: string;
  detail: string;
};

export function buildCustomerTimeline(
  bundle: VerticalBundle,
  customerId: string,
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const b of bundle.bookings.filter((x) => x.customerId === customerId)) {
    items.push({
      id: `bk_${b.id}`,
      at: b.scheduledAt,
      kind: "booking",
      title:
        b.status === "completed"
          ? "Hoàn thành dịch vụ"
          : b.status === "cancelled"
            ? "Hủy lịch hẹn"
            : b.status === "rescheduled"
              ? "Đổi lịch hẹn"
              : "Lịch hẹn sắp tới",
      detail: `${b.serviceName} · ${b.status}`,
    });
  }

  for (const m of bundle.messages.filter((x) => x.customerId === customerId)) {
    const tpl = bundle.templates.find((t) => t.id === m.templateId);
    items.push({
      id: `msg_${m.id}`,
      at: m.sentAt,
      kind: "zalo",
      title:
        m.status === "sent"
          ? "Đã gửi Zalo"
          : m.status === "failed"
            ? "Gửi Zalo thất bại"
            : "Zalo đang chờ",
      detail: `${tpl?.name ?? m.templateId}${m.error ? ` — ${m.error}` : ""}`,
    });
  }

  for (const t of bundle.tasks.filter((x) => x.customerId === customerId)) {
    items.push({
      id: `task_${t.id}`,
      at: t.dueAt,
      kind: "care",
      title: t.status === "done" ? "Care task hoàn thành" : "Care task",
      detail: `${t.title} · ${t.assigneeName || "Chưa gán"} · ${t.source}`,
    });
  }

  for (const n of bundle.notes.filter((x) => x.customerId === customerId)) {
    items.push({
      id: `note_${n.id}`,
      at: n.createdAt,
      kind: "note",
      title: "Ghi chú nhân viên",
      detail: `${n.authorName}: ${n.body}`,
    });
  }

  for (const r of bundle.runs.filter((x) => x.customerId === customerId)) {
    items.push({
      id: `run_${r.id}`,
      at: r.startedAt,
      kind: "automation",
      title:
        r.status === "failed"
          ? "Automation thất bại"
          : "Automation đã chạy",
      detail: `${r.workflowName} v${r.workflowVersion}${r.error ? ` — ${r.error}` : ""}`,
    });
  }

  const customer = bundle.customers.find((c) => c.id === customerId);
  if (customer) {
    for (const tag of customer.tags) {
      items.push({
        id: `tag_${customerId}_${tag}`,
        at: customer.lastVisitAt,
        kind: "tag",
        title: "Tag trên hồ sơ",
        detail: tag,
      });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export function timelineLabel(item: TimelineItem): string {
  return `${formatDateTime(item.at)} · ${item.title}`;
}
