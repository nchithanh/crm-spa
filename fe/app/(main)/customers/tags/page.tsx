"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { collectAllTags } from "@/lib/customer-utils";
import { useAppStore } from "@/stores/app-store";

export default function CustomerTagsPage() {
  const bundle = useAppStore((s) => s.bundle);
  const setCustomerTags = useAppStore((s) => s.setCustomerTags);
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setNews] = useState("");

  const stats = useMemo(() => {
    if (!bundle) return [];
    const tags = collectAllTags(bundle.customers);
    return tags.map((t) => ({
      tag: t,
      count: bundle.customers.filter((c) => c.tags.includes(t)).length,
    }));
  }, [bundle]);

  if (!bundle) return null;

  const applyRename = () => {
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!from || !to || from === to) return;
    for (const c of bundle.customers) {
      if (!c.tags.includes(from)) continue;
      const next = [...new Set(c.tags.map((t) => (t === from ? to : t)))];
      setCustomerTags(c.id, next);
    }
    setRenameFrom("");
    setNews("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tags & phân loại"
        description="Tag dùng chung toàn bộ Customer Directory · thao tác mock local"
        actions={
          <Link href="/customers">
            <Button variant="outline">Danh sách KH</Button>
          </Link>
        }
      />

      <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-[10px] font-bold text-slate-400 uppercase">
          Đổi tên tag
          <Input
            className="mt-1"
            value={renameFrom}
            onChange={(e) => setRenameFrom(e.target.value)}
            placeholder="Tag cũ"
            list="all-tags"
          />
        </label>
        <label className="flex-1 text-[10px] font-bold text-slate-400 uppercase">
          Thành
          <Input
            className="mt-1"
            value={renameTo}
            onChange={(e) => setNews(e.target.value)}
            placeholder="Tag mới"
          />
        </label>
        <datalist id="all-tags">
          {stats.map((s) => (
            <option key={s.tag} value={s.tag} />
          ))}
        </datalist>
        <Button onClick={applyRename}>Áp dụng</Button>
      </Card>

      {stats.length === 0 ? (
        <EmptyState title="Chưa có tag" description="Gắn tag từ Customer 360 hoặc bulk tag." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Link key={s.tag} href={`/customers?q=${encodeURIComponent(s.tag)}`}>
              <Card className="flex items-center justify-between p-4 transition hover:border-brand">
                <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-sm font-semibold text-[var(--brand-700)]">
                  {s.tag}
                </span>
                <span className="text-sm font-bold tabular-nums text-slate-700">
                  {s.count} KH
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
