# Changelog — Beauty CRM FE

SoT nhật ký runtime FE. Product planning cũ: `docs/product/dolphin-beauty-crm/06-planning/fe-wave1-changelog.md` (legacy; ưu tiên file này khi coding).

## 2026-10-31 — Copy VI · nav 1 active · Tổng quan đầu

- Nav + dashboard: tiếng Việt; giữ keyword Zalo · VIP · POS · OA · KPI · CRM.
- `isNavActive`: chỉ highlight href khớp dài nhất (hết sáng đồng thời cha/con).
- Sidebar: nhóm đầu **Tổng quan**.

## 2026-10-31 — Skeleton screen

- Primitive `Skeleton` + `AppShellSkeleton` / `DashboardSkeleton` / `CalendarSkeleton`.
- Hydrate (`VerticalGate`) và redirect `(main)/layout` không còn chữ «Đang tải…».
- Dashboard / bookings / FC dynamic: khung pulse thay `null` / «Đang tải lịch…».

## 2026-10-31 — Favicon

- Tab / bookmark: `favicon.ico` · `icon-192.png` · `icon-512.png` (mark Dolphin, cùng file CRM).
- `metadata.icons` trong `app/layout.tsx`.

## 2026-10-31 — Pages custom domain (bỏ `/crm-spa` prefix)

- Custom domain `crm-spa.dolphin-software.io.vn` phục vụ artifact ở **root**.
- Bỏ `GITHUB_PAGES_BASE_PATH=/crm-spa` trong workflow — HTML không còn trỏ `/crm-spa/_next/...` (404). CSS/JS: `/_next/static/...`.

## 2026-10-31 — CTA trắng · nav lễ tân · lịch gọn

- Primary CTA (`Button` default, header Đặt lịch / Gửi Zalo, nút FullCalendar): chữ **trắng** (`!text-white` / `#fff`) — không inherit `text-slate-900`.
- Sidebar desktop: thứ tự **Lịch hẹn → Khách → Chăm sóc → Zalo → Tổng quan → Marketing → Giữ chân → Báo cáo → Hệ thống**.
- `/bookings`: mặc định tuần + lọc Tất cả; toolbar một hàng (Ngày/Tuần/Tháng/KTV + ngày + lọc + Đặt lịch); tháng tối đa 3 event/ô (+N); title `HH:mm · Tên KH`; panel Ops chỉ khi chọn lịch hoặc đặt mới. `/menu` tab Vận hành gồm nhóm Zalo.

## 2026-10-31 — Shell desktop (POS + CRM)

- Sidebar: 260px, BrandMark, nhóm luôn mở, CN, footer user — bỏ accordion / breadcrumb.
- Header CTA: Đặt lịch · Gửi Zalo (primary) · Khách mới · Báo cáo (outline).

## 2026-10-31 — GitHub Pages (`nchithanh/crm-spa`)

- Nested repo `products/saas/crm-spa` → `https://github.com/nchithanh/crm-spa.git`
- Workflow `.github/workflows/deploy-pages.yml` · static export `GITHUB_PAGES=true` · `basePath=/crm-spa`
- `generateStaticParams` seed IDs cho customer / workflow / run / segment
- `documentations/deploy.md`

## 2026-10-31 — Pass 6–8: Campaign · Dashboard · Settings

- **Pass 6:** Campaign CRUD + launch mock · analytics · Zalo Center (composer/failed) · OA polish.
- **Pass 7:** Dashboard A–G từ selectors · packages · booking history/cancelled/rebooking · reports sub-pages.
- **Pass 8:** Activity log · Ops/POS toggle mock · notification prefs · bỏ `stub` nav đã đủ nghiệp vụ.

## 2026-10-31 — Pass 5: Automation

- List: filter status + search · **clone** · **xóa** · Activate/Pause (validate gate).
- Builder: banner validate gate · clone/xóa · runs gần đây · Run mock.
- Executions: filter status/workflow · detail hiện **input/output** từng bước.
- `ExecutionStep.input/output`; mock-runner điền I/O; store `cloneWorkflow` / `deleteWorkflow`.

## 2026-10-31 — Pass 4: Segment + Retention

- Segment builder: AND/OR · field `assigneeName` · gói active thật · preview live · xóa segment.
- Retention cohorts: VIP/loyal/at-risk/inactive/returning/rebooking/referrals + effectiveness.
- RFM thresholds cấu hình được (`localStorage`) — ghi rõ rule-based, không AI churn.

## 2026-10-31 — Pass 3: Care Center

- `CareTask` mở rộng: type · priority · description · result · cancelled.
- `/care` hub + `/tasks` (table/board, filter view) · drawer CRUD · `/tasks/mine`.
- `/care/interactions` · aftercare · birthdays · inactive · complaints · consultation · scripts.
- Store: `updateCareTask` · `cancelCareTask` · `completeTask(result)`; seed ~36 tasks Spa.

## 2026-10-31 — Pass 2: Customer core

- Directory: filter (status/tag/source/assignee/CN/lần ghé) · sort · pagination · bulk tag · Export CSV.
- 360 tabs: overview · lịch sử DV · lịch hẹn · care · tin nhắn · tư vấn · gói · timeline · profile ngành · thao tác (+ gán NV).
- `/customers/leads` · `tags` · `sources` · `duplicates` (merge confirm); seed `source` + vài SĐT trùng demo.
- Store: `bulkAddTags` · `assignCustomerStaff` · `mergeCustomers`; `lib/customer-utils.ts`.

## 2026-10-31 — Pass 1: IA 8 nhóm + foundation mock

- Sidebar collapsible 8 nhóm (`NAV_GROUPS`); topbar search/CN/noti; breadcrumb.
- ~40 route stub (`ModuleStub`) theo IA full product; giữ module cũ hoạt động.
- Spa seed **52 KH**; `lib/selectors.ts` + `mock-clock`; persist bundle localStorage.
- Settings: **Reset demo data**.
- Mobile `/menu` theo nhóm IA (Vận hành / Growth / Hệ thống).

## 2026-10-31 — fe/documentations + .cursor rule

- Tạo `fe/documentations/` (overview, pages, data, design, changelog).
- Rule `fe/.cursor/rules/fe-documentations.mdc`: mọi thay đổi FE phải sync docs cùng task.

## 2026-10-31 — Semantic colors (tách brand)

- Bỏ remap `emerald-*` → brand; brand chỉ chrome.
- Badge/stage/nợ semantic; `/finance` rose/green; calendar `confirmed` blue.

## 2026-10-31 — Dashboard charts + Menu page + logo dock

- `recharts` trên dashboard; `/menu` tile POS-like; bỏ hamburger/drawer.
- Dock Tổng quan = `BrandMark`.

## 2026-10-31 — Mobile bottom dock

- 5 CTA: Tổng quan · Khách · Lịch (giữa) · Việc · Menu.

## 2026-10-31 — Phase 2+3 mock ops

- Resources, shifts, conflict booking, aftercare, debts, reports DT, settings ca/quyền.

## 2026-10-31 — Phase 1 spa demo

- KTV board, packages, dashboard ca hôm nay, status booking mở rộng.

## 2026-10-31 — Bookings FC only

- Bỏ Leaflet/Map; panel Ops phải flex; Service Catalog `/services`.

## 2026-10-31 — Wave 2 + Wave 1

- Workflow canvas, segments, Zalo mock, tasks, scaffold Next 16.
