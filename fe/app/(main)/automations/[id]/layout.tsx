import { workflowStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return workflowStaticParams();
}

export default function WorkflowIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
