"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  MessageSquare,
  Search,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { MobileBottomDock } from "@/components/layout/mobile-bottom-dock";
import { PersistBridge } from "@/components/layout/persist-bridge";
import { Button } from "@/components/ui/button";
import {
  NAV_GROUPS,
  SwitchVerticalIcon,
  isNavActive,
} from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const ctaPrimary =
  "inline-flex h-10 min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-500)] px-3.5 text-sm font-semibold !text-white hover:bg-[var(--brand-600)] hover:!text-white";
const ctaOutline =
  "inline-flex h-10 min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-300)] bg-white px-3.5 text-sm font-semibold !text-[var(--brand-600)] hover:bg-[var(--brand-50)] hover:!text-[var(--brand-600)]";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const bundle = useAppStore((s) => s.bundle);
  const clearVertical = useAppStore((s) => s.clearVertical);

  const openTasks =
    bundle?.tasks.filter((t) => t.status === "open").length ?? 0;
  const failedRuns =
    bundle?.runs.filter((r) => r.status === "failed").length ?? 0;

  const [branchId, setBranchId] = useState("all");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.sessionStorage.getItem("beauty-branch");
    if (saved) setBranchId(saved);
  }, []);

  const badgeFor = (key?: "tasks" | "runs") => {
    if (key === "tasks" && openTasks > 0) return openTasks;
    if (key === "runs" && failedRuns > 0) return failedRuns;
    return null;
  };

  const setBranch = (id: string) => {
    setBranchId(id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("beauty-branch", id);
    }
  };

  return (
    <div className="min-h-svh bg-[var(--background)] text-slate-900">
      <PersistBridge />
      <div className="flex min-h-svh w-full">
        <aside className="sticky top-0 hidden h-svh w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 px-5 py-5 hover:bg-[var(--brand-50)]"
          >
            <BrandMark className="h-10 w-10" />
            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-wide text-[var(--brand-600)]">
                DOLPHIN BEAUTY
              </span>
              <span className="block truncate text-xs text-slate-400">
                {bundle?.orgName ?? "CRM"}
              </span>
            </span>
          </Link>

          {bundle?.branches?.length ? (
            <div className="px-3 pb-3">
              <p className="mb-1 px-3 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                Chi nhánh
              </p>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium"
                value={branchId}
                onChange={(e) => setBranch(e.target.value)}
                aria-label="Chi nhánh"
              >
                <option value="all">Tất cả CN</option>
                {bundle.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="mb-1 px-3 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isNavActive(item.href, pathname);
                    const Icon = item.icon;
                    const badge = badgeFor(item.badgeKey);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                          active
                            ? "bg-[var(--brand-50)] font-semibold text-[var(--brand-700)]"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        {active ? (
                          <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--brand-500)]" />
                        ) : null}
                        <Icon
                          size={18}
                          className={
                            active ? "text-[var(--brand-600)]" : "text-slate-400"
                          }
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
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
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-[var(--border)] p-3">
            <div className="mb-2 flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-500)] text-xs font-bold text-white"
                aria-hidden
              >
                {(bundle?.currentUserName ?? "D")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">
                  {bundle?.currentUserName ?? "Demo"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {bundle?.label} · CSKH
                </p>
              </div>
            </div>
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
          <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--card)]/95 px-3 py-2.5 backdrop-blur sm:px-5">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="Tìm khách, mã, SĐT…"
                className="h-10 w-full rounded-xl border border-transparent bg-[var(--brand-50)] pr-3 pl-9 text-sm outline-none focus:border-[var(--brand-500)] focus:bg-white"
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

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Link href="/bookings" className={ctaPrimary}>
                <CalendarDays size={16} />
                Đặt lịch
              </Link>
              <Link href="/communication" className={ctaPrimary}>
                <MessageSquare size={16} />
                Gửi Zalo
              </Link>
              <Link href="/customers/new" className={ctaOutline}>
                <UserPlus size={16} />
                Khách mới
              </Link>
              <Link href="/reports" className={ctaOutline}>
                <BarChart3 size={16} />
                Báo cáo
              </Link>
            </div>

            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[var(--brand-50)]"
              aria-label="Thông báo (mock)"
              title="Thông báo — stub"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
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
