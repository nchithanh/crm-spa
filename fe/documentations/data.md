# Data — Beauty CRM FE

## Seed

| Path | Vai trò |
| --- | --- |
| `data/spa-dataset.ts` | Dolphin Glow Spa · **≥52 customers** + tasks/bookings/packages/workflows |
| `data/seed.ts` | Nails/Salon thin + `getVerticalBundle` |
| `data/service-catalog.ts` · `year-bookings.ts` · `ops-extras.ts` · `enrich.ts` | Catalog, bookings năm, resources/shifts/debts |

## Retention / RFM

`lib/retention.ts` — ngưỡng demo `loadRfmThresholds` / `saveRfmThresholds` (localStorage).  
Rules: VIP · loyal · at-risk · inactive · returning · rebooking opportunities · effectiveness KPIs.

## Automation / workflow

`lib/workflow-graph.ts` · `workflow-validate.ts` · `mock-runner.ts` — 7 node MVP; execution snapshot version; step **input/output** (mock).  
Store: `createWorkflowDraft` · `cloneWorkflow` · `deleteWorkflow` · `saveWorkflowGraph` · `setWorkflowStatus` · `runWorkflow`.

## Campaign + Zalo

`Campaign` / `ActivityLogEntry` trong `lib/types.ts`. Seed Spa 5 campaigns.  
`lib/campaign-utils.ts` · store: `upsertCampaign` · `deleteCampaign` · `launchCampaign` · `sendZaloMessage` · `toggleZalo` · `togglePos` · `toggleOps` · `pushActivity`.  
Bundle: `campaigns` · `activityLog` · `opsConnected`.

## Segment eval

`lib/segment-eval.ts` — AND/OR · packages active · `assigneeName`. Store: `deleteSegment`.

## Care

`lib/care-utils.ts` — filter views · type/priority labels · dashboard stats · interaction feed · birthday/inactive rules (demo, không AI).

`CareTask`: type (`follow_up` | `post_service` | `birthday` | `rebooking` | `consultation` | `complaint` | `general`) · priority · description · resultNote · status incl. `cancelled`.

## Customer helpers

`lib/customer-utils.ts` — filter/sort/export CSV · tags/assignees · duplicate groups · leads · `SOURCE_LABELS`.

Store: `bulkAddTags` · `assignCustomerStaff` · `mergeCustomers` (rehome bookings/tasks/notes/messages/packages/runs/debts).

## Selectors (bắt buộc dùng cho KPI)

`lib/selectors.ts`:

- `getCustomerStats` · `getReturningCustomers` · `getInactiveCustomers` · `getAtRiskCustomers`
- `getUpcomingBookings` · `getOverdueTasks` · `getCareTasksByStaff` · `getTodayCareQueue`
- `getBirthdayOpportunities` · `getLowPackages` · `getWorkflowStats`

Underlying: `lib/metrics.ts`.

## Persistence

| Key | Nội dung |
| --- | --- |
| `dolphin-beauty-crm-vertical` | `spa` \| `nails` \| `salon` |
| `dolphin-beauty-crm-bundle:{id}` | JSON `VerticalBundle` sau khi user thao tác |

- `PersistBridge` ghi khi bundle đổi.
- **Reset demo** (`resetDemoData` trong store + nút `/settings`): xóa bundle key, nạp lại seed.

## Clock

`lib/mock-clock.ts` — `MOCK_DATA_VERSION`, `daysFromNow`, `startOfDay`.
