"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function TemplatesPage() {
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  return (
    <div>
      <PageHeader
        title="Message templates"
        description="Trạng thái duyệt + chế độ người nhận (UID / ZBS phone)"
        actions={
          <Link href="/communication">
            <Button variant="outline">Soạn tin</Button>
          </Link>
        }
      />

      <div className="space-y-3">
        {bundle.templates.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">{t.name}</p>
              <Badge status={t.approval} />
              <Badge status={t.recipientMode} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{t.preview}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
