import { cn } from "@/lib/utils";

/**
 * Semantic map — không dùng brand indigo cho status/stage/nợ.
 * success=emerald · warn=amber · danger=rose · info=sky · stage=blue/violet/orange
 */
const MAP: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  vip: "bg-amber-50 text-amber-800",
  draft: "bg-slate-100 text-slate-600",
  paused: "bg-amber-50 text-amber-700",
  open: "bg-sky-50 text-sky-700",
  done: "bg-emerald-50 text-emerald-700",
  overdue: "bg-rose-50 text-rose-700",
  urgent: "bg-rose-50 text-rose-700",
  high: "bg-orange-50 text-orange-800",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-slate-100 text-slate-600",
  follow_up: "bg-sky-50 text-sky-700",
  post_service: "bg-violet-50 text-violet-800",
  birthday: "bg-pink-50 text-pink-700",
  rebooking: "bg-indigo-50 text-indigo-700",
  consultation: "bg-teal-50 text-teal-800",
  complaint: "bg-rose-50 text-rose-700",
  general: "bg-slate-100 text-slate-700",
  upcoming: "bg-sky-50 text-sky-700",
  confirmed: "bg-blue-50 text-blue-700",
  in_service: "bg-violet-50 text-violet-800",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  rescheduled: "bg-amber-50 text-amber-700",
  no_show: "bg-orange-50 text-orange-800",
  exhausted: "bg-slate-100 text-slate-600",
  expired: "bg-rose-50 text-rose-700",
  partial: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-700",
  debt_open: "bg-rose-50 text-rose-700",
  sent: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  uid: "bg-sky-50 text-sky-700",
  zbs_phone: "bg-violet-50 text-violet-700",
  connected: "bg-emerald-50 text-emerald-700",
  disconnected: "bg-rose-50 text-rose-700",
  gain: "bg-emerald-50 text-emerald-700",
  loss: "bg-rose-50 text-rose-700",
};

const LABEL: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Ngưng",
  vip: "VIP",
  draft: "Nháp",
  paused: "Tạm dừng",
  open: "Cần xử lý",
  done: "Xong",
  overdue: "Quá hạn",
  urgent: "Khẩn",
  high: "Cao",
  medium: "TB",
  low: "Thấp",
  follow_up: "Follow-up",
  post_service: "Sau DV",
  birthday: "Sinh nhật",
  rebooking: "Tái đặt",
  consultation: "Tư vấn",
  complaint: "Khiếu nại",
  general: "Chung",
  upcoming: "Sắp tới",
  confirmed: "Đã xác nhận",
  in_service: "Đang làm",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rescheduled: "Đổi lịch",
  no_show: "No-show",
  exhausted: "Hết buổi",
  expired: "Hết hạn",
  partial: "Thu một phần",
  paid: "Đã thu đủ",
  debt_open: "Còn nợ",
  sent: "Đã gửi",
  failed: "Lỗi",
  pending: "Chờ",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  uid: "Theo UID",
  zbs_phone: "ZBS · SĐT",
  connected: "Đã kết nối",
  disconnected: "Chưa kết nối",
  gain: "Lời",
  loss: "Lỗ",
};

export function Badge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        MAP[status] ?? "bg-slate-100 text-slate-600",
        className,
      )}
    >
      {label ?? LABEL[status] ?? status}
    </span>
  );
}
