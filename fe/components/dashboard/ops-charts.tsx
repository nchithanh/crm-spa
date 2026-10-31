"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  revenueByDay,
  revenueByService,
  revenueByTechnician,
} from "@/lib/report-ops";
import { formatVnd } from "@/lib/utils";
import type { VerticalBundle } from "@/lib/types";

function compactVnd(n: number) {
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}tr`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="tabular-nums text-slate-800">
        {formatVnd(Number(payload[0]?.value ?? 0))}
      </p>
    </div>
  );
}

export function OpsCharts({ bundle }: { bundle: VerticalBundle }) {
  const byDay = revenueByDay(bundle, 14).map((d) => ({
    label: d.date.slice(5),
    amount: d.amount,
  }));
  const dayTotal = byDay.reduce((s, d) => s + d.amount, 0);
  const dayAvg = byDay.length ? Math.round(dayTotal / byDay.length) : 0;

  const bySvc = revenueByService(bundle)
    .slice(0, 6)
    .map((s) => ({
      label: s.name.length > 14 ? `${s.name.slice(0, 12)}…` : s.name,
      amount: s.amount,
    }));

  const techPool = bundle.team.filter((t) => t.role === "technician");
  const techRows = revenueByTechnician(
    bundle,
    techPool.length > 0 ? techPool : bundle.team,
  )
    .slice(0, 6)
    .map((t) => ({
      label: t.name.split(" ").slice(-1)[0] ?? t.name,
      amount: t.amount,
    }));

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <Card className="p-4 lg:col-span-3" aria-labelledby="dash-rev-day">
        <h2 id="dash-rev-day" className="text-sm font-bold">
          Doanh thu 14 ngày (mock)
        </h2>
        <div className="mt-3 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={compactVnd}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--brand-500)"
                strokeWidth={2}
                fill="var(--brand-500)"
                fillOpacity={0.14}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Tổng{" "}
          <span className="font-semibold text-slate-800 tabular-nums">
            {formatVnd(dayTotal)}
          </span>
          {" · "}TB/ngày{" "}
          <span className="font-semibold text-slate-800 tabular-nums">
            {formatVnd(dayAvg)}
          </span>
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-4 lg:col-span-2">
        <div aria-labelledby="dash-rev-svc">
          <h2 id="dash-rev-svc" className="text-sm font-bold">
            Theo dịch vụ
          </h2>
          <div className="mt-2 h-36">
            {bySvc.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Chưa có DT.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySvc} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Bar
                    dataKey="amount"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div aria-labelledby="dash-rev-tech">
          <h2 id="dash-rev-tech" className="text-sm font-bold">
            Theo KTV
          </h2>
          <div className="mt-2 h-36">
            {techRows.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Chưa có DT.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techRows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Bar
                    dataKey="amount"
                    fill="#64748b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
