# Overview — Dolphin Beauty CRM FE

FE-first CRM cho **Spa · Nails · Salon** (Massage = profile/docs sau; FE không vertical Massage riêng). Chưa Backend — mock Zustand + seed.

## Stack

| Layer | Tech |
| --- | --- |
| UI | Next.js 16 · React 19 · Tailwind 4 · lucide |
| State | Zustand + `localStorage` bundle persist |
| Calendar | FullCalendar 6 |
| Charts | `recharts` |
| Workflow | `@xyflow/react` |
| Dev | `npm run dev` → **http://localhost:3015** |
| Deploy | GitHub Pages · `nchithanh/crm-spa` · xem [deploy.md](./deploy.md) |

## Entry

1. `/chon-linh-vuc` → chọn Spa / Nails / Salon.
2. Shell: sidebar nhóm luôn mở (`lg+`, POS-like) · header CTA nhanh chữ trắng (CRM-like) · mobile dock + `/menu`.

## IA (desktop)

**Tổng quan** · Lịch hẹn & DV · Khách hàng · Chăm sóc · Zalo · Marketing & tự động · Giữ chân · Báo cáo · Hệ thống.

Nhiều route **stub** (`ModuleStub`) — đã vào menu, nghiệp vụ đầy đủ ở phase sau. SoT menu: `lib/nav.ts` (`NAV_GROUPS`).

## Mock data

- Spa seed: **40 khách / 4 cohort Marketing** (`data/spa-dataset.ts`), quan hệ bookings/tasks/packages/workflows/campaigns.
- Selectors: `lib/selectors.ts` (+ `lib/metrics.ts`) — không hardcode KPI trên widget.
- Persist: `dolphin-beauty-crm-bundle:{vertical}` · **Reset demo** trong `/settings`.
- Version helper: `lib/mock-clock.ts` (`MOCK_DATA_VERSION`).

## Modules đã dùng được (không stub)

**Dashboard A–G** (selectors) · Customer 360 · Care · Segments · Retention · Automations · **Campaigns** · Zalo Center · Bookings/Packages · Reports sub · Settings (activity · Ops/POS mock · notifications · reset).

## Out of scope

Backend · Zalo OAuth thật · sync Ops/POS thật · booking/debt engine mới.

## Related

[pages.md](./pages.md) · [data.md](./data.md) · [design.md](./design.md) · [changelog.md](./changelog.md)
