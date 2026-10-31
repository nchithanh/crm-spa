"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BookingForm } from "@/components/bookings/booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PROFILE_LABELS } from "@/data/seed";
import { daysSince, upcomingForCustomer } from "@/lib/metrics";
import { buildCustomerTimeline } from "@/lib/timeline";
import { formatDate, formatDateTime, formatVnd } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const bundle = useAppStore((s) => s.bundle);
  const addCustomerNote = useAppStore((s) => s.addCustomerNote);
  const setCustomerTags = useAppStore((s) => s.setCustomerTags);
  const createCareTask = useAppStore((s) => s.createCareTask);
  const sellPackage = useAppStore((s) => s.sellPackage);
  const assignCustomerStaff = useAppStore((s) => s.assignCustomerStaff);
  const [note, setNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [sellSvcId, setSellSvcId] = useState("");
  const [flash, setFlash] = useState("");
  const [tab, setTab] = useState<
    | "overview"
    | "history"
    | "bookings"
    | "care"
    | "messages"
    | "consultation"
    | "packages"
    | "timeline"
    | "profile"
    | "actions"
  >("overview");

  const customer = bundle?.customers.find((c) => c.id === params.id);
  const timeline = useMemo(() => {
    if (!bundle || !customer) return [];
    return buildCustomerTimeline(bundle, customer.id);
  }, [bundle, customer]);

  if (!bundle) return null;
  if (!customer) {
    return (
      <Card className="p-6 text-sm text-slate-500">
        Không tìm thấy khách.{" "}
        <Link href="/customers" className="font-semibold text-[var(--brand-600)]">
          Quay lại
        </Link>
      </Card>
    );
  }

  const branch = bundle.branches.find((b) => b.id === customer.branchId);
  const labels = PROFILE_LABELS[bundle.id];
  const upcoming = upcomingForCustomer(bundle.bookings, customer.id);
  const history = bundle.bookings
    .filter((b) => b.customerId === customer.id)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  const pkgs = bundle.packages.filter((p) => p.customerId === customer.id);
  const packageServices = bundle.services.filter(
    (s) => s.kind === "package" || s.kind === "combo",
  );
  const careTasks = bundle.tasks
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => b.dueAt.localeCompare(a.dueAt));
  const messages = bundle.messages
    .filter((m) => m.customerId === customer.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const staffNotes = bundle.notes
    .filter((n) => n.customerId === customer.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const staffNames = [
    ...new Set([
      ...bundle.team.map((t) => t.name),
      bundle.currentUserName,
      ...bundle.customers.map((c) => c.assigneeName).filter(Boolean),
    ]),
  ];
  const upcomingBookings = history.filter((b) =>
    ["upcoming", "confirmed", "in_service"].includes(b.status),
  );
  const completedHistory = history.filter((b) => b.status === "completed");
  const avgDays =
    customer.completedServiceCount >= 2
      ? Math.round(
          daysSince(customer.firstVisitAt) /
            Math.max(customer.completedServiceCount - 1, 1),
        )
      : null;

  const initials = customer.fullName
    .split(" ")
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <PageHeader
        title={customer.fullName}
        description={`${customer.code} · ${customer.phone} · ${branch?.name ?? "—"}`}
        actions={
          <>
            <Button size="sm" onClick={() => setTab("actions")}>
              Đặt lịch
            </Button>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button size="sm" variant="secondary">
                Sửa hồ sơ
              </Button>
            </Link>
            <Link href={`/communication?customerId=${customer.id}`}>
              <Button size="sm" variant="outline">
                Zalo
              </Button>
            </Link>
          </>
        }
      />
      {flash ? (
        <Card className="border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {flash}
        </Card>
      ) : null}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-50)] text-sm font-bold text-[var(--brand-700)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={customer.status} />
            <Badge
              status={customer.consentZalo ? "active" : "inactive"}
              label={customer.consentZalo ? "Consent Zalo" : "Không consent"}
            />
            <Badge
              status={customer.zaloUid ? "connected" : "disconnected"}
              label={customer.zaloUid ? "Có UID" : "Chỉ SĐT"}
            />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Phụ trách <strong>{customer.assigneeName || "—"}</strong>
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {customer.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {(
          [
            ["overview", "Tổng quan"],
            ["history", "Lịch sử DV"],
            ["bookings", "Lịch hẹn"],
            ["care", "Chăm sóc"],
            ["messages", "Tin nhắn"],
            ["consultation", "Nhật ký tư vấn"],
            ["packages", "Gói liệu trình"],
            ["timeline", "Timeline"],
            ["profile", `Hồ sơ ${bundle.label}`],
            ["actions", "Thao tác"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === id
                ? "bg-[var(--brand-500)] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Lần đầu" value={formatDate(customer.firstVisitAt)} />
          <Metric label="Lần gần nhất" value={formatDate(customer.lastVisitAt)} />
          <Metric label="Số lần DV" value={String(customer.completedServiceCount)} />
          <Metric
            label="Tần suất TB"
            value={
              avgDays != null ? `${avgDays} ngày/lần` : "Không đủ dữ liệu"
            }
          />
          <Metric
            label="Chi tiêu"
            value={
              bundle.posConnected
                ? formatVnd(customer.totalSpend)
                : "Ẩn — chưa POS"
            }
          />
          <Metric
            label="Lịch sắp tới"
            value={
              upcoming
                ? `${upcoming.serviceName} · ${formatDateTime(upcoming.scheduledAt)}`
                : "Không có"
            }
          />
          <Metric label="Email" value={customer.email || "—"} />
          <Metric label="Sinh nhật" value={formatDate(customer.birthday)} />
          <Metric
            label="Gói đang chạy"
            value={
              pkgs.filter((p) => p.status === "active").length
                ? `${pkgs.filter((p) => p.status === "active").length} gói`
                : "Không có"
            }
          />
          <Metric
            label="Buổi gói còn"
            value={String(
              pkgs
                .filter((p) => p.status === "active")
                .reduce((s, p) => s + p.remainingSessions, 0),
            )}
          />
          <Metric
            label="Nguồn khách"
            value={
              (
                {
                  zalo: "Zalo",
                  walk_in: "Walk-in",
                  referral: "Giới thiệu",
                  facebook: "Facebook",
                  web: "Website",
                  other: "Khác",
                } as Record<string, string>
              )[customer.source ?? "other"] ?? "—"
            }
          />
          <Metric
            label="Công nợ"
            value={
              customer.debtVnd && customer.debtVnd > 0
                ? formatVnd(customer.debtVnd)
                : "Không nợ"
            }
          />
        </div>
      ) : null}

      {tab === "history" ? (
        <BookingList
          empty="Chưa có dịch vụ hoàn thành."
          rows={completedHistory}
          bundle={bundle}
        />
      ) : null}

      {tab === "bookings" ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Sắp tới
          </h3>
          <BookingList
            empty="Không có lịch sắp tới."
            rows={upcomingBookings}
            bundle={bundle}
          />
          <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Toàn bộ
          </h3>
          <BookingList empty="Chưa có booking." rows={history} bundle={bundle} />
        </div>
      ) : null}

      {tab === "care" ? (
        <Card className="overflow-hidden">
          {careTasks.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Chưa có care task.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {careTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      Hạn {formatDateTime(t.dueAt)} · {t.assigneeName} ·{" "}
                      {t.source}
                    </p>
                  </div>
                  <Badge status={t.status === "done" ? "done" : "open"} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === "messages" ? (
        <Card className="overflow-hidden">
          {messages.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Chưa có tin Zalo mock.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {messages.map((m) => {
                const tpl = bundle.templates.find((t) => t.id === m.templateId);
                return (
                  <li
                    key={m.id}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {tpl?.name ?? m.templateId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(m.sentAt)}
                        {m.error ? ` · ${m.error}` : ""}
                      </p>
                    </div>
                    <Badge status={m.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === "consultation" ? (
        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold">Ghi chú tư vấn (profile)</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {customer.profile.consultationNotes ||
                customer.notes ||
                "Chưa có nhật ký tư vấn."}
            </p>
          </Card>
          <Card className="overflow-hidden">
            <h3 className="border-b border-slate-100 px-4 py-2 text-sm font-bold">
              Staff notes
            </h3>
            {staffNotes.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Chưa có note.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {staffNotes.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <p className="text-[11px] text-slate-400">
                      {n.authorName} · {formatDateTime(n.createdAt)}
                    </p>
                    <p className="text-sm">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      {tab === "packages" ? (
        <div className="space-y-3">
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-bold">Bán gói / combo</h3>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
              value={sellSvcId}
              onChange={(e) => setSellSvcId(e.target.value)}
            >
              <option value="">Chọn gói từ catalog…</option>
              {packageServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.sessionCount ?? "?"} buổi ·{" "}
                  {formatVnd(s.priceVnd)}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                if (!sellSvcId) return;
                const id = sellPackage({
                  customerId: customer.id,
                  serviceId: sellSvcId,
                });
                if (id) {
                  setFlash("Đã bán gói (mock thanh toán đủ).");
                  setSellSvcId("");
                }
              }}
            >
              Bán gói
            </Button>
          </Card>
          {pkgs.length === 0 ? (
            <Card className="p-4 text-sm text-slate-500">
              Chưa có gói liệu trình.
            </Card>
          ) : (
            pkgs.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.serviceName}</p>
                    <p className="text-xs text-slate-500">
                      Mua {formatDate(p.purchasedAt)} · HSD{" "}
                      {formatDate(p.expiresAt)} · {formatVnd(p.paidVnd)}
                    </p>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>
                      Còn {p.remainingSessions}/{p.totalSessions} buổi
                    </span>
                    <span>
                      {Math.round(
                        (p.remainingSessions / Math.max(p.totalSessions, 1)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[var(--brand-500)]"
                      style={{
                        width: `${(p.remainingSessions / Math.max(p.totalSessions, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {tab === "timeline" ? (
        <Card className="p-4">
          <ol className="space-y-3 border-l border-slate-200 pl-4">
            {timeline.slice(0, 40).map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute top-1.5 -left-[1.35rem] h-2 w-2 rounded-full bg-[var(--brand-500)]" />
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  {item.kind} · {formatDateTime(item.at)}
                </p>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </li>
            ))}
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có hoạt động.</p>
            ) : null}
          </ol>
        </Card>
      ) : null}

      {tab === "profile" ? (
        <Card className="grid gap-3 p-4 sm:grid-cols-2">
          {Object.entries(customer.profile).map(([key, value]) => (
            <div key={key} className="rounded-[10px] bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">
                {labels[key] ?? key}
              </p>
              <p className="text-sm font-medium">{value || "—"}</p>
            </div>
          ))}
        </Card>
      ) : null}

      {tab === "actions" ? (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="space-y-2 p-4 lg:col-span-2 xl:col-span-1">
            <h3 className="text-sm font-bold">Đặt lịch nhanh</h3>
            <BookingForm
              defaultCustomerId={customer.id}
              onDone={() => {
                setFlash("Đã đặt lịch từ catalog.");
                setTab("history");
              }}
            />
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-bold">Thêm ghi chú</h3>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nội dung ghi chú"
            />
            <Button
              size="sm"
              onClick={() => {
                addCustomerNote(customer.id, note);
                setNote("");
              }}
            >
              Lưu ghi chú
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-bold">Gắn tag</h3>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="tag1, tag2"
            />
            <Button
              size="sm"
              onClick={() => {
                const next = [
                  ...new Set([
                    ...customer.tags,
                    ...tagInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  ]),
                ];
                setCustomerTags(customer.id, next);
                setTagInput("");
              }}
            >
              Cập nhật tags
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-bold">Tạo care task</h3>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Tiêu đề việc"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!taskTitle.trim()) return;
                createCareTask({
                  customerId: customer.id,
                  title: taskTitle.trim(),
                  dueAt: new Date(Date.now() + 86400000).toISOString(),
                  assigneeName:
                    customer.assigneeName || bundle.currentUserName,
                });
                setTaskTitle("");
                setTab("care");
              }}
            >
              Tạo task
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-bold">Gán nhân viên</h3>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
              value={customer.assigneeName}
              onChange={(e) => {
                assignCustomerStaff(customer.id, e.target.value);
                setFlash(`Đã gán ${e.target.value}`);
              }}
            >
              {staffNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </Card>
  );
}

function BookingList({
  rows,
  empty,
  bundle,
}: {
  rows: import("@/lib/types").Booking[];
  empty: string;
  bundle: import("@/lib/types").VerticalBundle;
}) {
  if (rows.length === 0) {
    return <Card className="p-4 text-sm text-slate-500">{empty}</Card>;
  }
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-slate-100">
        {rows.slice(0, 40).map((b) => {
          const tech = bundle.team.find((t) => t.id === b.technicianId);
          const br = bundle.branches.find((x) => x.id === b.branchId);
          return (
            <li
              key={b.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{b.serviceName}</p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(b.scheduledAt)}
                  {tech ? ` · ${tech.name}` : ""}
                  {br ? ` · ${br.name}` : ""}
                  {b.durationMinutes ? ` · ${b.durationMinutes}′` : ""}
                </p>
              </div>
              <Badge status={b.status} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
