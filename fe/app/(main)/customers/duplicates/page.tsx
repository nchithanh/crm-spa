"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { findDuplicateGroups } from "@/lib/customer-utils";
import { useAppStore } from "@/stores/app-store";

export default function CustomerDuplicatesPage() {
  const bundle = useAppStore((s) => s.bundle);
  const mergeCustomers = useAppStore((s) => s.mergeCustomers);
  const [flash, setFlash] = useState("");

  const groups = useMemo(
    () => (bundle ? findDuplicateGroups(bundle.customers) : []),
    [bundle],
  );

  if (!bundle) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Khách hàng trùng lặp"
        description="Gợi ý theo SĐT hoặc họ tên giống nhau · merge chuyển booking/task/note sang hồ sơ giữ lại"
      />
      {flash ? (
        <Card className="border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {flash}
        </Card>
      ) : null}
      {groups.length === 0 ? (
        <EmptyState
          title="Không phát hiện trùng"
          description="Không có nhóm ≥2 khách cùng SĐT hoặc cùng họ tên."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.key} className="space-y-3 p-4">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                Trùng {g.kind === "phone" ? "SĐT" : "họ tên"} · {g.customers.length}{" "}
                hồ sơ
              </p>
              <ul className="divide-y divide-slate-100 rounded-[10px] border border-slate-100">
                {g.customers.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-semibold text-[var(--brand-600)]"
                      >
                        {c.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {c.code} · {c.phone} · {c.completedServiceCount} DV
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.customers
                        .filter((o) => o.id !== c.id)
                        .map((o) => (
                          <Button
                            key={o.id}
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Giữ ${c.code} và gộp ${o.code} vào? Không hoàn tác (trừ Reset demo).`,
                                )
                              ) {
                                return;
                              }
                              const res = mergeCustomers(c.id, o.id);
                              setFlash(
                                res.ok
                                  ? `Đã merge ${o.code} → ${c.code}`
                                  : res.error ?? "Lỗi",
                              );
                            }}
                          >
                            Giữ bản này, gộp {o.code}
                          </Button>
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
