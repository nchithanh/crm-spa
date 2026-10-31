"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { formatVnd, uid } from "@/lib/utils";
import type { CatalogService, CatalogServiceKind } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";

const KIND_LABEL: Record<CatalogServiceKind, string> = {
  single: "Đơn",
  combo: "Combo",
  package: "Gói",
};

const emptyForm = (): CatalogService => ({
  id: "",
  name: "",
  category: "",
  description: "",
  durationMinutes: 60,
  priceVnd: 0,
  kind: "single",
  sessionCount: undefined,
  branchIds: [],
  technicianIds: [],
  active: true,
  seasonal: false,
});

export default function ServicesPage() {
  const bundle = useAppStore((s) => s.bundle);
  const upsertService = useAppStore((s) => s.upsertService);
  const toggleServiceActive = useAppStore((s) => s.toggleServiceActive);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "off">("all");
  const [editing, setEditing] = useState<CatalogService | null>(null);
  const [form, setForm] = useState<CatalogService>(emptyForm());
  const [panelOpen, setPanelOpen] = useState(false);

  const categories = useMemo(() => {
    if (!bundle) return [];
    return [...new Set(bundle.services.map((s) => s.category))].sort();
  }, [bundle]);

  const list = useMemo(() => {
    if (!bundle) return [];
    const needle = q.trim().toLowerCase();
    return bundle.services
      .filter((s) => (category === "all" ? true : s.category === category))
      .filter((s) =>
        status === "all"
          ? true
          : status === "active"
            ? s.active
            : !s.active,
      )
      .filter((s) => {
        if (!needle) return true;
        return (
          s.name.toLowerCase().includes(needle) ||
          s.category.toLowerCase().includes(needle) ||
          s.description.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [bundle, q, category, status]);

  if (!bundle) return null;

  const techs = bundle.team.filter((t) => t.role === "technician");

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setPanelOpen(true);
  }

  function openEdit(s: CatalogService) {
    setEditing(s);
    setForm({ ...s });
    setPanelOpen(true);
  }

  function save() {
    if (!form.name.trim() || !form.category.trim()) return;
    upsertService({
      ...form,
      id: form.id || uid("svc"),
      name: form.name.trim(),
      category: form.category.trim(),
      priceVnd: Number(form.priceVnd) || 0,
      durationMinutes: Number(form.durationMinutes) || 30,
    });
    setEditing(null);
    setForm(emptyForm());
    setPanelOpen(false);
  }

  function toggleId(
    field: "branchIds" | "technicianIds",
    id: string,
  ) {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [field]: [...set] };
    });
  }

  return (
    <div>
      <PageHeader
        title="Danh mục dịch vụ"
        description="Giá · thời lượng · combo · map KTV/CN — SoT Beauty CRM (không thay Ops booking)"
        actions={<Button onClick={openCreate}>Thêm dịch vụ</Button>}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tên / nhóm…"
          className="max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">Mọi nhóm</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(
          [
            ["all", "Tất cả"],
            ["active", "Đang bán"],
            ["off", "Tắt"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatus(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === id
                ? "bg-[var(--brand-500)] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div>
          {list.length === 0 ? (
            <EmptyState title="Chưa có dịch vụ khớp bộ lọc" />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {list.map((s) => {
                  const brNames =
                    s.branchIds.length === 0
                      ? "Mọi CN"
                      : s.branchIds
                          .map(
                            (id) =>
                              bundle.branches.find((b) => b.id === id)?.name ??
                              id,
                          )
                          .join(", ");
                  const techNames =
                    s.technicianIds.length === 0
                      ? "Mọi KTV"
                      : s.technicianIds
                          .map(
                            (id) =>
                              bundle.team.find((t) => t.id === id)?.name ?? id,
                          )
                          .join(", ");
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="flex w-full flex-col gap-2 px-4 py-3 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          {s.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.imageUrl}
                              alt=""
                              className="h-12 w-16 shrink-0 rounded-[10px] object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-[10px] text-slate-400">
                              No img
                            </div>
                          )}
                          <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {s.name}
                            </p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {KIND_LABEL[s.kind]}
                            </span>
                            {s.seasonal ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Mùa / KM
                              </span>
                            ) : null}
                            {!s.active ? (
                              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                Tắt
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-500">
                            {s.category} · {s.durationMinutes} phút · {brNames} ·{" "}
                            {techNames}
                          </p>
                          {s.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                              {s.description}
                            </p>
                          ) : null}
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                          {formatVnd(s.priceVnd)}
                          {s.sessionCount && s.sessionCount > 1
                            ? ` · ${s.sessionCount} buổi`
                            : ""}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <Card className="h-fit space-y-3 p-4">
          <h2 className="text-sm font-bold">
            {editing ? "Sửa dịch vụ" : "Thêm / chỉnh"}
          </h2>
          {!panelOpen ? (
            <p className="text-sm text-slate-500">
              Chọn một dòng hoặc bấm Thêm dịch vụ.
            </p>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-500">
                Tên
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Nhóm
                <Input
                  className="mt-1"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="VD: Chăm sóc da"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Mô tả
                <Input
                  className="mt-1"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-slate-500">
                  Phút
                  <Input
                    className="mt-1"
                    type="number"
                    min={5}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-500">
                  Giá (đ)
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.priceVnd}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceVnd: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-500">
                Loại
                <select
                  className="mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
                  value={form.kind}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      kind: e.target.value as CatalogServiceKind,
                    }))
                  }
                >
                  <option value="single">Đơn</option>
                  <option value="combo">Combo</option>
                  <option value="package">Gói liệu trình</option>
                </select>
              </label>
              {(form.kind === "combo" || form.kind === "package") && (
                <label className="block text-xs font-semibold text-slate-500">
                  Số buổi
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    value={form.sessionCount ?? 1}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sessionCount: Number(e.target.value) || 1,
                      }))
                    }
                  />
                </label>
              )}
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  Chi nhánh (trống = mọi CN)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bundle.branches.map((b) => {
                    const on = form.branchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleId("branchIds", b.id)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          on
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  KTV (trống = mọi KTV)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {techs.length === 0 ? (
                    <span className="text-xs text-slate-400">
                      Chưa có KTV trong team
                    </span>
                  ) : (
                    techs.map((t) => {
                      const on = form.technicianIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleId("technicianIds", t.id)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            on
                              ? "bg-[var(--brand-500)] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.seasonal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seasonal: e.target.checked }))
                  }
                />
                Mùa / khuyến mãi
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" onClick={save}>
                  Lưu
                </Button>
                {editing ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleServiceActive(editing.id)}
                  >
                    {editing.active ? "Tắt bán" : "Bật bán"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm());
                    setPanelOpen(false);
                  }}
                >
                  Huỷ
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
