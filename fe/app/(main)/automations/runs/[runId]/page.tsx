"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const bundle = useAppStore((s) => s.bundle);
  if (!bundle) return null;

  const run = bundle.runs.find((r) => r.id === params.runId);
  if (!run) {
    return (
      <Card className="p-6 text-sm">
        Không tìm thấy run.{" "}
        <Link href="/automations/runs" className="text-[var(--brand-600)]">
          Quay lại
        </Link>
      </Card>
    );
  }

  const customer = bundle.customers.find((c) => c.id === run.customerId);

  return (
    <div>
      <PageHeader
        title={run.workflowName}
        description={`Execution · snapshot v${run.workflowVersion}`}
        actions={
          <>
            <Link href={`/automations/${run.workflowId}`}>
              <Button variant="outline">Mở workflow</Button>
            </Link>
            <Link href="/automations/runs">
              <Button variant="outline">Danh sách</Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge
          status={run.status === "failed" ? "failed" : "sent"}
          label={run.status}
        />
        <Link
          href={`/customers/${run.customerId}`}
          className="text-sm font-semibold text-[var(--brand-600)]"
        >
          {customer?.fullName ?? run.customerId}
        </Link>
        <span className="text-sm text-slate-500">
          {formatDateTime(run.startedAt)}
        </span>
      </div>

      {run.error ? (
        <Card className="mb-4 border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {run.error}
        </Card>
      ) : null}

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold">Timeline bước (I/O mock)</h2>
        <ol className="relative space-y-3 border-l border-slate-200 pl-4">
          {run.steps.map((s, idx) => (
            <li key={`${s.nodeId}-${idx}`} className="relative">
              <span
                className={`absolute top-1.5 -left-[1.35rem] h-2.5 w-2.5 rounded-full ${
                  s.status === "failed"
                    ? "bg-rose-500"
                    : s.status === "waiting"
                      ? "bg-amber-400"
                      : "bg-[var(--brand-500)]"
                }`}
              />
              <div className="rounded-[10px] bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    {s.nodeType}
                  </span>
                  <Badge
                    status={
                      s.status === "failed"
                        ? "failed"
                        : s.status === "waiting"
                          ? "pending"
                          : "sent"
                    }
                    label={s.status}
                  />
                </div>
                <p className="mt-1 text-sm">{s.message}</p>
                {(s.input || s.output) && (
                  <div className="mt-2 grid gap-1 rounded-[8px] border border-slate-200 bg-white px-2 py-1.5 font-mono text-[11px] text-slate-600">
                    {s.input ? (
                      <p>
                        <span className="font-semibold text-slate-400">
                          in:{" "}
                        </span>
                        {s.input}
                      </p>
                    ) : null}
                    {s.output ? (
                      <p>
                        <span className="font-semibold text-slate-400">
                          out:{" "}
                        </span>
                        {s.output}
                      </p>
                    ) : null}
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(s.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
