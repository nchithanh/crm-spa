import { buildSpaBundle } from "@/data/spa-dataset";
import { normalizeBundle } from "@/data/normalize";
import { enrichVerticalBundle } from "@/data/enrich";
import {
  buildShiftsAroundToday,
  nailResources,
  salonResources,
  sampleDebts,
} from "@/data/ops-extras";
import { nailsServices, salonServices } from "@/data/service-catalog";
import { buildYearBookings } from "@/data/year-bookings";
import type { VerticalBundle, VerticalId } from "@/lib/types";
import {
  buildReminderGraph,
  buildSampleGraph,
  emptyDraftGraph,
} from "@/lib/workflow-graph";

export const VERTICAL_META: {
  id: VerticalId;
  label: string;
  tagline: string;
}[] = [
  { id: "spa", label: "Spa", tagline: "Dolphin Glow Spa · dataset đầy đủ" },
  { id: "nails", label: "Nails", tagline: "Demo mỏng · cùng IA" },
  { id: "salon", label: "Salon", tagline: "Demo mỏng · cùng IA" },
];

export const PROFILE_LABELS: Record<VerticalId, Record<string, string>> = {
  spa: {
    skinType: "Loại da",
    skinConcerns: "Vấn đề da",
    allergyNotes: "Dị ứng",
    favoriteServices: "Dịch vụ yêu thích",
    consultationNotes: "Ghi chú tư vấn",
  },
  nails: {
    nailType: "Loại móng",
    preferredStyle: "Style yêu thích",
    gelOrAcrylic: "Gel / Acrylic",
    allergyNotes: "Dị ứng hóa chất",
    preferredTechnician: "Kỹ thuật viên yêu thích",
  },
  salon: {
    hairType: "Loại tóc",
    hairCondition: "Tình trạng tóc",
    colorFormula: "Công thức màu",
    chemicalHistory: "Lịch sử hóa chất",
    preferredStylist: "Stylist yêu thích",
  },
};

