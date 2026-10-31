"use client";

import { useRouter } from "next/navigation";
import { VERTICAL_META } from "@/data/seed";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

export default function ChooseVerticalPage() {
  const selectVertical = useAppStore((s) => s.selectVertical);
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
          Dolphin Beauty CRM
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Chọn lĩnh vực demo
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Dữ liệu hardcode tách theo Spa · Nails · Salon. Có thể đổi lĩnh vực
          bất cứ lúc nào trong app.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {VERTICAL_META.map((v) => (
          <Card key={v.id} className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-lg font-bold">{v.label}</p>
              <p className="mt-1 text-sm text-slate-500">{v.tagline}</p>
            </div>
            <Button
              className="mt-auto w-full"
              onClick={() => {
                selectVertical(v.id);
                router.push("/");
              }}
            >
              Vào {v.label}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
