import { runStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return runStaticParams();
}

export default function RunIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
