# Design — Beauty CRM FE

Tokens: `app/globals.css`.

## Palette (trắng · đen · theme CTA · semantic)

| Lớp | Dùng cho | Token |
| --- | --- | --- |
| Trắng | Main / card / header | `--background` `--card` `#ffffff` |
| Đen | Sidebar desktop | `--sidebar` `#0a0a0a` |
| Theme | **Chỉ** CTA primary, FAB dock, `Button` default, FC toolbar | `--brand-500` `#7800CF` · hover `#4B0082` · nhấn `#3D0069` · đậm `#1F0036` |
| Semantic | Warning / status / stage / badge nghiệp vụ | emerald · amber · rose · sky · stage |

**Không** tô tím lên nav active, search wash, surface, badge số sidebar.

## Semantic (bắt buộc phân biệt)

| Vai trò | Màu | Ví dụ |
| --- | --- | --- |
| Success / đã thu / hoàn thành | Emerald | Badge `paid` `completed` `connected` |
| Warning / partial / chờ | Amber | `partial` `pending` `rescheduled` |
| Danger / nợ / lỗi / hủy | Rose | `debt_open` `failed` `cancelled` · số nợ `/finance` |
| Info / task mở / sắp tới | Sky | `open` `upcoming` |
| Stage lịch | Theme / violet / orange | `confirmed` `#7800CF` · `in_service` · `no_show` |

Helper CSS: `.text-debt` `.text-gain` `.bg-debt-soft` · Badge map trong `components/ui/badge.tsx`.

## Shell (tham chiếu POS + CRM)

- **Favicon / PWA icon:** `public/favicon.ico` · `icon-192.png` · `icon-512.png` (mark Dolphin indigo).
- **Skeleton:** content `slate-200`; sidebar `white/10` trên `--sidebar`. SoT: `components/ui/skeleton.tsx`.
- **Sidebar desktop (`lg+`, 260px):** **đen** (`--sidebar`); BrandMark + «DOLPHIN BEAUTY»; nhóm luôn mở; CN/select; footer avatar xám (không brand). Active: `white/10` + rail trắng. Badge số: trắng/đen.
- **Header desktop:** search nền `--surface-muted` · CTA theme (**Đặt lịch** · **Gửi Zalo**) · outline **Khách mới** · **Báo cáo** · chuông. Không breadcrumb.
- **Header mobile:** search · Tìm nhanh (icon) · **+ Tạo mới** (nút brand, mở bottom sheet: Đặt lịch · Gửi Zalo · Khách mới) · chuông. CTA chữ chỉ hiện từ `lg`.
- **Sidebar thứ tự:** Tổng quan → Lịch hẹn → Khách → Chăm sóc → Zalo → Marketing → Giữ chân → Báo cáo → Hệ thống. Một mục active.
- **`/bookings`:** một toolbar; mặc định tuần; tháng `dayMaxEvents=3`; event `HH:mm · Tên KH`; Ops chỉ khi chọn. Mobile: panel Ops là bottom sheet (backdrop, `max-h-[92svh]`, cuộn được); `?new=1` mở thẳng form đặt lịch.
- **Mobile:** dock POS-like giữ nguyên (logo · Khách · Lịch giữa · Việc · Menu).
- **Dashboard `/`:** hero **search AI** (2 lớp: halo nhạt + ô trắng, `Ctrl/⌘K`) và **Gần đây** gói trong `max-w-5xl` căn giữa, `lg:pt-[10vh]`; Gần đây = 3 cột theo 3 lĩnh vực chính (**Khách hàng** · **Lịch hẹn & Dịch vụ** · **Chăm sóc KH**), mỗi cột có title + 5 action không border/card, hover `brand-50`; overview A–G full width.

## Surface

- Nền app **trắng** `#ffffff`; border xám `#e5e7eb`; soft UI `--surface-muted` `#f4f4f5` (search / hover). Sidebar đen tách biệt.
- Dashboard `/` mobile: 3 cột Gần đây cách nhau `border-b`; từ `sm+` bỏ border.

## Radius

- Card / panel: ~10–16px  
- CTA: `rounded-xl` (12px) trên `Button`  
- Dock pill: `rounded-full` (shape dock POS)

## Charts

- Area DT 14 ngày: stroke brand nhẹ  
- Bar DV: sky · Bar KTV: slate (không tô hết brand)
