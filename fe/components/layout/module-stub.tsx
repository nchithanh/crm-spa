"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

/** Pass 1 placeholder — route đã vào IA, nghiệp vụ đầy đủ ở phase sau */
export function ModuleStub({
  title,
  description,
  phaseHint = "Pass sau (Care / Retention / Campaign…)",
}: {
  title: string;
  description: string;
  phaseHint?: string;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={`${description} · Mock FE · chưa Backend`}
      />
      <EmptyState
        title="Module đang mở rộng"
        description={`Màn hình đã có trong menu IA. ${phaseHint}. Dữ liệu sẽ lấy từ cùng mock dataset (không hardcode KPI rời).`}
      />
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold hover:bg-slate-50"
        >
          Về Dashboard
        </Link>
        <Link
          href="/customers"
          className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          Danh sách khách
        </Link>
      </div>
    </div>
  );
}
