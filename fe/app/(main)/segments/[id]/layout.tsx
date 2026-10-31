import { segmentStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return segmentStaticParams();
}

export default function SegmentIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
