"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { NAV_GROUPS, isNavActive, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function MobileMenuPage() {
  const pathname = usePathname();
  const router = useRouter();
  const bundle = useAppStore((s) => s.bundle);
  const clearVertical = useAppStore((s) => s.clearVertical);
  const [tab, setTab] = useState<"ops" | "growth" | "system">("ops");

  const openTasks =
    bundle?.tasks.filter((t) => t.status === "open").length ?? 0;
  const failedRuns =
    bundle?.runs.filter((r) => r.status === "failed").length ?? 0;

  const opsIds = new Set(["overview", "customers", "care", "ops"]);
  const growthIds = new Set(["marketing", "retention", "reports"]);
  const systemIds = new Set(["system"]);

  const groups =
    tab === "ops"
      ? NAV_GROUPS.filter((g) => opsIds.has(g.id))
      : tab === "growth"
        ? NAV_GROUPS.filter((g) => growthIds.has(g.id))
        : NAV_GROUPS.filter((g) => systemIds.has(g.id));

  const renderTile = (item: NavItem) => {
    const active = isNavActive(item.href, pathname);
    const Icon = item.icon;
    let badge = 0;
    if (item.badgeKey === "tasks" && openTasks > 0) badge = openTasks;
    if (item.badgeKey === "runs" && failedRuns > 0) badge = failedRuns;
    return (
      <Link
        key={item.href}
        href={item.href}
        className="group flex min-w-0 flex-col items-center gap-2"
      >
        <span
          className={cn(
            "relative inline-flex h-12 w-12 items-center justify-center rounded-[12px] transition",
            active
              ? "bg-[var(--brand-500)] text-white shadow-sm"
              : "bg-[var(--brand-50)] text-[var(--brand-600)] group-hover:bg-[var(--brand-100)]",
          )}
        >
          <Icon size={22} strokeWidth={1.75} />
          {badge > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-4 text-white tabular-nums">
              {badge > 99 ? "99" : badge}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "max-w-full text-center text-xs leading-tight font-medium",
            active ? "text-[var(--brand-600)]" : "text-slate-700",
          )}
        >
          {item.mobileLabel ?? item.label}
          {item.stub ? (
            <span className="mt-0.5 block text-[9px] font-normal text-slate-400">
              stub
            </span>
          ) : null}
        </span>
      </Link>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-500)] text-base font-bold text-white"
          aria-hidden
        >
          {(bundle?.currentUserName ?? "D").trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">
            {bundle?.currentUserName ?? "—"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {bundle?.orgName ?? "Dolphin Beauty CRM"} · {bundle?.label}
          </p>
        </div>
      </div>

      <div
        role="tablist"
        className="flex rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm"
      >
        {(
          [
            { id: "ops" as const, label: "Vận hành" },
            { id: "growth" as const, label: "Growth" },
            { id: "system" as const, label: "Hệ thống" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "h-10 flex-1 rounded-[10px] px-1 text-xs font-semibold sm:text-sm",
              tab === t.id
                ? "bg-[var(--brand-500)] text-white shadow-sm"
                : "text-slate-500 hover:bg-[var(--brand-50)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <section
            key={group.id}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
          >
            <h2 className="text-sm font-bold text-slate-800">{group.label}</h2>
            <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-5">
              {group.items.map((item) => renderTile(item))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <button
          type="button"
          onClick={() => {
            clearVertical();
            router.push("/chon-linh-vuc");
          }}
          className="flex w-full items-center gap-3 rounded-[10px] px-2 py-3 text-left hover:bg-[var(--brand-50)]"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--brand-50)] text-[var(--brand-600)]">
            <Shuffle size={20} strokeWidth={1.75} />
          </span>
          <span className="text-sm font-semibold">Đổi lĩnh vực</span>
        </button>
      </section>
    </div>
  );
}
