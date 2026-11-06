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

/** 40 tên VN — 4 cohort × 10 (video Marketing Automation) */
const DEMO_NAMES = [
  // A · Khách mới
  "Nguyễn Minh Anh",
  "Trần Thu Hà",
  "Lê Bảo Châu",
  "Phạm Khánh Linh",
  "Hoàng Nhật Mai",
  "Huỳnh Gia Hân",
  "Võ Thanh Tú",
  "Đặng Ngọc Bích",
  "Bùi Phương Uyên",
  "Đỗ Quỳnh Anh",
  // B · Thân thiết
  "Hồ Lan Hương",
  "Ngô Mỹ Duyên",
  "Dương Kim Ngân",
  "Lý Thanh Trúc",
  "Đinh Hà My",
  "Nguyễn Văn Khoa",
  "Trần Minh Quân",
  "Lê Thị Hằng",
  "Phạm Thu Trang",
  "Hoàng Bảo Ngọc",
  // C · VIP
  "Huỳnh Thanh Vy",
  "Võ Diễm My",
  "Đặng Quốc Bảo",
  "Bùi Thảo Nguyên",
  "Đỗ Minh Châu",
  "Hồ Ái Linh",
  "Ngô Khánh Vy",
  "Dương Nhật Quang",
  "Lý Thuỳ Dương",
  "Đinh Mai Phương",
  // D · Lâu chưa quay lại
  "Nguyễn Hoàng Yến",
  "Trần Đức Anh",
  "Lê Mỹ Linh",
  "Phạm Hữu Phước",
  "Hoàng Thùy Trang",
  "Huỳnh An Nhiên",
  "Võ Thanh Sơn",
  "Đặng Kim Chi",
  "Bùi Hà Vy",
  "Đỗ Nhật Nam",
] as const;

type CohortId = "moi" | "than-thiet" | "vip" | "lau-chua-quay";

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

function cohortOf(index0: number): CohortId {
  if (index0 < 10) return "moi";
  if (index0 < 20) return "than-thiet";
  if (index0 < 30) return "vip";
  return "lau-chua-quay";
}

