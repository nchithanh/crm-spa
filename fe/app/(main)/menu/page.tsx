"use client";

import { MobileMenuPage } from "@/components/layout/mobile-menu-page";
import { PageHeader } from "@/components/ui/page-header";

export default function MenuRoutePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Menu" description="Tất cả chức năng" />
      <MobileMenuPage />
    </div>
  );
}
