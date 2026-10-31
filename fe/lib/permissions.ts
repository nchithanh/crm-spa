/** Ma trận quyền demo (FE) — không enforce thật */
export type DemoRole = "owner" | "manager" | "staff" | "technician";

export type DemoPermission =
  | "customers.read"
  | "customers.write"
  | "bookings.read"
  | "bookings.write"
  | "services.write"
  | "packages.sell"
  | "finance.view"
  | "reports.view"
  | "automations.manage"
  | "settings.manage";

export const DEMO_PERMISSION_LABELS: Record<DemoPermission, string> = {
  "customers.read": "Xem khách",
  "customers.write": "Sửa khách",
  "bookings.read": "Xem lịch",
  "bookings.write": "Đặt / đổi lịch",
  "services.write": "Sửa catalog",
  "packages.sell": "Bán gói",
  "finance.view": "Xem công nợ / DT mock",
  "reports.view": "Xem báo cáo",
  "automations.manage": "Quản lý automation",
  "settings.manage": "Cài đặt hệ thống",
};

export const DEMO_ROLE_MATRIX: Record<DemoRole, DemoPermission[]> = {
  owner: [
    "customers.read",
    "customers.write",
    "bookings.read",
    "bookings.write",
    "services.write",
    "packages.sell",
    "finance.view",
    "reports.view",
    "automations.manage",
    "settings.manage",
  ],
  manager: [
    "customers.read",
    "customers.write",
    "bookings.read",
    "bookings.write",
    "services.write",
    "packages.sell",
    "finance.view",
    "reports.view",
    "automations.manage",
  ],
  staff: [
    "customers.read",
    "customers.write",
    "bookings.read",
    "bookings.write",
    "packages.sell",
    "reports.view",
  ],
  technician: ["customers.read", "bookings.read", "bookings.write"],
};
