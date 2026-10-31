"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Bell, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MobileBottomDock } from "@/components/layout/mobile-bottom-dock";
import { PersistBridge } from "@/components/layout/persist-bridge";
import { Button } from "@/components/ui/button";
import {
  NAV_GROUPS,
  SwitchVerticalIcon,
  findNavGroupId,
  findNavLabel,
  isNavActive,
} from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const bundle = useAppStore((s) => s.bundle);
  const clearVertical = useAppStore((s) => s.clearVertical);

  const openTasks =
    bundle?.tasks.filter((t) => t.status === "open").length ?? 0;
  const failedRuns =
    bundle?.runs.filter((r) => r.status === "failed").length ?? 0;

  const activeGroup = findNavGroupId(pathname);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeGroup) return;
    setOpenGroups((prev) =>
      prev[activeGroup] ? prev : { ...prev, [activeGroup]: true },
    );
  }, [activeGroup]);

  const [branchId, setBranchId] = useState<string>("all");
  useEffect(() => {
    if (bundle?.branches[0] && branchId === "all") {
      /* keep all as default */
    }
  }, [bundle, branchId]);

  const pageTitle = useMemo(() => findNavLabel(pathname), [pathname]);

  const badgeFor = (key?: "tasks" | "runs") => {
    if (key === "tasks" && openTasks > 0) return openTasks;
    if (key === "runs" && failedRuns > 0) return failedRuns;
    return null;
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_GROUPS.map((group) => {
        const expanded = openGroups[group.id] ?? group.id === "overview";
        return (
          <div key={group.id} className="mb-1">
            <button
              type="button"
              onClick={() =>
                setOpenGroups((p) => ({
                  ...p,
                  [group.id]: !expanded,
                }))
              }
              className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:bg-slate-50"
            >
              {group.label}
              <ChevronDown
                size={14}
                className={cn(
                  "transition text-slate-400",
                  expanded && "rotate-180",
                )}
              />
            </button>
            {expanded ? (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(item.href, pathname);
                  const Icon = item.icon;
                  const badge = badgeFor(item.badgeKey);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium",
                        active
                          ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {active ? (
                        <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-[var(--brand-500)]" />
                      ) : null}
                      <Icon
                        size={15}
                        className={
                          active ? "text-[var(--brand-600)]" : "text-slate-400"
                        }
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                        {item.stub ? (
                          <span className="ml-1 text-[9px] font-normal text-slate-400">
                            stub
                          </span>
                        ) : null}
                      </span>
                      {badge ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-500)] px-1.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh bg-[var(--background)] text-slate-900">
      <PersistBridge />
      <div className="flex min-h-svh w-full">
        <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-wide text-[var(--brand-600)] uppercase">
              Dolphin Beauty CRM
            </p>
            <p className="mt-0.5 truncate text-sm font-bold leading-tight">
              {bundle?.orgName ?? "—"}
            </p>
            <p className="text-[11px] text-slate-500">
              {bundle?.label} · {bundle?.currentUserName}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <div className="border-t border-slate-200 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                clearVertical();
                router.push("/chon-linh-vuc");
              }}
            >
              <SwitchVerticalIcon size={14} />
              Đổi lĩnh vực
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-2.5 lg:px-5">
              <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm">
                <Search
                  size={14}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Tìm khách, mã, SĐT…"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm outline-none focus:border-[var(--brand-500)] focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = (e.target as HTMLInputElement).value.trim();
                      router.push(
                        q
                          ? `/customers?q=${encodeURIComponent(q)}`
                          : "/customers",
                      );
                    }
                  }}
                />
              </div>
              <div className="min-w-0 flex-1 md:flex-none">
                <p className="truncate text-sm font-semibold lg:hidden">
                  {bundle?.orgName}
                </p>
                <p className="hidden text-xs text-slate-500 lg:block">
                  {pageTitle}
                </p>
              </div>
              {bundle?.branches?.length ? (
                <select
                  className="hidden h-9 max-w-[10rem] rounded-xl border border-slate-200 bg-white px-2 text-xs font-medium sm:block"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  aria-label="Chi nhánh"
                >
                  <option value="all">Tất cả CN</option>
                  {bundle.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : null}
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                aria-label="Thông báo (mock)"
                title="Thông báo — stub"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </button>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  bundle?.zaloConnected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700",
                )}
              >
                Zalo {bundle?.zaloConnected ? "OK" : "Off"}
              </span>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-1.5 text-[11px] text-slate-500 lg:px-5"
            >
              <Link href="/" className="hover:text-[var(--brand-600)]">
                Tổng quan
              </Link>
              {pathname !== "/" ? (
                <>
                  <span aria-hidden>/</span>
                  <span className="font-medium text-slate-800">{pageTitle}</span>
                </>
              ) : null}
            </nav>
          </header>

          <main className="flex-1 px-4 py-4 max-lg:pb-[calc(6.75rem+max(0.625rem,env(safe-area-inset-bottom)))] sm:px-5 sm:py-5 lg:pb-5">
            {children}
          </main>
        </div>
      </div>

      <MobileBottomDock tasksBadge={openTasks} />
    </div>
  );
}
