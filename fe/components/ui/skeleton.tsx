import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80",
        className,
      )}
      {...props}
    />
  );
}

/** Sidebar + header — khớp AppShell khi hydrate / redirect. */
export function AppShellSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div
      className="min-h-svh bg-[var(--background)]"
      aria-busy="true"
      aria-label="Đang tải"
    >
      <div className="flex min-h-svh w-full">
        <aside className="sticky top-0 hidden h-svh w-[260px] shrink-0 flex-col border-r border-white/10 bg-[var(--sidebar)] lg:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28 bg-white/15" />
              <Skeleton className="h-2.5 w-16 bg-white/10" />
            </div>
          </div>
          <div className="px-3 pb-3">
            <Skeleton className="mb-1.5 ml-3 h-2.5 w-16 bg-white/10" />
            <Skeleton className="h-11 w-full bg-white/10" />
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-0 pb-4">
            <div className="space-y-1.5 px-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/10" />
              ))}
            </div>
            <div className="space-y-1.5 px-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/10" />
              ))}
            </div>
            <div className="space-y-1.5 px-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/10" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-t border-white/10 p-3">
            <Skeleton className="h-9 w-9 rounded-full bg-white/15" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24 bg-white/15" />
              <Skeleton className="h-2.5 w-14 bg-white/10" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] px-3 py-2.5 sm:px-5">
            <Skeleton className="h-10 min-w-0 flex-1 lg:max-w-md" />
            <div className="ml-auto hidden gap-2 lg:flex">
              <Skeleton className="h-10 w-24 bg-[var(--brand-100)]" />
              <Skeleton className="h-10 w-24 bg-[var(--brand-100)]" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-10 w-10" />
          </header>
          <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">
            {children ?? <DashboardSkeleton />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-5 lg:pt-[10vh]"
      aria-busy="true"
      aria-label="Đang tải dashboard"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 pt-2 pb-1">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
      <div className="mx-auto w-full max-w-5xl space-y-2">
        <Skeleton className="h-3 w-24" />
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, c) => (
            <div
              key={c}
              className="space-y-1.5 border-b border-[var(--border)] pb-4 last:border-b-0 sm:border-b-0 sm:pb-0"
            >
              <Skeleton className="h-3 w-24" />
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[5.5rem] rounded-[12px]" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-[12px]" />
      <div className="grid gap-2 md:grid-cols-2">
        <Skeleton className="h-40 rounded-[12px]" />
        <Skeleton className="h-40 rounded-[12px]" />
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div
      className="flex h-full min-h-[28rem] flex-col bg-white p-3"
      aria-busy="true"
      aria-label="Đang tải lịch"
    >
      <div className="mb-3 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-3" />
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full bg-[var(--brand-100)]" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingsPageSkeleton() {
  return (
    <div
      className="-mx-4 -my-4 flex h-[calc(100svh-4.25rem)] flex-col sm:-mx-5 sm:-my-5"
      aria-busy="true"
      aria-label="Đang tải lịch hẹn"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 min-w-[10rem] flex-1 lg:max-w-xs" />
        <Skeleton className="ml-auto h-8 w-24 bg-[var(--brand-100)]" />
      </div>
      <CalendarSkeleton />
    </div>
  );
}
