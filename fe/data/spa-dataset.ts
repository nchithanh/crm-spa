import type {
  CareTask,
  Customer,
  CustomerPackage,
  MessageLog,
  Segment,
  StaffNote,
  VerticalBundle,
  Workflow,
  WorkflowRun,
} from "@/lib/types";
import {
  buildReminderGraph,
  buildSampleGraph,
  emptyDraftGraph,
} from "@/lib/workflow-graph";
import {
  buildShiftsAroundToday,
  sampleDebts,
  spaResources,
} from "@/data/ops-extras";
import { spaServices } from "@/data/service-catalog";
import { buildYearBookings } from "@/data/year-bookings";

const BR = [
  {
    id: "br_spa_1",
    name: "Spa Quận 1",
    address: "12 Nguyễn Huệ, Q1, TP.HCM",
    lat: 10.7769,
    lng: 106.7009,
  },
  {
    id: "br_spa_2",
    name: "Spa Thảo Điền",
    address: "88 Xuân Thủy, TP Thủ Đức",
    lat: 10.8021,
    lng: 106.7351,
  },
] as const;

const TEAM = [
  { id: "tm_1", name: "Lan CSKH", role: "staff" as const, branchId: "br_spa_1" },
  { id: "tm_2", name: "Hà Lễ tân", role: "staff" as const, branchId: "br_spa_2" },
  { id: "tm_3", name: "Mai Quản lý", role: "manager" as const, branchId: "br_spa_1" },
  { id: "tm_4", name: "Chuyên viên Hương", role: "technician" as const, branchId: "br_spa_1" },
  { id: "tm_5", name: "Chuyên viên My", role: "technician" as const, branchId: "br_spa_2" },
];

const FIRST = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Võ", "Đặng", "Bùi", "Đỗ",
  "Hồ", "Ngô", "Dương", "Lý", "Đinh",
];
const MID = ["Thị", "Văn", "Minh", "Thanh", "Kim", "Quỳnh", ""];
const LAST = [
  "Anh", "Hương", "Lan", "Mai", "Hà", "Linh", "Trang", "Nhung", "Vy", "Chi",
  "Ngọc", "Yến", "Thy", "Phương", "Thảo", "My", "Quân", "Bảo", "Dũng", "Khoa",
];

const SKINS = ["Khô", "Dầu", "Hỗn hợp", "Nhạy cảm", "Thường"];
const CONCERNS = ["Mụn", "Thâm", "Lão hóa", "Thiếu ẩm", "Lỗ chân lông", "Sạm nắng"];
const SERVICES = [
  "Hydra facial",
  "Peel nhẹ",
  "Massage đá nóng",
  "Detox body",
  "Chăm sóc da chuyên sâu",
  "Liệu trình collagen",
  "Triệt lông diode",
  "Body scrub",
];

