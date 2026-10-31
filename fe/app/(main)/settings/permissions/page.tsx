"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  DEMO_PERMISSION_LABELS,
  DEMO_ROLE_MATRIX,
  type DemoPermission,
  type DemoRole,
} from "@/lib/permissions";

const ROLES: DemoRole[] = ["owner", "manager", "staff", "technician"];
const PERMS = Object.keys(DEMO_PERMISSION_LABELS) as DemoPermission[];

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader
        title="Phân quyền (demo)"
        description="Ma trận hiển thị — chưa enforce runtime"
      />
      <Card className="overflow-x-auto p-2">
        <table className="min-w-[40rem] w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-2 font-bold">Quyền</th>
              {ROLES.map((r) => (
                <th key={r} className="p-2 font-bold capitalize">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p) => (
              <tr key={p} className="border-b border-slate-50">
                <td className="p-2 text-slate-700">
                  {DEMO_PERMISSION_LABELS[p]}
                </td>
                {ROLES.map((r) => (
                  <td key={r} className="p-2 text-center">
                    {DEMO_ROLE_MATRIX[r].includes(p) ? "✅" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
