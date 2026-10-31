"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";
import type { Customer } from "@/lib/types";
import { PROFILE_LABELS } from "@/data/seed";
import { uid } from "@/lib/utils";

type PreviewRow = {
  fullName: string;
  phone: string;
  duplicate: boolean;
};

export default function ImportCustomersPage() {
  const bundle = useAppStore((s) => s.bundle);
  const upsertCustomer = useAppStore((s) => s.upsertCustomer);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [done, setDone] = useState(0);

  if (!bundle) return null;

  const onFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const body = lines[0]?.toLowerCase().includes("name")
      ? lines.slice(1)
      : lines;
    const rows: PreviewRow[] = body.map((line) => {
      const [fullName = "", phone = ""] = line.split(/[,;]/).map((x) => x.trim());
      const duplicate = bundle.customers.some(
        (c) => c.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, ""),
      );
      return { fullName, phone, duplicate };
    });
    setPreview(rows);
    setDone(0);
  };

  const commit = () => {
    const keys = Object.keys(PROFILE_LABELS[bundle.id]);
    let n = 0;
    for (const row of preview) {
      if (!row.fullName || !row.phone) continue;
      const profile: Record<string, string> = {};
      for (const k of keys) profile[k] = "";
      const now = new Date().toISOString();
      const customer: Customer = {
        id: uid("cus"),
        code: `IMP-${Date.now().toString().slice(-4)}`,
        fullName: row.fullName,
        phone: row.phone.replace(/\s+/g, ""),
        email: "",
        birthday: "",
        branchId: bundle.branches[0]?.id ?? "",
        status: "active",
        tags: ["import"],
        notes: "",
        assigneeName: bundle.currentUserName,
        consentZalo: false,
        firstVisitAt: now,
        lastVisitAt: now,
        completedServiceCount: 0,
        totalSpend: 0,
        zaloUid: "",
        profile,
      };
      upsertCustomer(customer);
      n += 1;
    }
    setDone(n);
  };

  return (
    <div>
      <PageHeader
        title="Import khách hàng"
        description="CSV/Excel dạng text: fullName,phone (demo parse đơn giản)"
        actions={
          <Link href="/customers">
            <Button variant="outline">Quay lại</Button>
          </Link>
        }
      />

      <Card className="space-y-4 p-4">
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-slate-500">
          Ví dụ dòng: <code>Nguyen Van A,0901234567</code>
        </p>

        {preview.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="py-2">Họ tên</th>
                    <th>SĐT</th>
                    <th>Trùng?</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={`${r.phone}-${i}`} className="border-b border-slate-100">
                      <td className="py-2">{r.fullName || "—"}</td>
                      <td>{r.phone || "—"}</td>
                      <td>
                        {r.duplicate ? (
                          <span className="font-semibold text-amber-700">
                            Trùng SĐT
                          </span>
                        ) : (
                          "OK"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={commit}>Import {preview.length} dòng</Button>
          </>
        ) : null}

        {done > 0 ? (
          <p className="text-sm text-emerald-700">
            Đã import {done} khách (mock local).{" "}
            <Link href="/customers" className="font-semibold underline">
              Xem danh sách
            </Link>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
