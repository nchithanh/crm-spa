import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { MetricValue } from "@/lib/metrics";
import { cn, formatVnd } from "@/lib/utils";

export function StatCard({
  label,
  metric,
  href,
  money,
}: {
  label: string;
  metric: MetricValue;
  href?: string;
  money?: boolean;
}) {
  const inner = (
    <Card
      className={cn(
        "h-full p-3",
        href && "transition hover:border-brand hover:shadow-sm",
      )}
      title={metric.definition}
    >
      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      {metric.available ? (
        <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
          {money ? formatVnd(metric.value) : metric.value}
          {!money && label.toLowerCase().includes("tỷ lệ") ? "%" : ""}
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">Không đủ dữ liệu</p>
      )}
      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-400">
        {metric.available ? metric.definition : metric.reason}
      </p>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