function buildCustomers(): Customer[] {
  const sources = [
    "zalo",
    "walk_in",
    "referral",
    "facebook",
    "web",
    "other",
  ] as const;
  const list: Customer[] = [];

  for (let i = 1; i <= 40; i++) {
    const idx = i - 1;
    const cohort = cohortOf(idx);
    const inCohort = idx % 10;
    const gender = i % 5 === 0 ? "Nam" : "Nữ";

    let visits: number;
    let lastDays: number;
    let firstDays: number;
    let status: Customer["status"];
    let spend: number;
    let tags: string[];
    let notes: string;
    let consultation: string;

    if (cohort === "moi") {
      visits = inCohort < 6 ? 1 : 0;
      lastDays = 2 + inCohort;
      firstDays = lastDays;
      status = "active";
      spend = visits === 0 ? 0 : 450_000 + inCohort * 80_000;
      tags = ["moi", "chao-mung"];
      notes = "Khách mới — ưu tiên follow-up lần 2.";
      consultation = "Tư vấn lần đầu · quan tâm facial / massage";
    } else if (cohort === "than-thiet") {
      visits = 5 + (inCohort % 6); // 5–10
      lastDays = 7 + (inCohort % 14);
      firstDays = lastDays + visits * 21 + 30;
      status = "active";
      spend = visits * (720_000 + inCohort * 40_000);
      tags = ["than-thiet", "lieu-trinh"];
      if (inCohort % 3 === 0) tags.push("goi");
      notes = "Khách thân thiết — hay đặt cuối tuần.";
      consultation = "Đang liệu trình định kỳ";
    } else if (cohort === "vip") {
      visits = 12 + inCohort; // 12–21
      lastDays = 3 + (inCohort % 10);
      firstDays = lastDays + visits * 25 + 90;
      status = "vip";
      spend = 8_500_000 + inCohort * 1_200_000;
      tags = ["vip", "lieu-trinh", "dac-quyen"];
      if (inCohort % 2 === 0) tags.push("goi");
      notes = "VIP — ưu tiên KTV quen · phòng riêng nếu có.";
      consultation = "Liệu trình cao cấp · chăm sóc chuyên sâu";
    } else {
      visits = 3 + (inCohort % 5); // đã từng dùng DV
      lastDays = 35 + inCohort * 5; // 35–80 ngày
      firstDays = lastDays + visits * 30 + 40;
      status = inCohort >= 7 ? "inactive" : "active";
      spend = visits * (650_000 + inCohort * 50_000);
      tags = ["lau-chua-quay", "win-back"];
      if (status === "inactive") tags.push("ngung-cham");
      notes = "Lâu chưa quay lại — phù hợp chiến dịch win-back.";
      consultation = "Từng dùng DV, cần kích hoạt lại";
    }

    if (inCohort === 0 || inCohort === 5) tags.push("sinh-nhat");
    if (inCohort % 4 === 0) tags.push("da-nhay");

    const month = String(((idx + 2) % 12) + 1).padStart(2, "0");
    const day = String((idx % 27) + 1).padStart(2, "0");
    const year = 1982 + (idx % 18);

    list.push({
      id: `cus_spa_${i}`,
      code: `DG-${1000 + i}`,
      fullName: DEMO_NAMES[idx]!,
      phone: phone(i),
      email: i % 4 === 0 ? "" : `khach${i}@email.com`,
      birthday: `${year}-${month}-${day}`,
      branchId: i % 2 === 0 ? "br_spa_2" : "br_spa_1",
      status,
      tags,
      notes,
      assigneeName: TEAM[i % 3]!.name,
      consentZalo: true,
      firstVisitAt: iso(firstDays, 9),
      lastVisitAt: visits === 0 ? iso(firstDays, 9) : iso(lastDays, 11),
      completedServiceCount: visits,
      totalSpend: spend,
      zaloUid: `zalo_uid_spa_${1000 + i}`,
      source: sources[i % sources.length],
      profile: {
        gender,
        skinType: SKINS[i % SKINS.length]!,
        skinConcerns: CONCERNS[i % CONCERNS.length]!,
        allergyNotes:
          i % 5 === 0 ? "Tránh tinh dầu bạc hà" : i % 11 === 0 ? "Latex" : "Không",
        favoriteServices: SERVICES[i % SERVICES.length]!,
        consultationNotes: consultation,
        segmentLabel:
          cohort === "moi"
            ? "Khách hàng mới"
            : cohort === "than-thiet"
              ? "Khách hàng thân thiết"
              : cohort === "vip"
                ? "Khách VIP"
                : "Khách lâu chưa quay lại",
      },
    });
  }

  // Demo merge: hai SĐT trùng
  list[38]!.phone = phone(3);
  list[39]!.phone = phone(3);

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
      preview:
        "Chào {{name}}, lịch {{service}} lúc {{time}} đang chờ bạn tại Dolphin Glow Spa.",
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
      preview:
        "Sau buổi chăm sóc da, hãy uống đủ nước và tránh nắng 24h — Dolphin Glow Spa.",
    },
    {
      id: "tpl_spa_welcome",
      name: "Chào mừng khách mới (−15%)",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview:
        "Chào bạn {{name}}! Cảm ơn bạn đã lựa chọn Dolphin Glow Spa. Tặng bạn ưu đãi giảm 15% cho lần trải nghiệm tiếp theo. Đặt lịch ngay hôm nay nhé!",
    },
    {
      id: "tpl_spa_winback",
      name: "Win-back lâu chưa gặp (−20%)",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview:
        "Chào {{name}}, đã lâu rồi Dolphin Glow Spa chưa được gặp bạn! Chúng mình dành tặng bạn ưu đãi giảm 20% để bạn quay lại thư giãn và chăm sóc bản thân.",
    },
    {
      id: "tpl_spa_vip",
      name: "Đặc quyền VIP",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview:
        "Chào {{name}}! Cảm ơn bạn đã luôn đồng hành cùng Dolphin Glow Spa. Một đặc quyền chăm sóc chuyên sâu đang dành riêng cho bạn — inbox để nhận lịch VIP.",
    },
    {
      id: "tpl_spa_loyal",
      name: "Ưu đãi khách thân thiết (−10% + nâng cấp)",
      approval: "approved" as const,
      recipientMode: "uid" as const,
      preview:
        "Chào {{name}}! Cảm ơn bạn đã tin tưởng Dolphin Glow Spa. Tháng này dành riêng cho khách thân thiết: giảm 10% và nâng cấp liệu trình khi đặt trước cuối tuần.",
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
    .filter(
      (c) =>
        c.tags.includes("vip") ||
        c.tags.includes("than-thiet") ||
        c.tags.includes("goi"),
    )
    .slice(0, 14)
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
  // Demo video: 6 tin welcome đã gửi + vài tin ops
  customers
    .filter((c) => c.tags.includes("moi"))
    .slice(0, 6)
    .forEach((c, idx) => {
      messages.push({
        id: `msg_spa_welcome_${idx + 1}`,
        customerId: c.id,
        templateId: "tpl_spa_welcome",
        status: "sent",
        sentAt: iso(0, 9 + idx),
        error: "",
        campaignId: "camp_spa_welcome",
      });
    });
  customers.slice(10, 22).forEach((c, idx) => {
    const tpl = templates[idx % 3]!;
    messages.push({
      id: `msg_spa_${idx + 1}`,
      customerId: c.id,
      templateId: tpl.id,
      status: idx % 7 === 0 ? "pending" : "sent",
      sentAt: iso(1 + (idx % 10), 9),
      error: "",
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

  const idsByTag = (tag: string) =>
    customers.filter((c) => c.tags.includes(tag)).map((c) => c.id);
  const newIds = idsByTag("moi");
  const loyalIds = idsByTag("than-thiet");
  const vipIds = customers.filter((c) => c.status === "vip").map((c) => c.id);
  const winbackIds = idsByTag("lau-chua-quay");

  const segments: Segment[] = [
    {
      id: "seg_spa_new",
      name: "Khách hàng mới",
      description: "Mới đăng ký / mới dùng DV lần đầu — chào mừng & ưu đãi lần 2",
      criteriaSummary: ["tags chứa moi"],
      criteria: [
        { id: "c_new", field: "tags", op: "contains", value: "moi" },
      ],
      memberIds: newIds,
      matchMode: "and",
    },
    {
      id: "seg_spa_loyal",
      name: "Khách hàng thân thiết",
      description: "5–10 lần hoàn thành DV — loyalty / nâng cấp liệu trình",
      criteriaSummary: ["tags chứa than-thiet"],
      criteria: [
        {
          id: "c_loyal",
          field: "tags",
          op: "contains",
          value: "than-thiet",
        },
      ],
      memberIds: loyalIds,
      matchMode: "and",
    },
    {
      id: "seg_spa_vip",
      name: "Khách VIP",
      description: "Chi tiêu cao · ghé thường xuyên — đặc quyền riêng",
      criteriaSummary: ["status = vip"],
      criteria: [
        { id: "c_vip", field: "customerStatus", op: "eq", value: "vip" },
      ],
      memberIds: vipIds,
      matchMode: "and",
    },
    {
      id: "seg_spa_winback",
      name: "Khách lâu chưa quay lại",
      description: "Last visit 30–90 ngày — win-back giảm 20%",
      criteriaSummary: [
        "tags chứa lau-chua-quay",
        "lastVisit days_since > 30",
      ],
      criteria: [
        {
          id: "c_wb_tag",
          field: "tags",
          op: "contains",
          value: "lau-chua-quay",
        },
        {
          id: "c_wb_days",
          field: "lastVisitAt",
          op: "days_since_gt",
          value: "30",
        },
      ],
      memberIds: winbackIds,
      matchMode: "and",
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
        id: "camp_spa_welcome",
        name: "Chào mừng khách hàng mới",
        kind: "new_service",
        status: "running",
        segmentId: "seg_spa_new",
        templateId: "tpl_spa_welcome",
        scheduledAt: iso(0, 9),
        sentCount: 6,
        failedCount: 0,
        createdAt: iso(2, 10),
        note: "Ưu đãi −15% lần tiếp theo · segment Khách hàng mới",
      },
      {
        id: "camp_spa_winback",
        name: "Đã lâu chưa gặp – Ưu đãi dành riêng cho bạn",
        kind: "winback",
        status: "scheduled",
        segmentId: "seg_spa_winback",
        templateId: "tpl_spa_winback",
        scheduledAt: future(1, 10),
        sentCount: 0,
        failedCount: 0,
        createdAt: iso(1, 11),
        note: "Ưu đãi −20% · segment lâu chưa quay lại (30–90 ngày)",
      },
      {
        id: "camp_spa_vip",
        name: "Đặc quyền dành riêng cho khách VIP",
        kind: "vip",
        status: "scheduled",
        segmentId: "seg_spa_vip",
        templateId: "tpl_spa_vip",
        scheduledAt: future(2, 10),
        sentCount: 0,
        failedCount: 0,
        createdAt: iso(1, 14),
        note: "Tặng chăm sóc chuyên sâu / lịch VIP · không gửi broadcast chung",
      },
      {
        id: "camp_spa_loyal",
        name: "Ưu đãi khách hàng thân thiết",
        kind: "seasonal",
        status: "draft",
        segmentId: "seg_spa_loyal",
        templateId: "tpl_spa_loyal",
        scheduledAt: future(3, 9),
        sentCount: 0,
        failedCount: 0,
        createdAt: iso(0, 16),
        note: "−10% + nâng cấp liệu trình · segment thân thiết (5–10 buổi)",
      },
      {
        id: "camp_spa_aftercare",
        name: "Aftercare facial 24h",
        kind: "post_treatment",
        status: "completed",
        segmentId: "seg_spa_loyal",
        templateId: "tpl_spa_3",
        scheduledAt: iso(10, 8),
        sentCount: 9,
        failedCount: 1,
        createdAt: iso(12, 8),
        note: "Campaign ≠ Automation — batch aftercare (giữ demo phụ)",
      },
    ],
    runs,
    notes,
    activityLog: [
      {
        id: "act_1",
        at: iso(0, 9),
        kind: "campaign",
        title: "Chiến dịch đang chạy",
        detail: "Chào mừng khách hàng mới · 6 đã gửi · ưu đãi −15%",
        actorName: "Lan CSKH",
      },
      {
        id: "act_2",
        at: iso(1, 11),
        kind: "campaign",
        title: "Lên lịch win-back",
        detail: "Đã lâu chưa gặp · segment 10 khách · ưu đãi −20%",
        actorName: "Lan CSKH",
      },
      {
        id: "act_3",
        at: iso(1, 14),
        kind: "campaign",
        title: "Lên lịch đặc quyền VIP",
        detail: "10 khách VIP · template đặc quyền chăm sóc chuyên sâu",
        actorName: "Lan CSKH",
      },
      {
        id: "act_4",
        at: iso(2, 10),
        kind: "zalo",
        title: "OA đã kết nối",
        detail: "Mock connect Dolphin Glow Spa OA",
        actorName: "Lan CSKH",
      },
    ],
    zaloConnected: true,
    posConnected: false,
    opsConnected: false,
    currentUserName: "Lan CSKH",
  };
}
