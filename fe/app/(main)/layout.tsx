"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useAppStore } from "@/stores/app-store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const verticalId = useAppStore((s) => s.verticalId);
  const hydrated = useAppStore((s) => s.hydrated);

  if (!hydrated || !verticalId) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-slate-500">
        Đang chuyển hướng…
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