function thinNails(): VerticalBundle {
  const g = buildReminderGraph({
    trigger: "booking.completed",
    templateId: "tpl_nail_1",
  });
  return {
    id: "nails",
    label: "Nails",
    tagline: "Gel · acrylic · nail art",
    orgName: "Dolphin Nail Studio",
    branches: [
      {
        id: "br_nail_1",
        name: "Nails Dist. 3",
        address: "45 Võ Văn Tần, Q3",
        lat: 10.782,
        lng: 106.689,
      },
      {
        id: "br_nail_2",
        name: "Nails PMH",
        address: "R4-12 PMH, Q7",
        lat: 10.729,
        lng: 106.721,
      },
    ],
    team: [
      {
        id: "tn1",
        name: "My Nails",
        role: "technician",
        branchId: "br_nail_1",
      },
      { id: "tn2", name: "Trang Lễ tân", role: "staff", branchId: "br_nail_1" },
    ],
    currentUserName: "Trang Lễ tân",
    customers: [
      {
        id: "cus_nail_1",
        code: "NL-1001",
        fullName: "Phạm Khánh Linh",
        phone: "0938111222",
        email: "linh@email.com",
        birthday: "1997-08-19",
        branchId: "br_nail_1",
        status: "vip",
        tags: ["gel", "design"],
        notes: "Thích pastel",
        assigneeName: "My Nails",
        consentZalo: true,
        firstVisitAt: "2025-01-10T10:00:00.000Z",
        lastVisitAt: "2026-10-29T15:00:00.000Z",
        completedServiceCount: 18,
        totalSpend: 9600000,
        zaloUid: "zalo_uid_2001",
        profile: {
          nailType: "Móng tự nhiên mỏng",
          preferredStyle: "Pastel French",
          gelOrAcrylic: "Gel",
          allergyNotes: "Nhạy acetone",
          preferredTechnician: "My",
        },
      },
      {
        id: "cus_nail_2",
        code: "NL-1002",
        fullName: "Võ Thanh Thảo",
        phone: "0909998877",
        email: "",
        birthday: "2001-01-30",
        branchId: "br_nail_2",
        status: "active",
        tags: ["acrylic"],
        notes: "",
        assigneeName: "Trang Lễ tân",
        consentZalo: true,
        firstVisitAt: "2026-06-01T10:00:00.000Z",
        lastVisitAt: "2026-10-10T11:00:00.000Z",
        completedServiceCount: 4,
        totalSpend: 2100000,
        zaloUid: "zalo_uid_2002",
        profile: {
          nailType: "Móng dài",
          preferredStyle: "Ombre",
          gelOrAcrylic: "Acrylic",
          allergyNotes: "Không",
          preferredTechnician: "Hân",
        },
      },
      {
        id: "cus_nail_3",
        code: "NL-1003",
        fullName: "Đặng Thu Hà",
        phone: "0977555444",
        email: "ha@email.com",
        birthday: "1995-12-08",
        branchId: "br_nail_1",
        status: "active",
        tags: ["sinh-nhat"],
        notes: "",
        assigneeName: "My Nails",
        consentZalo: false,
        firstVisitAt: "2026-03-01T10:00:00.000Z",
        lastVisitAt: "2026-09-01T13:00:00.000Z",
        completedServiceCount: 7,
        totalSpend: 4300000,
        zaloUid: "",
        profile: {
          nailType: "Trung bình",
          preferredStyle: "Nail art",
          gelOrAcrylic: "Gel",
          allergyNotes: "Sơn gel tối màu",
          preferredTechnician: "",
        },
      },
    ],
    segments: [],
    workflows: [
      {
        id: "wf_nail_1",
        name: "Nhắc fill gel 3 tuần",
        status: "active",
        trigger: "booking.completed",
        nodeCount: g.nodes.length,
        updatedAt: "2026-10-27T08:00:00.000Z",
        errorCount: 0,
        version: 1,
        graph: g,
      },
    ],
    tasks: [
      {
        id: "task_nail_1",
        title: "Nhắn mẫu nail mới cho VIP",
        customerId: "cus_nail_1",
        dueAt: "2026-10-31T17:00:00.000Z",
        status: "open",
        source: "manual",
        assigneeName: "Trang Lễ tân",
      },
    ],
    bookings: buildYearBookings({
      prefix: "nail",
      year: 2026,
      customers: [
        { id: "cus_nail_1", branchId: "br_nail_1" },
        { id: "cus_nail_2", branchId: "br_nail_2" },
        { id: "cus_nail_3", branchId: "br_nail_1" },
      ],
      services: nailsServices(),
      technicianIds: ["tn1"],
      resourceIds: nailResources().map((r) => r.id),
      density: "thin",
    }),
    resources: nailResources(),
    shifts: buildShiftsAroundToday([
      {
        id: "tn1",
        name: "My Nails",
        role: "technician",
        branchId: "br_nail_1",
      },
    ]),
    debts: sampleDebts(["cus_nail_1", "cus_nail_2"], "nail"),
    packages: [
      {
        id: "pkg_nail_1",
        customerId: "cus_nail_1",
        serviceId: "svc_nail_combo",
        serviceName: "Combo gel + fill tháng",
        totalSessions: 2,
        remainingSessions: 1,
        purchasedAt: "2026-10-01T10:00:00.000Z",
        expiresAt: "2026-12-01T10:00:00.000Z",
        branchId: "br_nail_1",
        paidVnd: 400_000,
        status: "active",
      },
    ],
    templates: [
      {
        id: "tpl_nail_1",
        name: "Nhắc fill gel",
        approval: "approved",
        recipientMode: "uid",
        preview: "{{name}} ơi, đến lịch fill gel rồi.",
      },
    ],
    messages: [
      {
        id: "msg_nail_1",
        customerId: "cus_nail_1",
        templateId: "tpl_nail_1",
        status: "sent",
        sentAt: "2026-10-28T10:00:00.000Z",
        error: "",
      },
    ],
    runs: [],
    notes: [],
    campaigns: [],
    activityLog: [],
    services: nailsServices(),
    zaloConnected: true,
    posConnected: false,
    opsConnected: false,
  };
}

