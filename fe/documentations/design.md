# Design — Beauty CRM FE

Tokens: `app/globals.css`.

## Brand chrome (indigo Dolphin)

Dùng **chỉ** cho chrome:

- CTA primary (`Button` default) → `--brand-500` / `#5d5cc4`
- Nav active · dock FAB giữa · focus input · FullCalendar toolbar buttons
- Soft wash: `--brand-50` / `--brand-100`

**Không** remap toàn bộ `emerald-*` → brand (đã bỏ).

## Semantic (bắt buộc phân biệt)

| Vai trò | Màu | Ví dụ |
| --- | --- | --- |
| Success / đã thu / hoàn thành | Emerald | Badge `paid` `completed` `connected` |
| Warning / partial / chờ | Amber | `partial` `pending` `rescheduled` |
| Danger / nợ / lỗi / hủy | Rose | `debt_open` `failed` `cancelled` · số nợ `/finance` |
| Info / task mở / sắp tới | Sky | `open` `upcoming` |
| Stage lịch | Blue / violet / orange | `confirmed` `#2563eb` · `in_service` · `no_show` |

Helper CSS: `.text-debt` `.text-gain` `.bg-debt-soft` · Badge map trong `components/ui/badge.tsx`.

## Shell (tham chiếu POS + CRM)

- **Favicon / PWA icon:** `public/favicon.ico` · `icon-192.png` · `icon-512.png` (mark Dolphin indigo).
- **Skeleton:** `animate-pulse` khối `slate-200` / `--brand-100`; bo `rounded-xl` / card 12px. SoT: `components/ui/skeleton.tsx`.
- **Sidebar desktop (`lg+`, 260px):** nền trắng; BrandMark + «DOLPHIN BEAUTY»; nhóm **luôn mở** + scroll (không accordion); CN trong sidebar; footer avatar + đổi lĩnh vực. Active: `--brand-50` + rail trái `--brand-500`.
- **Header desktop:** search (Enter → `/customers?q=`) · CTA primary chữ **trắng** trên indigo (**Đặt lịch** · **Gửi Zalo**) · outline **Khách mới** · **Báo cáo** · chuông. Không breadcrumb.
- **Sidebar thứ tự:** Tổng quan → Lịch hẹn → Khách → Chăm sóc → Zalo → Marketing → Giữ chân → Báo cáo → Hệ thống. Một mục active.
- **`/bookings`:** một toolbar; mặc định tuần; tháng `dayMaxEvents=3`; event `HH:mm · Tên KH`; Ops chỉ khi chọn.
- **Mobile:** dock POS-like giữ nguyên (logo · Khách · Lịch giữa · Việc · Menu).

## Radius

- Card / panel: ~10–16px  
- CTA: `rounded-xl` (12px) trên `Button`  
- Dock pill: `rounded-full` (shape dock POS)

## Charts

- Area DT 14 ngày: stroke brand nhẹ  
- Bar DV: sky · Bar KTV: slate (không tô hết brand)
