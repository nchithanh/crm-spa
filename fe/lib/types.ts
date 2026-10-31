export type VerticalId = "spa" | "nails" | "salon";

export type CustomerStatus = "active" | "inactive" | "vip";

export type CustomerSource =
  | "zalo"
  | "walk_in"
  | "referral"
  | "facebook"
  | "web"
  | "other";

export type Customer = {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  birthday: string;
  branchId: string;
  status: CustomerStatus;
  tags: string[];
  notes: string;
  assigneeName: string;
  consentZalo: boolean;
  firstVisitAt: string;
  lastVisitAt: string;
  completedServiceCount: number;
  totalSpend: number;
  zaloUid: string;
  profile: Record<string, string>;
  /** Nguồn khách (spa VN) */
  source?: CustomerSource;
  /** Công nợ còn lại (mock) */
  debtVnd?: number;
};

export type StaffNote = {
  id: string;
  customerId: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type SegmentField =
  | "lastVisitAt"
  | "completedServiceCount"
  | "totalSpend"
  | "tags"
  | "birthday"
  | "customerStatus"
  | "branchId"
  | "assigneeName"
  | "upcomingAppointment"
  | "activePackage"
  | "serviceGroupsUsed";

export type SegmentOp =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "days_since_gt"
  | "days_since_lt"
  | "has_upcoming"
  | "has_package_tag";

export type SegmentCriterion = {
  id: string;
  field: SegmentField;
  op: SegmentOp;
  value: string;
};

export type Segment = {
  id: string;
  name: string;
  description: string;
  criteriaSummary: string[];
  criteria: SegmentCriterion[];
  memberIds: string[];
  /** MVP: AND (mặc định) hoặc OR giữa các tiêu chí */
  matchMode?: "and" | "or";
};

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowNodeType =
  | "TRIGGER"
  | "DELAY"
  | "CONDITION"
  | "SEND_ZALO_TEMPLATE"
  | "ADD_TAG"
  | "CREATE_TASK"
  | "END";

export type WfNodeData = {
  label: string;
  triggerEvent?: string;
  delayHours?: number;
  conditionField?: string;
  conditionOp?: string;
  conditionValue?: string;
  templateId?: string;
  tag?: string;
  taskTitle?: string;
};

export type WfNode = {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WfNodeData;
};

export type WfEdge = {
  id: string;
  source: string;
  target: string;
  /** CONDITION: "true" | "false" */
  sourceHandle?: string;
};

export type WorkflowGraph = {
  nodes: WfNode[];
  edges: WfEdge[];
};

export type Workflow = {
  id: string;
  name: string;
  status: WorkflowStatus;
  trigger: string;
  nodeCount: number;
  updatedAt: string;
  errorCount: number;
  version: number;
  graph: WorkflowGraph;
};

export type CareTaskStatus = "open" | "done" | "cancelled";

export type CareTaskType =
  | "follow_up"
  | "post_service"
  | "birthday"
  | "rebooking"
  | "consultation"
  | "complaint"
  | "general";

export type CareTaskPriority = "low" | "medium" | "high" | "urgent";

export type CareTask = {
  id: string;
  title: string;
  customerId: string;
  dueAt: string;
  status: CareTaskStatus;
  source: "workflow" | "manual";
  assigneeName: string;
  /** Loại chăm sóc — mặc định general nếu seed cũ */
  type?: CareTaskType;
  description?: string;
  priority?: CareTaskPriority;
  /** Ghi chú kết quả khi hoàn thành / hủy */
  resultNote?: string;
  createdAt?: string;
  completedAt?: string;
};

export type BookingStatus =
  | "upcoming"
  | "confirmed"
  | "in_service"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no_show";

export type Booking = {
  id: string;
  customerId: string;
  serviceId?: string;
  serviceName: string;
  scheduledAt: string;
  status: BookingStatus;
  branchId: string;
  technicianId?: string;
  /** Giường / phòng / ghế */
  resourceId?: string;
  durationMinutes?: number;
  /** Gói KH bị trừ buổi khi hoàn thành */
  customerPackageId?: string;
  /** Ghi chú sau liệu trình */
  aftercareNote?: string;
};

/** Gói liệu trình đã bán cho khách */
export type CustomerPackage = {
  id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;
  totalSessions: number;
  remainingSessions: number;
  purchasedAt: string;
  expiresAt: string;
  branchId: string;
  /** Đã thanh toán mock (VND) */
  paidVnd: number;
  status: "active" | "exhausted" | "expired";
};

export type MessageStatus = "sent" | "failed" | "pending";

export type MessageTemplate = {
  id: string;
  name: string;
  approval: "approved" | "pending" | "rejected";
  recipientMode: "uid" | "zbs_phone";
  preview: string;
};

export type MessageLog = {
  id: string;
  customerId: string;
  templateId: string;
  status: MessageStatus;
  sentAt: string;
  error: string;
  /** Liên kết chiến dịch nếu gửi từ Campaign */
  campaignId?: string;
};

export type CampaignKind =
  | "birthday"
  | "winback"
  | "vip"
  | "new_service"
  | "post_treatment"
  | "seasonal";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "completed"
  | "paused";

/** Campaign ≠ Automation — đối tượng + thời gian xác định */
export type Campaign = {
  id: string;
  name: string;
  kind: CampaignKind;
  status: CampaignStatus;
  segmentId: string;
  templateId: string;
  scheduledAt: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  note: string;
};

export type ActivityLogKind =
  | "zalo"
  | "campaign"
  | "workflow"
  | "settings"
  | "booking"
  | "care"
  | "system";

export type ActivityLogEntry = {
  id: string;
  at: string;
  kind: ActivityLogKind;
  title: string;
  detail: string;
  actorName: string;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  /** Demo map pin (Leaflet) */
  lat?: number;
  lng?: number;
};

export type CatalogServiceKind = "single" | "combo" | "package";

/** Service Catalog — SoT menu trong Beauty CRM (không phải Ops booking) */
export type CatalogService = {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  priceVnd: number;
  kind: CatalogServiceKind;
  /** Số buổi trong gói/combo — optional */
  sessionCount?: number;
  /** Rỗng = mọi chi nhánh */
  branchIds: string[];
  /** Rỗng = mọi KTV */
  technicianIds: string[];
  active: boolean;
  seasonal?: boolean;
  /** URL ảnh demo (optional) */
  imageUrl?: string;
};

export type SpaResourceKind = "bed" | "room" | "chair";

export type SpaResource = {
  id: string;
  branchId: string;
  name: string;
  kind: SpaResourceKind;
};

/** Ca làm theo ngày (YYYY-MM-DD) */
export type TechShift = {
  id: string;
  technicianId: string;
  date: string;
  startHour: number;
  endHour: number;
};

export type DebtStatus = "open" | "partial" | "paid";

export type DebtEntry = {
  id: string;
  customerId: string;
  amountVnd: number;
  paidVnd: number;
  reason: string;
  status: DebtStatus;
  createdAt: string;
};

export type ExecutionStepStatus = "succeeded" | "failed" | "skipped" | "waiting";

export type ExecutionStep = {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: ExecutionStepStatus;
  message: string;
  at: string;
  /** Mock I/O để demo execution detail */
  input?: string;
  output?: string;
};

export type WorkflowRunStatus = "succeeded" | "failed" | "running" | "waiting_delay";

export type WorkflowRun = {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: number;
  customerId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  steps: ExecutionStep[];
  error: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: "owner" | "manager" | "staff" | "technician";
  branchId: string;
};

export type VerticalBundle = {
  id: VerticalId;
  label: string;
  tagline: string;
  orgName: string;
  branches: Branch[];
  team: TeamMember[];
  customers: Customer[];
  segments: Segment[];
  workflows: Workflow[];
  tasks: CareTask[];
  bookings: Booking[];
  services: CatalogService[];
  packages: CustomerPackage[];
  resources: SpaResource[];
  shifts: TechShift[];
  debts: DebtEntry[];
  templates: MessageTemplate[];
  messages: MessageLog[];
  campaigns: Campaign[];
  runs: WorkflowRun[];
  notes: StaffNote[];
  activityLog: ActivityLogEntry[];
  zaloConnected: boolean;
  posConnected: boolean;
  opsConnected: boolean;
  currentUserName: string;
};

/** MVP limit — số cụ thể TBD product; FE dùng const này */
export const MAX_WORKFLOW_NODES = 12;