function thinSalon(): VerticalBundle {
  const g = buildSampleGraph({
    trigger: "booking.completed",
    templateId: "tpl_sal_1",
  });
  return {
    id: "salon",
    label: "Salon",
    tagline: "Cắt · nhuộm · chăm sóc tóc",
    orgName: "Dolphin Hair Salon",
    branches: [
      {
        id: "br_sal_1",
        name: "Salon Hai Bà Trưng",
        address: "210 Hai Bà Trưng, Q1",
        lat: 10.7825,
        lng: 106.695,
      },
    ],
    team: [
      {
        id: "ts1",
        name: "Stylist Khoa",
        role: "technician",
        branchId: "br_sal_1",
      },
    ],
    currentUserName: "Stylist Khoa",
    customers: [
      {
        id: "cus_sal_1",
        code: "SL-1001",
        fullName: "Hoàng Yến Nhi",
        phone: "0901555666",
        email: "yen@email.com",
        birthday: "1992-04-04",
        branchId: "br_sal_1",
        status: "vip",
        tags: ["nhuom", "keratin"],
        notes: "",
        assigneeName: "Stylist Khoa",
        consentZalo: true,
        firstVisitAt: "2025-05-01T10:00:00.000Z",
        lastVisitAt: "2026-10-22T13:00:00.000Z",
        completedServiceCount: 9,
        totalSpend: 14200000,
        zaloUid: "zalo_uid_3001",
        profile: {
          hairType: "Tóc mỏng",
          hairCondition: "Khô sau nhuộm",
          colorFormula: "6N + 7.4 · Oxi 20vol",
          chemicalHistory: "Keratin 03/2026",
          preferredStylist: "Khoa",
        },
      },
      {
        id: "cus_sal_2",
        code: "SL-1002",
        fullName: "Ngô Minh Tuấn",
        phone: "0911222333",
        email: "",
        birthday: "1985-09-14",
        branchId: "br_sal_1",
        status: "active",
        tags: ["cat-toc"],
        notes: "",
        assigneeName: "Stylist Khoa",
        consentZalo: true,
        firstVisitAt: "2026-08-01T10:00:00.000Z",
        lastVisitAt: "2026-10-05T16:00:00.000Z",
        completedServiceCount: 3,
        totalSpend: 1500000,
        zaloUid: "zalo_uid_3002",
        profile: {
          hairType: "Ngắn dày",
          hairCondition: "Bình thường",
          colorFormula: "",
          chemicalHistory: "Không",
          preferredStylist: "Huy",
        },
      },
    ],
    segments: [],
    workflows: [
      {
        id: "wf_sal_1",
        name: "Chăm sóc sau nhuộm",
        status: "active",
        trigger: "booking.completed",
        nodeCount: g.nodes.length,
        updatedAt: "2026-10-21T08:00:00.000Z",
        errorCount: 0,
        version: 1,
        graph: g,
      },
    ],
    tasks: [
      {
        id: "task_sal_1",
        title: "Gửi công thức màu",
        customerId: "cus_sal_1",
        dueAt: "2026-10-31T12:00:00.000Z",
        status: "open",
        source: "workflow",
        assigneeName: "Stylist Khoa",
      },
    ],
    bookings: buildYearBookings({
      prefix: "sal",
      year: 2026,
      customers: [
        { id: "cus_sal_1", branchId: "br_sal_1" },
        { id: "cus_sal_2", branchId: "br_sal_1" },
      ],
      services: salonServices(),
      technicianIds: ["ts1"],
      resourceIds: salonResources().map((r) => r.id),
      density: "thin",
    }),
    resources: salonResources(),
    shifts: buildShiftsAroundToday([
      {
        id: "ts1",
        name: "Stylist Khoa",
        role: "technician",
        branchId: "br_sal_1",
      },
    ]),
    debts: sampleDebts(["cus_sal_1", "cus_sal_2"], "sal"),
    packages: [
      {
        id: "pkg_sal_1",
        customerId: "cus_sal_1",
        serviceId: "svc_sal_combo",
        serviceName: "Combo cắt + gội dưỡng",
        totalSessions: 1,
        remainingSessions: 1,
        purchasedAt: "2026-10-15T10:00:00.000Z",
        expiresAt: "2027-01-15T10:00:00.000Z",
        branchId: "br_sal_1",
        paidVnd: 350_000,
        status: "active",
      },
    ],
    templates: [
      {
        id: "tpl_sal_1",
        name: "Aftercare nhuộm",
        approval: "approved",
        recipientMode: "uid",
        preview: "Sau nhuộm: dùng dầu gội tóc màu…",
      },
    ],
    messages: [],
    runs: [],
    notes: [],
    campaigns: [],
    activityLog: [],
    services: salonServices(),
    zaloConnected: false,
    posConnected: false,
    opsConnected: false,
  };
}

export function getVerticalBundle(id: VerticalId): VerticalBundle {
  if (id === "spa") return normalizeBundle(buildSpaBundle());
  if (id === "nails") {
    return normalizeBundle(
      enrichVerticalBundle(
        thinNails() as Parameters<typeof enrichVerticalBundle>[0],
      ),
    );
  }
  return normalizeBundle(
    enrichVerticalBundle(
      thinSalon() as Parameters<typeof enrichVerticalBundle>[0],
    ),
  );
}

// silence unused if tree-shaken
void emptyDraftGraph;
