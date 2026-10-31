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

## Radius

- Card / panel: ~10–16px  
- CTA: `rounded-xl` (12px) trên `Button`  
- Dock pill: `rounded-full` (shape dock POS)

## Charts

- Area DT 14 ngày: stroke brand nhẹ  
- Bar DV: sky · Bar KTV: slate (không tô hết brand)
