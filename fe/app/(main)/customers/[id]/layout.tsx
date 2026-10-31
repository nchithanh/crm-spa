import { customerStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return customerStaticParams();
}

export default function CustomerIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
