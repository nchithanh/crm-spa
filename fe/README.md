# Dolphin Beauty CRM — Frontend

FE-first, hardcode data. Design chrome theo Dolphin brand `#5d5cc4`; semantic màu tách riêng (xem docs).

## Chạy local

```bash
cd products/saas/crm-spa/fe
npm install
npm run dev
```

Mở http://localhost:3015 → chọn **Spa / Nails / Salon**.

## Deploy

GitHub Pages — [`documentations/deploy.md`](./documentations/deploy.md)

```bash
npm run build:pages
```

## Documentations (SoT FE)

Bắt buộc cập nhật khi đổi code — rule `.cursor/rules/fe-documentations.mdc`:

→ [`documentations/README.md`](./documentations/README.md)

## Product docs (PRD / planning)

[`docs/product/dolphin-beauty-crm/`](../../../../docs/product/dolphin-beauty-crm/)

## Hiện trạng

Shell + Dashboard (charts) · Customers 360 · Segments · Workflow · Zalo mock · Tasks · Bookings (FullCalendar + KTV) · Services · Reports · Finance · Settings · Mobile dock + `/menu`.

**Chưa:** Backend NestJS / Zalo OAuth thật / sync Ops·POS.
