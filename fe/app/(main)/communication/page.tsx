"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/app-store";

export default function CommunicationPage() {
  const bundle = useAppStore((s) => s.bundle);
  const sendZaloMessage = useAppStore((s) => s.sendZaloMessage);
  const search = useSearchParams();
  const [customerId, setCustomerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [result, setResult] = useState("");
  const showFailed = search.get("failed") === "1";

  useEffect(() => {
    const q = search.get("customerId");
    if (q) setCustomerId(q);
  }, [search]);

  const approved = useMemo(
    () => bundle?.templates.filter((t) => t.approval === "approved") ?? [],
    [bundle],
  );

  const failedRecent = useMemo(
    () =>
      bundle?.messages.filter((m) => m.status === "failed").slice(0, 8) ?? [],
    [bundle],
  );

  if (!bundle) return null;

  const customer =
    bundle.customers.find((c) => c.id === customerId) ?? bundle.customers[0];
  const template = approved.find((t) => t.id === templateId) ?? approved[0];

  const send = () => {
    if (!customer || !template) {
      setResult("Chọn khách và template.");
      return;
    }
    const res = sendZaloMessage({
      customerId: customer.id,
      templateId: template.id,
    });
    setResult(
      res.ok
        ? `Đã ghi lịch sử gửi → ${customer.fullName} · ${template.name} (${template.recipientMode})`
        : res.error ?? "Lỗi gửi",
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Zalo Center"
        description="Composer · UID vs ZBS · lịch sử failed · OA mock"
        actions={
          <>
            <Link href="/communication/templates">
              <Button variant="outline">Templates</Button>
            </Link>
            <Link href="/communication/history">
              <Button variant="outline">Lịch sử</Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline">Campaigns</Button>
            </Link>
            <Link href="/settings/zalo">
              <Button variant="outline">OA</Button>
            </Link>
          </>
        }
      />

      <Card className="mb-1 flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">Trạng thái Zalo OA</p>
          <p className="text-xs text-slate-500">
            {bundle.zaloConnected ? "Đã kết nối (mock)" : "Chưa kết nối"}
          </p>
        </div>
        <Badge status={bundle.zaloConnected ? "connected" : "disconnected"} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="grid gap-3 p-4">
          <h2 className="text-sm font-bold">Composer</h2>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">Khách hàng</span>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
              value={customer?.id ?? ""}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {bundle.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} · {c.zaloUid ? "có UID" : "chỉ SĐT"}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">Template</span>
            <select
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm"
              value={template?.id ?? ""}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {approved.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.recipientMode}
                </option>
              ))}
            </select>
          </label>

          {template ? (
            <div className="rounded-[10px] bg-slate-50 p-3 text-sm text-slate-600">
              <div className="mb-2 flex gap-2">
                <Badge status={template.recipientMode} />
                <Badge status={template.approval} />
              </div>
              {template.preview}
            </div>
          ) : null}

          <Button onClick={send}>Gửi (ghi lịch sử mock)</Button>
          {result ? (
            <p
              className={`text-sm ${
                result.startsWith("Đã") ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {result}
            </p>
          ) : null}
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">
              Failed gần đây {showFailed ? "(ưu tiên)" : ""}
            </h2>
            <Link
              href="/communication/history?filter=failed"
              className="text-xs font-semibold text-[var(--brand-600)]"
            >
              Tất cả lỗi
            </Link>
          </div>
          {failedRecent.length === 0 ? (
            <p className="text-sm text-slate-500">Không có tin lỗi.</p>
          ) : (
            <ul className="space-y-2">
              {failedRecent.map((m) => {
                const c = bundle.customers.find((x) => x.id === m.customerId);
                return (
                  <li
                    key={m.id}
                    className="rounded-[10px] border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{c?.fullName ?? m.customerId}</p>
                    <p className="text-xs text-rose-700">{m.error}</p>
                    <Link
                      href={`/communication?customerId=${m.customerId}`}
                      className="text-[11px] font-semibold text-[var(--brand-600)]"
                    >
                      Thử lại composer
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
