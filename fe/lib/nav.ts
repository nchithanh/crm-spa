import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cake,
  CalendarDays,
  CalendarOff,
  CalendarX2,
  ClipboardList,
  FileWarning,
  Gift,
  GitBranch,
  HeartHandshake,
  History,
  Import,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  ListTodo,
  MessageSquare,
  Package,
  PieChart,
  Repeat2,
  Settings,
  Shuffle,
  Sparkles,
  Star,
  Tags,
  Target,
  UserPlus,
  UserRoundSearch,
  UserX,
  Users,
  UsersRound,
  Wallet,
  Workflow,
  Bell,
  Building2,
  Shield,
  Plug,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobilePrimary?: boolean;
  mobileLabel?: string;
  /** true = Pass 1 stub / chưa đủ nghiệp vụ */
  stub?: boolean;
  badgeKey?: "tasks" | "runs";
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** IA desktop — ưu tiên thao tác lễ tân / NV spa hàng ngày */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "ops",
    label: "Lịch hẹn & Dịch vụ",
    items: [
      {
        href: "/bookings",
        label: "Lịch hẹn",
        icon: CalendarDays,
        mobilePrimary: true,
        mobileLabel: "Lịch",
      },
      {
        href: "/bookings/history",
        label: "Lịch sử sử dụng DV",
        icon: History,
      },
      {
        href: "/packages",
        label: "Liệu trình / gói còn lại",
        icon: Package,
      },
      { href: "/services", label: "Dịch vụ (catalog)", icon: Sparkles },
      {
        href: "/bookings/cancelled",
        label: "Hủy / bỏ lỡ",
        icon: CalendarX2,
      },
      {
        href: "/bookings/rebooking",
        label: "Chưa tái đặt lịch",
        icon: CalendarOff,
      },
    ],
  },
  {
    id: "customers",
    label: "Khách hàng",
    items: [
      {
        href: "/customers",
        label: "Danh sách khách",
        icon: Users,
        mobilePrimary: true,
        mobileLabel: "Khách",
      },
      {
        href: "/customers/leads",
        label: "Khách tiềm năng",
        icon: UserPlus,
      },
      { href: "/segments", label: "Phân nhóm", icon: UsersRound },
      {
        href: "/customers/tags",
        label: "Tags & phân loại",
        icon: Tags,
      },
      {
        href: "/customers/sources",
        label: "Nguồn khách",
        icon: GitBranch,
      },
      {
        href: "/customers/import",
        label: "Import / Export",
        icon: Import,
      },
      {
        href: "/customers/duplicates",
        label: "Khách trùng lặp",
        icon: UserRoundSearch,
      },
    ],
  },
  {
    id: "care",
    label: "Chăm sóc KH",
    items: [
      { href: "/care", label: "Tổng quan chăm sóc", icon: HeartHandshake },
      {
        href: "/tasks",
        label: "Việc cần chăm sóc",
        icon: ListTodo,
        mobilePrimary: true,
        mobileLabel: "Việc",
        badgeKey: "tasks",
      },
      { href: "/tasks/mine", label: "Công việc của tôi", icon: ClipboardList },
      {
        href: "/care/interactions",
        label: "Lịch sử tương tác",
        icon: History,
      },
      {
        href: "/care/consultation",
        label: "Nhật ký tư vấn",
        icon: FileWarning,
      },
      {
        href: "/care/aftercare",
        label: "Chăm sóc sau DV",
        icon: Sparkles,
      },
      { href: "/care/birthdays", label: "Sinh nhật", icon: Cake },
      {
        href: "/care/inactive",
        label: "Lâu chưa quay lại",
        icon: UserX,
      },
      {
        href: "/care/complaints",
        label: "Khiếu nại & phản hồi",
        icon: MessageSquare,
      },
    ],
  },
  {
    id: "zalo",
    label: "Zalo",
    items: [
      { href: "/communication", label: "Zalo Center", icon: MessageSquare },
      {
        href: "/communication/templates",
        label: "Mẫu tin nhắn",
        icon: MessageSquare,
      },
      {
        href: "/communication/history",
        label: "Lịch sử gửi tin",
        icon: History,
      },
    ],
  },
  {
    id: "overview",
    label: "Tổng quan",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        mobilePrimary: true,
        mobileLabel: "Tổng quan",
      },
      {
        href: "/insights",
        label: "Customer Insights",
        icon: PieChart,
      },
      {
        href: "/today",
        label: "Hoạt động hôm nay",
        icon: Activity,
      },
      {
        href: "/alerts",
        label: "Cảnh báo & cơ hội",
        icon: AlertTriangle,
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Automation",
    items: [
      {
        href: "/automations",
        label: "Automation Workflows",
        icon: Workflow,
        badgeKey: "runs",
      },
      {
        href: "/campaigns",
        label: "Chiến dịch chăm sóc",
        icon: Target,
      },
      {
        href: "/campaigns/analytics",
        label: "Phân tích chiến dịch",
        icon: BarChart3,
      },
      {
        href: "/care/scripts",
        label: "Kịch bản chăm sóc mẫu",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "retention",
    label: "Giữ chân & Tăng trưởng",
    items: [
      { href: "/retention/vip", label: "Khách VIP", icon: Star },
      {
        href: "/retention/loyal",
        label: "Khách trung thành",
        icon: HeartHandshake,
      },
      {
        href: "/retention/at-risk",
        label: "Nguy cơ rời bỏ",
        icon: AlertTriangle,
      },
      {
        href: "/retention/inactive",
        label: "Lâu chưa quay lại",
        icon: UserX,
      },
      {
        href: "/retention/returning",
        label: "Khách quay lại",
        icon: Repeat2,
      },
      {
        href: "/retention/rebooking",
        label: "Cơ hội tái đặt lịch",
        icon: Target,
      },
      {
        href: "/retention/referrals",
        label: "Giới thiệu KH",
        icon: Gift,
      },
      {
        href: "/retention/effectiveness",
        label: "Hiệu quả giữ chân",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "reports",
    label: "Báo cáo",
    items: [
      { href: "/reports", label: "Tổng quan kinh doanh", icon: BarChart3 },
      {
        href: "/reports/growth",
        label: "Tăng trưởng KH",
        icon: PieChart,
      },
      {
        href: "/reports/customers",
        label: "Phân tích khách",
        icon: Users,
      },
      {
        href: "/reports/retention",
        label: "Tỷ lệ quay lại",
        icon: Repeat2,
      },
      {
        href: "/reports/care",
        label: "Hiệu quả chăm sóc",
        icon: HeartHandshake,
      },
      {
        href: "/reports/automation",
        label: "Hiệu quả Automation",
        icon: Workflow,
      },
      {
        href: "/reports/zalo",
        label: "Hiệu quả Zalo",
        icon: MessageSquare,
      },
      {
        href: "/reports/staff",
        label: "Hiệu suất NV chăm sóc",
        icon: UsersRound,
      },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    items: [
      { href: "/settings", label: "Cài đặt", icon: Settings },
      {
        href: "/settings/organization",
        label: "Doanh nghiệp",
        icon: Building2,
      },
      { href: "/settings/branches", label: "Chi nhánh", icon: Building2 },
      { href: "/settings/team", label: "Nhân viên", icon: Users },
      {
        href: "/settings/permissions",
        label: "Vai trò & phân quyền",
        icon: Shield,
      },
      { href: "/settings/zalo", label: "Kết nối Zalo OA", icon: Link2 },
      {
        href: "/settings/integrations/ops",
        label: "Tích hợp Dolphin Ops",
        icon: Plug,
      },
      {
        href: "/settings/integrations/pos",
        label: "Tích hợp Dolphin POS",
        icon: Plug,
      },
      {
        href: "/settings/industry",
        label: "Cấu hình ngành",
        icon: Sparkles,
      },
      {
        href: "/settings/notifications",
        label: "Thông báo",
        icon: Bell,
      },
      {
        href: "/settings/activity",
        label: "Nhật ký hoạt động",
        icon: History,
      },
      {
        href: "/finance",
        label: "Công nợ (stub POS)",
        icon: Wallet,
      },
    ],
  },
];

/** Flat list (legacy helpers / mobile menu) */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const MOBILE_DOCK = {
  left: [
    NAV_ITEMS.find((i) => i.href === "/")!,
    NAV_ITEMS.find((i) => i.href === "/customers")!,
  ],
  center: NAV_ITEMS.find((i) => i.href === "/bookings")!,
  right: [NAV_ITEMS.find((i) => i.href === "/tasks")!],
  menu: {
    href: "/menu",
    label: "Menu",
    mobileLabel: "Menu",
    icon: LayoutGrid,
  },
} as const;

export function isNavActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavLabel(pathname: string): string {
  if (pathname === "/menu") return "Menu";
  const exact = NAV_ITEMS.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const partial = [...NAV_ITEMS]
    .filter((i) => i.href !== "/" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return partial?.label ?? "Dolphin Beauty CRM";
}

export function findNavGroupId(pathname: string): string | null {
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => isNavActive(i.href, pathname))) return g.id;
  }
  return null;
}

export const SwitchVerticalIcon = Shuffle;