function iso(daysAgo: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function future(daysAhead: number, hour = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
}

function phone(i: number): string {
  return `09${String(10000000 + i * 137).slice(0, 8)}`;
}

function buildCustomers(): Customer[] {
  const list: Customer[] = [];
  for (let i = 1; i <= 52; i++) {
    const fn = `${FIRST[i % FIRST.length]} ${MID[i % MID.length]} ${LAST[i % LAST.length]}`.replace(/\s+/g, " ").trim();
    const visits = i % 7 === 0 ? 0 : (i % 11) + 1;
    const lastDays =
      i % 5 === 0 ? 75 + (i % 40) : i % 3 === 0 ? 5 + (i % 10) : 12 + (i % 45);
    const firstDays = lastDays + visits * 18 + 10;
    const status =
      i % 9 === 0 ? "inactive" : visits >= 8 || i % 6 === 0 ? "vip" : "active";
    const tags: string[] = [];
    if (status === "vip") tags.push("vip");
    if (visits >= 4) tags.push("lieu-trinh");
    if (i % 4 === 0) tags.push("da-nhay");
    if (i % 7 === 0) tags.push("ngung-cham");
    if (i % 5 === 0) tags.push("sinh-nhat");
    if (i % 8 === 0) tags.push("goi");

    const sources = [
      "zalo",
      "walk_in",
      "referral",
      "facebook",
      "web",
      "other",
    ] as const;
    list.push({
      id: `cus_spa_${i}`,
      code: `DG-${1000 + i}`,
      fullName: fn,
      phone: phone(i),
      email: i % 3 === 0 ? "" : `khach${i}@email.com`,
      birthday: `19${80 + (i % 20)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      branchId: i % 2 === 0 ? "br_spa_2" : "br_spa_1",
      status,
      tags,
      notes: i % 4 === 0 ? "Thích phòng yên tĩnh." : "",
      assigneeName: TEAM[i % 3]!.name,
      consentZalo: i % 7 !== 0,
      firstVisitAt: iso(firstDays, 9),
      lastVisitAt: visits === 0 ? iso(firstDays, 9) : iso(lastDays, 11),
      completedServiceCount: visits,
      totalSpend: visits * (850000 + (i % 5) * 120000),
      zaloUid: i % 4 === 0 ? "" : `zalo_uid_spa_${1000 + i}`,
      source: sources[i % sources.length],
      profile: {
        skinType: SKINS[i % SKINS.length]!,
        skinConcerns: CONCERNS[i % CONCERNS.length]!,
        allergyNotes: i % 5 === 0 ? "Tránh tinh dầu bạc hà" : i % 11 === 0 ? "Latex" : "Không",
        favoriteServices: SERVICES[i % SERVICES.length]!,
        consultationNotes:
          visits >= 4 ? "Đang liệu trình 6 buổi" : "Tư vấn lần đầu",
      },
    });
    // Cố ý tạo vài cặp trùng SĐT để demo merge (Pass 2)
    if (i === 50 || i === 51) {
      list[list.length - 1]!.phone = phone(3);
    }
  }
  return list;
}

export function buildSpaBundle(): VerticalBundle {
  const customers = buildCustomers();
  const templates = [
    {
      id: "tpl_spa_1",
      name: "Nhắc lịch spa",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview: "Chào {{name}}, lịch {{service}} lúc {{time}} đang chờ bạn tại Dolphin Glow Spa.",
    },
    {
      id: "tpl_spa_2",
      name: "ZBS nhắc lịch (SĐT)",
      approval: "approved" as const,
      recipientMode: "zbs_phone" as const,
      preview: "Dolphin Glow Spa nhắc lịch {{time}}. Soạn HUY để hủy.",
    },
    {
      id: "tpl_spa_3",
      name: "Aftercare facial",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview: "Sau buổi chăm sóc da, hãy uống đủ nước và tránh nắng 24h.",
    },
    {
      id: "tpl_spa_4",
      name: "Win-back 60 ngày",
      approval: "pending" as const,
      recipientMode: "uid" as const,
      preview: "Spa nhớ bạn — ưu đãi quay lại trong tuần này.",
    },
  ];

  const catalog = spaServices().map((s, i) => ({
    ...s,
    imageUrl:
      s.imageUrl ??
      `https://placehold.co/160x120/f3f3fb/5d5cc4?text=${encodeURIComponent(s.category.slice(0, 8))}`,
  }));
  const resources = spaResources();
  const techIds = TEAM.filter((t) => t.role === "technician").map((t) => t.id);
  const bookings = buildYearBookings({
    prefix: "spa",
    year: 2026,
    customers: customers.map((c) => ({ id: c.id, branchId: c.branchId })),
    services: catalog,
    serviceNames: [...SERVICES],
    technicianIds: techIds,
    resourceIds: resources.map((r) => r.id),
    density: "rich",
  });
  const shifts = buildShiftsAroundToday([...TEAM]);
  const debts = sampleDebts(
    customers.slice(0, 4).map((c) => c.id),
    "spa",
  );

  const pkgSvc = catalog.find((s) => s.kind === "package") ?? catalog[0]!;
  const packages: CustomerPackage[] = customers
    .filter((_, i) => i % 4 === 0 || i % 5 === 0)
    .slice(0, 12)
    .map((c, idx) => {
      const total = pkgSvc.sessionCount ?? 5;
      const used = idx % 3;
      const remaining = Math.max(total - used, idx % 7 === 0 ? 1 : total - used);
      return {
        id: `pkg_spa_${idx + 1}`,
        customerId: c.id,
        serviceId: pkgSvc.id,
        serviceName: pkgSvc.name,
        totalSessions: total,
        remainingSessions: remaining,
        purchasedAt: iso(40 + idx * 3, 11),
        expiresAt: future(60 + idx * 5, 10),
        branchId: c.branchId,
        paidVnd: pkgSvc.priceVnd,
        status:
          remaining <= 0
            ? ("exhausted" as const)
            : remaining <= 2
              ? ("active" as const)
              : ("active" as const),
      };
    });

  // gắn một số booking completed với gói
  for (let i = 0; i < Math.min(packages.length, 8); i++) {
    const p = packages[i]!;
    const bk = bookings.find(
      (b) => b.customerId === p.customerId && b.status === "completed",
    );
    if (bk) bk.customerPackageId = p.id;
  }

  const TASK_TYPES = [
    "follow_up",
    "post_service",
    "birthday",
    "rebooking",
    "consultation",
    "complaint",
    "general",
  ] as const;
  const TASK_TITLES = [
    "Gọi xác nhận liệu trình",
    "Follow-up sau facial",
    "Hỏi lý do lâu chưa ghé",
    "Chúc mừng sinh nhật + ưu đãi",
    "Mời tái đặt lịch massage",
    "Tư vấn da nhạy cảm",
    "Xử lý phản hồi dịch vụ",
    "Chăm sóc sau peeling",
  ];
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const tasks: CareTask[] = customers
    .filter((_, i) => i % 2 === 0 || i % 3 === 0)
    .slice(0, 36)
    .map((c, idx) => {
      const type = TASK_TYPES[idx % TASK_TYPES.length]!;
      const status =
        idx % 9 === 0
          ? ("done" as const)
          : idx % 11 === 0
            ? ("cancelled" as const)
            : ("open" as const);
      return {
        id: `task_spa_${idx + 1}`,
        title: TASK_TITLES[idx % TASK_TITLES.length]!,
        description:
          type === "complaint"
            ? "Khách phản hồi cảm giác châm chích sau buổi — cần gọi trong 24h."
            : type === "post_service"
              ? "Nhắc aftercare và hỏi mức hài lòng."
              : "Care task demo từ seed thống nhất.",
        customerId: c.id,
        dueAt:
          idx % 4 === 0
            ? iso(1, 16)
            : idx % 4 === 1
              ? future(0, 15)
              : idx % 4 === 2
                ? future(2, 11)
                : future(5, 10),
        status,
        source: idx % 2 === 0 ? ("workflow" as const) : ("manual" as const),
        assigneeName: c.assigneeName,
        type,
        priority: priorities[idx % priorities.length],
        createdAt: iso(7 + (idx % 10), 9),
        resultNote:
          status === "done"
            ? "Đã gọi — khách hài lòng."
            : status === "cancelled"
              ? "Trùng lịch / khách tự liên hệ."
              : undefined,
        completedAt: status === "done" ? iso(0, 12) : undefined,
      };
    });

  const messages: MessageLog[] = [];
  customers.slice(0, 20).forEach((c, idx) => {
    const tpl = templates[idx % 3]!;
    const fail = !c.zaloUid && tpl.recipientMode === "uid";
    messages.push({
      id: `msg_spa_${idx + 1}`,
      customerId: c.id,
      templateId: tpl.id,
      status: fail ? "failed" : idx % 7 === 0 ? "pending" : "sent",
      sentAt: iso(idx % 12, 9),
      error: fail ? "Thiếu Zalo UID — template yêu cầu UID" : "",
    });
  });

  const notes: StaffNote[] = customers.slice(0, 15).map((c, idx) => ({
    id: `note_spa_${idx + 1}`,
    customerId: c.id,
    body:
      idx % 2 === 0
        ? "Khách phản hồi tốt sau liệu trình."
        : "Nhắc dùng kem chống nắng hàng ngày.",
    authorName: c.assigneeName,
    createdAt: iso(3 + idx, 15),
  }));

  const g1 = buildReminderGraph({
    trigger: "booking.created",
    templateId: "tpl_spa_1",
  });
  const g2 = buildSampleGraph({
    trigger: "booking.completed",
    templateId: "tpl_spa_3",
    taskTitle: "Follow-up sau dịch vụ",
    tag: "aftercare",
  });
  const g3 = emptyDraftGraph("manual");

  const workflows: Workflow[] = [
    {
      id: "wf_spa_1",
      name: "Nhắc lịch spa trước 24h",
      status: "active",
      trigger: "booking.created",
      nodeCount: g1.nodes.length,
      updatedAt: iso(5),
      errorCount: 1,
      version: 3,
      graph: g1,
    },
    {
      id: "wf_spa_2",
      name: "Aftercare sau facial",
      status: "active",
      trigger: "booking.completed",
      nodeCount: g2.nodes.length,
      updatedAt: iso(3),
      errorCount: 2,
      version: 5,
      graph: g2,
    },
    {
      id: "wf_spa_3",
      name: "Win-back 60 ngày",
      status: "draft",
      trigger: "manual",
      nodeCount: g3.nodes.length,
      updatedAt: iso(1),
      errorCount: 0,
      version: 1,
      graph: g3,
    },
    {
      id: "wf_spa_4",
      name: "Sinh nhật khách VIP",
      status: "paused",
      trigger: "manual",
      nodeCount: g3.nodes.length,
      updatedAt: iso(8),
      errorCount: 0,
      version: 2,
      graph: buildReminderGraph({
        trigger: "manual",
        templateId: "tpl_spa_2",
      }),
    },
  ];

  const runs: WorkflowRun[] = [
    {
      id: "run_spa_1",
      workflowId: "wf_spa_1",
      workflowName: workflows[0]!.name,
      workflowVersion: 3,
      customerId: "cus_spa_1",
      status: "succeeded",
      startedAt: iso(0, 8),
      steps: [
        {
          nodeId: "n1",
          nodeType: "TRIGGER",
          status: "succeeded",
          message: "booking.created",
          at: iso(0, 8),
        },
        {
          nodeId: "n2",
          nodeType: "DELAY",
          status: "succeeded",
          message: "Delay 24h (mock)",
          at: iso(0, 8),
        },
        {
          nodeId: "n3",
          nodeType: "SEND_ZALO_TEMPLATE",
          status: "succeeded",
          message: "Đã gửi Nhắc lịch spa",
          at: iso(0, 9),
        },
      ],
      error: "",
    },
    {
      id: "run_spa_2",
      workflowId: "wf_spa_2",
      workflowName: workflows[1]!.name,
      workflowVersion: 5,
      customerId: "cus_spa_4",
      status: "failed",
      startedAt: iso(1, 14),
      steps: [
        {
          nodeId: "n1",
          nodeType: "TRIGGER",
          status: "succeeded",
          message: "booking.completed",
          at: iso(1, 14),
        },
        {
          nodeId: "n2",
          nodeType: "SEND_ZALO_TEMPLATE",
          status: "failed",
          message: "Thiếu Zalo UID — template yêu cầu UID",
          at: iso(1, 14),
        },
      ],
      error: "Thiếu Zalo UID — template yêu cầu UID",
    },
    {
      id: "run_spa_3",
      workflowId: "wf_spa_2",
      workflowName: workflows[1]!.name,
      workflowVersion: 5,
      customerId: "cus_spa_2",
      status: "succeeded",
      startedAt: iso(2, 16),
      steps: [
        {
          nodeId: "n1",
          nodeType: "TRIGGER",
          status: "succeeded",
          message: "booking.completed",
          at: iso(2, 16),
        },
        {
          nodeId: "n2",
          nodeType: "CREATE_TASK",
          status: "succeeded",
          message: "Tạo task Follow-up",
          at: iso(2, 16),
        },
      ],
      error: "",
    },
  ];

  const vipIds = customers.filter((c) => c.status === "vip").map((c) => c.id);
  const atRiskIds = customers
    .filter((c) => c.completedServiceCount >= 1 && c.status !== "inactive")
    .filter((c) => {
      const days =
        (Date.now() - Date.parse(c.lastVisitAt)) / 86_400_000;
      return days > 60;
    })
    .map((c) => c.id);

  const segments: Segment[] = [
    {
      id: "seg_spa_1",
      name: "VIP liệu trình",
      description: "Khách VIP hoặc đang liệu trình",
      criteriaSummary: ["status = vip OR tags chứa lieu-trinh"],
      criteria: [
        { id: "c1", field: "customerStatus", op: "eq", value: "vip" },
      ],
      memberIds: vipIds,
    },
    {
      id: "seg_spa_2",
      name: "Lâu chưa ghé (>60 ngày)",
      description: "Nguy cơ rời bỏ — cần win-back",
      criteriaSummary: ["lastVisitAt days_since > 60"],
      criteria: [
        { id: "c2", field: "lastVisitAt", op: "days_since_gt", value: "60" },
      ],
      memberIds: atRiskIds,
    },
    {
      id: "seg_spa_3",
      name: "Sắp sinh nhật",
      description: "Sinh nhật trong 30 ngày",
      criteriaSummary: ["birthday within 30 days"],
      criteria: [
        { id: "c3", field: "birthday", op: "lte", value: "30" },
      ],
      memberIds: customers
        .filter((c) => c.tags.includes("sinh-nhat"))
        .map((c) => c.id),
    },
  ];

  return {
    id: "spa",
    label: "Spa",
    tagline: "Chăm sóc da & liệu trình",
    orgName: "Dolphin Glow Spa",
    branches: [...BR],
    team: TEAM,
    customers,
    segments,
    workflows,
    tasks,
    bookings,
    services: catalog,
    packages,
    resources,
    shifts,
    debts,
    templates,
    messages,
    campaigns: [
      {
        id: "camp_spa_1",
        name: "Sinh nhật tháng này",
        kind: "birthday",
        status: "completed",
        segmentId: segments.find((s) => s.name.includes("sinh nhật"))?.id ?? segments[0]!.id,
        templateId: "tpl_spa_3",
        scheduledAt: "2026-10-20T09:00:00.000Z",
        sentCount: 8,
        failedCount: 1,
        createdAt: "2026-10-18T08:00:00.000Z",
        note: "Gửi Zalo chúc mừng + ưu đãi facial",
      },
      {
        id: "camp_spa_2",
        name: "Win-back >60 ngày",
        kind: "winback",
        status: "draft",
        segmentId: segments[0]!.id,
        templateId: "tpl_spa_4",
        scheduledAt: "2026-11-01T09:00:00.000Z",
        sentCount: 0,
        failedCount: 0,
        createdAt: "2026-10-28T10:00:00.000Z",
        note: "Template pending duyệt — chỉ draft",
      },
      {
        id: "camp_spa_3",
        name: "VIP soft launch serum",
        kind: "vip",
        status: "scheduled",
        segmentId: segments.find((s) => s.name.toLowerCase().includes("vip"))?.id ?? segments[0]!.id,
        templateId: "tpl_spa_1",
        scheduledAt: "2026-11-05T10:00:00.000Z",
        sentCount: 0,
        failedCount: 0,
        createdAt: "2026-10-29T11:00:00.000Z",
        note: "Chỉ segment VIP",
      },
      {
        id: "camp_spa_4",
        name: "Aftercare facial 24h",
        kind: "post_treatment",
        status: "completed",
        segmentId: segments[0]!.id,
        templateId: "tpl_spa_3",
        scheduledAt: "2026-10-15T08:00:00.000Z",
        sentCount: 12,
        failedCount: 2,
        createdAt: "2026-10-14T08:00:00.000Z",
        note: "Campaign ≠ Automation — gửi batch theo list",
      },
      {
        id: "camp_spa_5",
        name: "Mùa mưa — gói detox",
        kind: "seasonal",
        status: "paused",
        segmentId: segments[0]!.id,
        templateId: "tpl_spa_2",
        scheduledAt: "2026-10-25T09:00:00.000Z",
        sentCount: 3,
        failedCount: 0,
        createdAt: "2026-10-22T09:00:00.000Z",
        note: "Tạm dừng vì OA test",
      },
    ],
    runs,
    notes,
    activityLog: [
      {
        id: "act_1",
        at: "2026-10-30T08:00:00.000Z",
        kind: "campaign",
        title: "Campaign completed",
        detail: "Sinh nhật tháng này · 8 sent / 1 failed",
        actorName: "Lan CSKH",
      },
      {
        id: "act_2",
        at: "2026-10-29T14:00:00.000Z",
        kind: "zalo",
        title: "OA connected",
        detail: "Mock connect Dolphin Glow Spa OA",
        actorName: "Lan CSKH",
      },
      {
        id: "act_3",
        at: "2026-10-28T11:00:00.000Z",
        kind: "workflow",
        title: "Workflow activated",
        detail: "Aftercare facial",
        actorName: "Lan CSKH",
      },
    ],
    zaloConnected: true,
    posConnected: false,
    opsConnected: false,
    currentUserName: "Lan CSKH",
  };
}
