import type {
  Booking,
  Customer,
  CustomerPackage,
  SegmentCriterion,
  SegmentField,
  SegmentOp,
} from "@/lib/types";

function daysSince(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 9999;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

function daysUntilBirthday(birthday: string): number {
  if (!birthday) return 9999;
  const [, m, d] = birthday.split("-").map(Number);
  if (!m || !d) return 9999;
  const now = new Date();
  const next = new Date(now.getFullYear(), m - 1, d);
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function hasActivePackage(
  customerId: string,
  packages: CustomerPackage[] | undefined,
): boolean {
  return (packages ?? []).some(
    (p) =>
      p.customerId === customerId &&
      p.status === "active" &&
      p.remainingSessions > 0,
  );
}

function fieldValue(
  customer: Customer,
  field: SegmentField,
  bookings: Booking[],
  packages?: CustomerPackage[],
): string | number | boolean {
  switch (field) {
    case "lastVisitAt":
      return customer.lastVisitAt;
    case "completedServiceCount":
      return customer.completedServiceCount;
    case "totalSpend":
      return customer.totalSpend;
    case "tags":
      return customer.tags.join(",");
    case "birthday":
      return customer.birthday;
    case "customerStatus":
      return customer.status;
    case "branchId":
      return customer.branchId;
    case "assigneeName":
      return customer.assigneeName;
    case "upcomingAppointment":
      return bookings.some(
        (b) =>
          b.customerId === customer.id &&
          ["upcoming", "confirmed", "in_service"].includes(b.status),
      );
    case "activePackage":
      return hasActivePackage(customer.id, packages);
    case "serviceGroupsUsed":
      return customer.tags.join(",");
  }
}

function matchOne(
  customer: Customer,
  c: SegmentCriterion,
  bookings: Booking[],
  packages?: CustomerPackage[],
): boolean {
  const raw = fieldValue(customer, c.field, bookings, packages);
  const op: SegmentOp = c.op;
  const v = c.value;

  if (op === "has_upcoming") {
    return Boolean(raw) === (v !== "false");
  }
  if (op === "has_package_tag") {
    return Boolean(raw) === (v !== "false");
  }
  if (op === "days_since_gt") {
    return daysSince(String(raw)) > Number(v);
  }
  if (op === "days_since_lt") {
    return daysSince(String(raw)) < Number(v);
  }
  if (c.field === "birthday" && (op === "lte" || op === "lt")) {
    return daysUntilBirthday(String(raw)) <= Number(v);
  }

  if (op === "contains") {
    return String(raw).toLowerCase().includes(v.toLowerCase());
  }
  if (op === "eq") return String(raw) === v;
  if (op === "neq") return String(raw) !== v;

  const num = Number(raw);
  const target = Number(v);
  if (op === "gt") return num > target;
  if (op === "gte") return num >= target;
  if (op === "lt") return num < target;
  if (op === "lte") return num <= target;
  return false;
}

export function evaluateSegmentMembers(
  customers: Customer[],
  criteria: SegmentCriterion[],
  bookings: Booking[],
  opts?: {
    matchMode?: "and" | "or";
    packages?: CustomerPackage[];
  },
): string[] {
  if (criteria.length === 0) return [];
  const mode = opts?.matchMode ?? "and";
  const packages = opts?.packages;
  return customers
    .filter((cus) =>
      mode === "or"
        ? criteria.some((c) => matchOne(cus, c, bookings, packages))
        : criteria.every((c) => matchOne(cus, c, bookings, packages)),
    )
    .map((c) => c.id);
}

export function criterionSummary(c: SegmentCriterion): string {
  return `${c.field} ${c.op} ${c.value}`;
}

export const SEGMENT_FIELD_OPTIONS: { value: SegmentField; label: string }[] = [
  { value: "lastVisitAt", label: "Lần ghé gần nhất" },
  { value: "completedServiceCount", label: "Số lần hoàn thành DV" },
  { value: "totalSpend", label: "Tổng chi tiêu" },
  { value: "serviceGroupsUsed", label: "Nhóm DV / tags dịch vụ" },
  { value: "tags", label: "Tags" },
  { value: "birthday", label: "Sinh nhật (ngày còn lại)" },
  { value: "customerStatus", label: "Trạng thái KH" },
  { value: "branchId", label: "Chi nhánh" },
  { value: "assigneeName", label: "NV phụ trách" },
  { value: "upcomingAppointment", label: "Lịch hẹn sắp tới" },
  { value: "activePackage", label: "Gói đang dùng" },
];
