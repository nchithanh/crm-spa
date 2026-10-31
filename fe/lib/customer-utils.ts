import type {
  Customer,
  CustomerSource,
  VerticalBundle,
} from "@/lib/types";
import { daysSince } from "@/lib/metrics";

export const SOURCE_LABELS: Record<CustomerSource, string> = {
  zalo: "Zalo",
  walk_in: "Walk-in",
  referral: "Giới thiệu",
  facebook: "Facebook",
  web: "Website",
  other: "Khác",
};

export type CustomerSortKey =
  | "name"
  | "lastVisit"
  | "visits"
  | "spend"
  | "code";

export type CustomerFilters = {
  q: string;
  status: string;
  tag: string;
  source: string;
  assignee: string;
  branchId: string;
  /** "any" | "7" | "30" | "60" | "90+" */
  lastVisitBucket: string;
};

export function collectAllTags(customers: Customer[]): string[] {
  const set = new Set<string>();
  for (const c of customers) for (const t of c.tags) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b, "vi"));
}

export function collectAssignees(customers: Customer[]): string[] {
  return [...new Set(customers.map((c) => c.assigneeName).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  );
}

export function filterCustomers(
  customers: Customer[],
  f: CustomerFilters,
  now = Date.now(),
): Customer[] {
  return customers.filter((c) => {
    const hay =
      `${c.fullName} ${c.phone} ${c.code} ${c.tags.join(" ")}`.toLowerCase();
    if (f.q && !hay.includes(f.q.toLowerCase())) return false;
    if (f.status !== "all" && c.status !== f.status) return false;
    if (f.tag !== "all" && !c.tags.includes(f.tag)) return false;
    if (f.source !== "all" && (c.source ?? "other") !== f.source) return false;
    if (f.assignee !== "all" && c.assigneeName !== f.assignee) return false;
    if (f.branchId !== "all" && c.branchId !== f.branchId) return false;
    if (f.lastVisitBucket !== "all") {
      const d = daysSince(c.lastVisitAt, now);
      if (f.lastVisitBucket === "7" && d > 7) return false;
      if (f.lastVisitBucket === "30" && (d <= 7 || d > 30)) return false;
      if (f.lastVisitBucket === "60" && (d <= 30 || d > 60)) return false;
      if (f.lastVisitBucket === "90+" && d <= 60) return false;
    }
    return true;
  });
}

export function sortCustomers(
  customers: Customer[],
  key: CustomerSortKey,
  dir: "asc" | "desc",
): Customer[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...customers].sort((a, b) => {
    let cmp = 0;
    if (key === "name") cmp = a.fullName.localeCompare(b.fullName, "vi");
    else if (key === "code") cmp = a.code.localeCompare(b.code);
    else if (key === "visits")
      cmp = a.completedServiceCount - b.completedServiceCount;
    else if (key === "spend") cmp = a.totalSpend - b.totalSpend;
    else cmp = a.lastVisitAt.localeCompare(b.lastVisitAt);
    return cmp * mul;
  });
}

export function exportCustomersCsv(
  customers: Customer[],
  bundle: VerticalBundle,
): string {
  const header = [
    "code",
    "fullName",
    "phone",
    "email",
    "status",
    "tags",
    "source",
    "assignee",
    "branch",
    "lastVisit",
    "visits",
    "totalSpend",
  ];
  const lines = [header.join(",")];
  for (const c of customers) {
    const br = bundle.branches.find((b) => b.id === c.branchId)?.name ?? "";
    const row = [
      c.code,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.phone,
      c.email,
      c.status,
      `"${c.tags.join("|")}"`,
      c.source ?? "other",
      `"${c.assigneeName}"`,
      `"${br}"`,
      c.lastVisitAt.slice(0, 10),
      String(c.completedServiceCount),
      String(c.totalSpend),
    ];
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type DuplicateGroup = {
  key: string;
  kind: "phone" | "name";
  customers: Customer[];
};

export function findDuplicateGroups(customers: Customer[]): DuplicateGroup[] {
  const byPhone = new Map<string, Customer[]>();
  const byName = new Map<string, Customer[]>();
  for (const c of customers) {
    const p = c.phone.replace(/\s+/g, "");
    if (p) {
      const arr = byPhone.get(p) ?? [];
      arr.push(c);
      byPhone.set(p, arr);
    }
    const n = c.fullName.trim().toLowerCase();
    if (n) {
      const arr = byName.get(n) ?? [];
      arr.push(c);
      byName.set(n, arr);
    }
  }
  const groups: DuplicateGroup[] = [];
  for (const [key, list] of byPhone) {
    if (list.length >= 2)
      groups.push({ key: `phone:${key}`, kind: "phone", customers: list });
  }
  for (const [key, list] of byName) {
    if (list.length >= 2) {
      // bỏ group đã cover bởi cùng phone pair
      const phones = new Set(list.map((c) => c.phone.replace(/\s+/g, "")));
      if (phones.size === 1 && list.length === (byPhone.get([...phones][0]!)?.length ?? 0))
        continue;
      groups.push({ key: `name:${key}`, kind: "name", customers: list });
    }
  }
  return groups;
}

/** Lead = chưa từng hoàn thành DV (prospect) */
export function getLeadCustomers(customers: Customer[]): Customer[] {
  return customers.filter((c) => c.completedServiceCount === 0);
}
