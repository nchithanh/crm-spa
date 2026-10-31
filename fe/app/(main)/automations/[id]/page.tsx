"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { WorkflowCanvas } from "@/components/automation/workflow-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { validateWorkflowGraph } from "@/lib/workflow-validate";
import { useAppStore } from "@/stores/app-store";

export default function WorkflowBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bundle = useAppStore((s) => s.bundle);
  const saveWorkflowGraph = useAppStore((s) => s.saveWorkflowGraph);
  const setWorkflowStatus = useAppStore((s) => s.setWorkflowStatus);
  const runWorkflow = useAppStore((s) => s.runWorkflow);
  const cloneWorkflow = useAppStore((s) => s.cloneWorkflow);
  const deleteWorkflow = useAppStore((s) => s.deleteWorkflow);
  const [flash, setFlash] = useState("");
  const [customerId, setCustomerId] = useState("");

  const wf = useMemo(
    () => bundle?.workflows.find((w) => w.id === params.id),
    [bundle, params.id],
  );

  const recentRuns = useMemo(() => {
    if (!bundle || !wf) return [];
    return bundle.runs
      .filter((r) => r.workflowId === wf.id)
      .slice(0, 5);
  }, [bundle, wf]);

  if (!bundle) return null;
  if (!wf) {
    return (
      <Card className="p-6 text-sm">
        Không tìm thấy workflow.{" "}
        <Link href="/automations" className="text-[var(--brand-600)]">
          Quay lại
        </Link>
      </Card>
    );
  }

  const cus = customerId || bundle.customers[0]?.id || "";
  const gateIssues = validateWorkflowGraph(wf.graph);

  return (
    <div>
      <PageHeader
        title={wf.name}
        description={`v${wf.version} · ${wf.trigger} · ${bundle.label}`}
        actions={
          <>
            <Badge status={wf.status} />
            <Link href="/automations">
              <Button variant="outline">Danh sách</Button>
            </Link>
            <Link href="/automations/runs">
              <Button variant="outline">Executions</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                const id = cloneWorkflow(wf.id);
                if (id) router.push(`/automations/${id}`);
              }}
            >
              Clone
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!window.confirm(`Xóa «${wf.name}»?`)) return;
                deleteWorkflow(wf.id);
                router.push("/automations");
              }}
            >
              Xóa
            </Button>
          </>
        }
      />

      {gateIssues.length > 0 ? (
        <Card className="mb-3 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">Validate gate — chưa đủ để Activate</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            {gateIssues.slice(0, 5).map((i) => (
              <li key={i.message}>{i.message}</li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="mb-3 border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Graph hợp lệ (mock) — có thể Activate.
        </Card>
      )}

      <WorkflowCanvas
        key={`${wf.id}-${wf.version}`}
        initialName={wf.name}
        initialGraph={wf.graph}
        templates={bundle.templates}
        onValidateOnly={(g) =>
          validateWorkflowGraph(g).map((i) => i.message)
        }
        onSave={(name, graph) => {
          const res = saveWorkflowGraph(wf.id, { name, graph });
          setFlash(
            res.errors.length
              ? `Đã lưu (có cảnh báo): ${res.errors[0]}`
              : "Đã lưu graph + tăng version.",
          );
        }}
      />

      <Card className="mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              const res = setWorkflowStatus(wf.id, "active");
              setFlash(
                res.ok
                  ? "Activated."
                  : `Không activate: ${res.errors.join("; ")}`,
              );
            }}
          >
            Activate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setWorkflowStatus(wf.id, "paused");
              setFlash("Paused.");
            }}
          >
            Pause
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">
              Chạy thử với khách
            </span>
            <select
              className="h-11 rounded-[10px] border border-slate-200 px-3 text-sm"
              value={cus}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {bundle.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const runId = runWorkflow(wf.id, cus);
              if (runId) {
                setFlash("Đã tạo execution.");
                router.push(`/automations/runs/${runId}`);
              }
            }}
          >
            Run mock
          </Button>
        </div>
      </Card>

      {recentRuns.length > 0 ? (
        <Card className="mt-4 p-4">
          <h2 className="mb-2 text-sm font-bold">Executions gần đây</h2>
          <ul className="divide-y divide-slate-100">
            {recentRuns.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/automations/runs/${r.id}`}
                  className="flex items-center justify-between gap-2 py-2 text-sm hover:text-[var(--brand-600)]"
                >
                  <span>
                    v{r.workflowVersion} · {r.status}
                  </span>
                  <Badge
                    status={
                      r.status === "failed"
                        ? "failed"
                        : r.status === "succeeded"
                          ? "sent"
                          : "pending"
                    }
                    label={r.status}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {flash ? (
        <p className="mt-2 text-sm text-slate-600">{flash}</p>
      ) : null}
    </div>
  );
}
