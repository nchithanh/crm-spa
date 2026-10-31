"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  SOURCE_LABELS,
  collectAllTags,
  collectAssignees,
  downloadTextFile,
  exportCustomersCsv,
  filterCustomers,
  sortCustomers,
  type CustomerSortKey,
} from "@/lib/customer-utils";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const PAGE_SIZE = 15;

export default function CustomersPage() {
  const bundle = useAppStore((s) => s.bundle);
  const bulkAddTags = useAppStore((s) => s.bulkAddTags);
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("all");
  const [source, setSource] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [branchId, setBranchId] = useState("all");
  const [lastVisitBucket, setLastVisitBucket] = useState("all");
  const [sortKey, setSortKey] = useState<CustomerSortKey>("lastVisit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTag, setBulkTag] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl) setQ(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [q, status, tag, source, assignee, branchId, lastVisitBucket, sortKey, sortDir]);

  const tags = useMemo(
    () => (bundle ? collectAllTags(bundle.customers) : []),
    [bundle],
  );
  const assignees = useMemo(
    () => (bundle ? collectAssignees(bundle.customers) : []),
    [bundle],
  );

  const filtered = useMemo(() => {
    if (!bundle) return [];
    const rows = filterCustomers(bundle.customers, {
      q,
      status,
      tag,
      source,
      assignee,
      branchId,
      lastVisitBucket,
    });
    return sortCustomers(rows, sortKey, sortDir);
  }, [
    bundle,
    q,
    status,
    tag,
    source,
    assignee,
    branchId,
    lastVisitBucket,
    sortKey,
    sortDir,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: CustomerSortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "code" ? "asc" : "desc");
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    const ids = pageRows.map((c) => c.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách khách hàng"
        description={`${bundle.label} · ${filtered.length}/${bundle.customers.length} khớp bộ lọc`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                downloadTextFile(
                  `customers-${bundle.id}.csv`,
                  exportCustomersCsv(filtered, bundle),
                )
              }
            >
              Export CSV
            </Button>
            <Link href="/customers/import">
              <Button variant="outline">Import</Button>
            </Link>
            <Link href="/customers/duplicates">
              <Button variant="secondary">Trùng lặp</Button>
            </Link>
            <Link href="/customers/new">
              <Button>Thêm khách</Button>
            </Link>
          </>
        }
      />

      <Card className="space-y-3 p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            placeholder="Tìm tên, SĐT, mã, tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Tất cả"],
              ["active", "Active"],
              ["vip", "VIP"],
              ["inactive", "Ngưng"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  status === value
                    ? "bg-[var(--brand-500)] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Tag"
            value={tag}
            onChange={setTag}
            options={[
              ["all", "Mọi tag"],
              ...tags.map((t) => [t, t] as [string, string]),
            ]}
          />
          <Select
            label="Nguồn"
            value={source}
            onChange={setSource}
            options={[
              ["all", "Mọi nguồn"],
              ...Object.entries(SOURCE_LABELS).map(
                ([k, v]) => [k, v] as [string, string],
              ),
            ]}
          />
          <Select
            label="Phụ trách"
            value={assignee}
            onChange={setAssignee}
            options={[
              ["all", "Mọi NV"],
              ...assignees.map((a) => [a, a] as [string, string]),
            ]}
          />
          <Select
            label="Chi nhánh"
            value={branchId}
            onChange={setBranchId}
            options={[
              ["all", "Mọi CN"],
              ...bundle.branches.map(
                (b) => [b.id, b.name] as [string, string],
              ),
            ]}
          />
          <Select
            label="Lần ghé"
            value={lastVisitBucket}
            onChange={setLastVisitBucket}
            options={[
              ["all", "Mọi lúc"],
              ["7", "≤ 7 ngày"],
              ["30", "8–30 ngày"],
              ["60", "31–60 ngày"],
              ["90+", "> 60 ngày"],
            ]}
          />
        </div>
      </Card>

      {selected.size > 0 ? (
        <Card className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold">
            Đã chọn {selected.size} khách
          </p>
          <Input
            placeholder="Thêm tag (cách nhau dấu phẩy)"
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value)}
            className="sm:max-w-xs"
          />
          <Button
            size="sm"
            onClick={() => {
              const tagsToAdd = bulkTag
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              if (!tagsToAdd.length) return;
              bulkAddTags([...selected], tagsToAdd);
              setBulkTag("");
              setSelected(new Set());
            }}
          >
            Bulk tag
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Bỏ chọn
          </Button>
        </Card>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Không có khách phù hợp"
          description="Thử đổi bộ lọc hoặc thêm khách mới."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2rem_2.5rem_minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 md:grid">
            <div>
              <input
                type="checkbox"
                checked={
                  pageRows.length > 0 &&
                  pageRows.every((c) => selected.has(c.id))
                }
                onChange={togglePage}
                aria-label="Chọn trang"
              />
            </div>
            <div />
            <SortBtn label="Khách" active={sortKey === "name"} onClick={() => toggleSort("name")} />
            <SortBtn label="TT" active={sortKey === "code"} onClick={() => toggleSort("code")} />
            <div>Tags</div>
            <SortBtn label="Lần ghé" active={sortKey === "lastVisit"} onClick={() => toggleSort("lastVisit")} />
            <SortBtn label="DV" active={sortKey === "visits"} onClick={() => toggleSort("visits")} />
            <div>Phụ trách</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {pageRows.map((c) => {
              const initials = c.fullName
                .split(" ")
                .slice(-2)
                .map((p) => p[0])
                .join("")
                .toUpperCase();
              return (
                <li key={c.id} className="flex items-start gap-2 px-3 py-3 hover:bg-slate-50 md:grid md:grid-cols-[2rem_2.5rem_minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 md:mt-0"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    aria-label={`Chọn ${c.fullName}`}
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-50)] text-[10px] font-bold text-[var(--brand-700)]">
                    {initials}
                  </div>
                  <Link href={`/customers/${c.id}`} className="min-w-0 flex-1 md:contents">
                    <div className="min-w-0 md:col-auto">
                      <p className="truncate font-semibold">{c.fullName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {c.code} · {c.phone}
                      </p>
                    </div>
                    <div className="mt-1 md:mt-0">
                      <Badge status={c.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 md:mt-0">
                      {c.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 text-sm text-slate-600 md:mt-0">
                      {formatDate(c.lastVisitAt)}
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {c.completedServiceCount} lần
                    </div>
                    <div className="text-sm text-slate-600">
                      {c.assigneeName || "—"}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
            <p className="text-xs text-slate-500">
              Trang {page}/{pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block text-[10px] font-bold tracking-wide text-slate-400 uppercase">
      {label}
      <select
        className="mt-1 h-9 w-full rounded-[10px] border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left ${active ? "text-[var(--brand-700)]" : ""}`}
    >
      {label}
      {active ? " ↕" : ""}
    </button>
  );
}
