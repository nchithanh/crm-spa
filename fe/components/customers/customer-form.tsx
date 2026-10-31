"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PROFILE_LABELS } from "@/data/seed";
import type { Customer } from "@/lib/types";
import { uid } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function CustomerForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Customer;
}) {
  const bundle = useAppStore((s) => s.bundle);
  const upsertCustomer = useAppStore((s) => s.upsertCustomer);
  const router = useRouter();

  const profileKeys = useMemo(
    () => (bundle ? Object.keys(PROFILE_LABELS[bundle.id]) : []),
    [bundle],
  );

  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [birthday, setBirthday] = useState(initial?.birthday ?? "");
  const [branchId, setBranchId] = useState(
    initial?.branchId ?? bundle?.branches[0]?.id ?? "",
  );
  const [status, setStatus] = useState<Customer["status"]>(
    initial?.status ?? "active",
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [assigneeName, setAssigneeName] = useState(
    initial?.assigneeName ?? "",
  );
  const [consentZalo, setConsentZalo] = useState(
    initial?.consentZalo ?? true,
  );
  const [profile, setProfile] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const k of profileKeys) base[k] = initial?.profile[k] ?? "";
    return base;
  });
  const [error, setError] = useState("");

  if (!bundle) return null;
  const labels = PROFILE_LABELS[bundle.id];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }
    const normalized = phone.replace(/\s+/g, "");
    const dup = bundle.customers.find(
      (c) => c.phone.replace(/\s+/g, "") === normalized && c.id !== initial?.id,
    );
    if (dup) {
      setError(`SĐT trùng với khách «${dup.fullName}» (demo: cảnh báo, vẫn cho lưu).`);
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: initial?.id ?? uid("cus"),
      code: initial?.code ?? `NEW-${Date.now().toString().slice(-4)}`,
      fullName: fullName.trim(),
      phone: normalized,
      email: email.trim(),
      birthday,
      branchId,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes,
      assigneeName,
      consentZalo,
      firstVisitAt: initial?.firstVisitAt ?? now,
      lastVisitAt: initial?.lastVisitAt ?? now,
      completedServiceCount: initial?.completedServiceCount ?? 0,
      totalSpend: initial?.totalSpend ?? 0,
      zaloUid: initial?.zaloUid ?? "",
      profile,
    };
    upsertCustomer(customer);
    router.push(`/customers/${customer.id}`);
  };

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "Thêm khách hàng" : "Sửa khách hàng"}
        description={`Hồ sơ ngành: ${bundle.label}`}
      />
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4">
        <Card className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Họ tên *">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Số điện thoại *">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Sinh nhật">
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </Field>
          <Field label="Chi nhánh">
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              {bundle.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as Customer["status"])
              }
            >
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Ngưng</option>
            </select>
          </Field>
          <Field label="Tags (phẩy)">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Field label="Nhân viên phụ trách">
            <Input
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
            />
          </Field>
          <Field label="Ghi chú" className="sm:col-span-2">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={consentZalo}
              onChange={(e) => setConsentZalo(e.target.checked)}
            />
            Đồng ý nhận Zalo chăm sóc
          </label>
        </Card>

        <Card className="grid gap-3 p-4 sm:grid-cols-2">
          <h2 className="text-sm font-bold sm:col-span-2">
            Hồ sơ {bundle.label}
          </h2>
          {profileKeys.map((key) => (
            <Field key={key} label={labels[key] ?? key}>
              <Input
                value={profile[key] ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </Field>
          ))}
        </Card>

        {error ? (
          <p className="text-sm text-amber-700">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Lưu</Button>
          <Link href={initial ? `/customers/${initial.id}` : "/customers"}>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
