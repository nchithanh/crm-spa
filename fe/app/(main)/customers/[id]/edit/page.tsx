"use client";

import { useParams } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { useAppStore } from "@/stores/app-store";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const bundle = useAppStore((s) => s.bundle);
  const customer = bundle?.customers.find((c) => c.id === params.id);

  if (!customer) {
    return (
      <Card className="p-6 text-sm">
        Không tìm thấy khách.{" "}
        <Link href="/customers" className="text-[var(--brand-600)]">
          Quay lại
        </Link>
      </Card>
    );
  }

  return <CustomerForm mode="edit" initial={customer} />;
}
