"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppShellSkeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores/app-store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const verticalId = useAppStore((s) => s.verticalId);
  const hydrated = useAppStore((s) => s.hydrated);

  if (!hydrated || !verticalId) {
    return <AppShellSkeleton />;
  }

  return <AppShell>{children}</AppShell>;
}
