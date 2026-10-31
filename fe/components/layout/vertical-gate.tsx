"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

export function VerticalGate({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);
  const verticalId = useAppStore((s) => s.verticalId);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const onChooser = pathname.startsWith("/chon-linh-vuc");
    if (!verticalId && !onChooser) {
      router.replace("/chon-linh-vuc");
      return;
    }
    if (verticalId && onChooser) {
      router.replace("/");
    }
  }, [hydrated, verticalId, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--background)] text-sm text-slate-500">
        Đang tải…
      </div>
    );
  }

  return <>{children}</>;
}
