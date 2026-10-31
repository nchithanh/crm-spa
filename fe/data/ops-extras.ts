import type {
  DebtEntry,
  SpaResource,
  TechShift,
  TeamMember,
} from "@/lib/types";

export function spaResources(): SpaResource[] {
  return [
    { id: "res_spa_b1", branchId: "br_spa_1", name: "Giường 1", kind: "bed" },
    { id: "res_spa_b2", branchId: "br_spa_1", name: "Giường 2", kind: "bed" },
    { id: "res_spa_r1", branchId: "br_spa_1", name: "Phòng VIP", kind: "room" },
    { id: "res_spa_b3", branchId: "br_spa_2", name: "Giường A", kind: "bed" },
    { id: "res_spa_b4", branchId: "br_spa_2", name: "Giường B", kind: "bed" },
  ];
}

export function nailResources(): SpaResource[] {
  return [
    { id: "res_nail_c1", branchId: "br_nail_1", name: "Ghế 1", kind: "chair" },
    { id: "res_nail_c2", branchId: "br_nail_1", name: "Ghế 2", kind: "chair" },
    { id: "res_nail_c3", branchId: "br_nail_2", name: "Ghế PMH 1", kind: "chair" },
  ];
}

export function salonResources(): SpaResource[] {
  return [
    { id: "res_sal_c1", branchId: "br_sal_1", name: "Ghế Khoa", kind: "chair" },
    { id: "res_sal_c2", branchId: "br_sal_1", name: "Ghế 2", kind: "chair" },
  ];
}

/** Sinh ca Mon–Sat 9–18 cho 60 ngày quanh hôm nay */
export function buildShiftsAroundToday(
  technicians: TeamMember[],
  daysBack = 30,
  daysFwd = 45,
): TechShift[] {
  const techs = technicians.filter((t) => t.role === "technician");
  const out: TechShift[] = [];
  let n = 0;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let d = -daysBack; d <= daysFwd; d++) {
    const day = new Date(today);
    day.setDate(day.getDate() + d);
    const dow = day.getDay();
    if (dow === 0) continue; // nghỉ CN
    const date = day.toISOString().slice(0, 10);
    for (const t of techs) {
      n += 1;
      out.push({
        id: `sh_${t.id}_${date}`,
        technicianId: t.id,
        date,
        startHour: 9,
        endHour: dow === 6 ? 17 : 18,
      });
    }
  }
  return out;
}

export function sampleDebts(
  customerIds: string[],
  prefix: string,
): DebtEntry[] {
  if (customerIds.length < 2) return [];
  return [
    {
      id: `debt_${prefix}_1`,
      customerId: customerIds[0]!,
      amountVnd: 1_200_000,
      paidVnd: 400_000,
      reason: "Còn thiếu gói liệu trình",
      status: "partial",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: `debt_${prefix}_2`,
      customerId: customerIds[1]!,
      amountVnd: 350_000,
      paidVnd: 0,
      reason: "Dịch vụ phát sinh chưa TT",
      status: "open",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];
}
