# Routes — Beauty CRM FE

SoT: `lib/nav.ts` (`NAV_GROUPS`, `MOBILE_DOCK`).

## Entry

| Path | Ghi chú |
| --- | --- |
| `/chon-linh-vuc` | Chọn Spa / Nails / Salon |
| `/menu` | Menu mobile (tile theo nhóm IA) |

## Đã có nghiệp vụ mock

`/` (Dashboard A–G) · Customer Directory + 360 · Care · Segments · Retention · Automations · Campaigns · Zalo Center · Bookings (+ history / cancelled / rebooking) · Packages · Services · Reports (+ sub) · Finance stub · Settings (+ activity / Ops / POS / notifications / reset)

## Care (Pass 3)

`/care` · `/tasks` · `/tasks/mine` · `/care/interactions` · `aftercare` · `birthdays` · `inactive` · `complaints` · `consultation` · `scripts`

## Segment + Retention (Pass 4)

`/segments*` · `/retention/vip|loyal|at-risk|inactive|returning|rebooking|referrals|effectiveness`

## Automations (Pass 5)

`/automations` · `/automations/[id]` · `/automations/runs` · `/automations/runs/[runId]`

## Campaign + Zalo (Pass 6)

`/campaigns` · `/campaigns/analytics` · `/communication` · `templates` · `history` · `/settings/zalo`

## Ops / Reports (Pass 7)

`/packages` · `/bookings/history` · `cancelled` · `rebooking` · `/reports/*`

## Settings (Pass 8)

`/settings/activity` · `integrations/ops` · `integrations/pos` · `notifications`

## Tổng quan phụ (Pass 8)

`/insights` · `/today` · `/alerts` — selectors, không còn ModuleStub.

## Shell

- Desktop: sidebar 260px · BrandMark · nhóm luôn mở (**Tổng quan** đầu → Lịch → Khách → Chăm sóc → Zalo → Marketing → Giữ chân → Báo cáo → Hệ thống) · CN · user footer (POS-like). Một mục nav active (`isNavActive` khớp href dài nhất).
- Header: search · CTA primary chữ trắng Đặt lịch / Gửi Zalo · outline Khách mới / Báo cáo · chuông.
- `/bookings`: toolbar gộp · mặc định tuần · Ops panel khi chọn / đặt mới.
- Loading: `AppShellSkeleton` khi hydrate/redirect; dashboard / lịch dùng khung pulse (`components/ui/skeleton.tsx`).
- Mobile dock: Tổng quan (logo) · Khách · Lịch · Việc · Menu. `/menu` Vận hành gồm nhóm Zalo.
