import { getVerticalBundle } from "@/data/seed";
import type { VerticalId } from "@/lib/types";

const VERTICALS: VerticalId[] = ["spa", "nails", "salon"];

function allBundles() {
  return VERTICALS.map((id) => getVerticalBundle(id));
}

export function customerStaticParams() {
  return allBundles().flatMap((b) =>
    b.customers.map((c) => ({ id: c.id })),
  );
}

export function workflowStaticParams() {
  return allBundles().flatMap((b) =>
    b.workflows.map((w) => ({ id: w.id })),
  );
}

export function runStaticParams() {
  return allBundles().flatMap((b) =>
    b.runs.map((r) => ({ runId: r.id })),
  );
}

export function segmentStaticParams() {
  return allBundles().flatMap((b) =>
    b.segments.map((s) => ({ id: s.id })),
  );
}
