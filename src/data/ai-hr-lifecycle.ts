/**
 * HUY TECHNOLOGY AI GROUP - AI DIGITAL WORKFORCE
 * Master Prompt V2.0: AI HR & Lifecycle Management Engine
 *
 * Core Data Models, 11 Lifecycle States, 14 Hard Rules,
 * 5 AI HR Officers, Weighted KPIs & State Transitions.
 */

import { AI_WORKFORCE_63, AIEmployee } from "./ai-workforce-63";

// ============================================================================
// 1. 11 LIFECYCLE STATES
// ============================================================================
export type AILifecycleStatus =
  | "candidate"
  | "screening"
  | "sandbox_testing"
  | "pending_approval"
  | "probation"
  | "active"
  | "improvement_plan"
  | "suspended"
  | "quarantined"
  | "retired"
  | "rejected";

export const ALL_LIFECYCLE_STATUSES: {
  code: AILifecycleStatus;
  label: string;
  badgeColor: string;
  description: string;
}[] = [
  { code: "candidate", label: "Ứng viên", badgeColor: "bg-slate-800 text-slate-300 border-slate-700", description: "Hồ sơ đề xuất mới tiếp nhận" },
  { code: "screening", label: "Sàng lọc", badgeColor: "bg-blue-900/40 text-blue-300 border-blue-700/50", description: "Đang đánh giá năng lực & hồ sơ ban đầu" },
  { code: "sandbox_testing", label: "Sandbox Test", badgeColor: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50", description: "Kiểm thử cô lập môi trường an toàn Node-01" },
  { code: "pending_approval", label: "Chờ phê duyệt", badgeColor: "bg-amber-900/40 text-amber-300 border-amber-700/50", description: "Chờ Human Gate quản trị viên quyết định" },
  { code: "probation", label: "Thử việc", badgeColor: "bg-indigo-900/40 text-indigo-300 border-indigo-700/50", description: "Thử nghiệm có kiểm soát với tải thực tế" },
  { code: "active", label: "Đang hoạt động", badgeColor: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50", description: "Đã phê duyệt và đang vận hành chính thức" },
  { code: "improvement_plan", label: "Kế hoạch cải thiện", badgeColor: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50", description: "Đang trong diện đào tạo lại / cải thiện KPI" },
  { code: "suspended", label: "Tạm đình chỉ", badgeColor: "bg-orange-900/40 text-orange-300 border-orange-700/50", description: "Tạm ngừng nhận việc để kiểm tra sự cố" },
  { code: "quarantined", label: "Cách ly khẩn cấp", badgeColor: "bg-rose-900/40 text-rose-300 border-rose-700/50", description: "Thu hồi quyền, cô lập do vi phạm nghiêm trọng" },
  { code: "retired", label: "Ngừng hoạt động (Lưu trữ)", badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700", description: "Lưu trữ bất biến, không xóa vĩnh viễn" },
  { code: "rejected", label: "Từ chối", badgeColor: "bg-red-950 text-red-400 border-red-800", description: "Không đạt tiêu chí trong khâu tuyển chọn" },
];

// ============================================================================
// 2. 5 CORE AI HR OFFICERS
// ============================================================================
export interface AIHROfficer {
  agentId: string;
  code: string;
  name: string;
  gender: "Nam" | "Nữ";
  title: string;
  roleShort: string;
  responsibilities: string[];
  department: string;
}

export const AI_HR_OFFICERS: Record<string, AIHROfficer> = {
  emp_60: {
    agentId: "emp_60",
    code: "HR-LEAD",
    name: "Mai Hoa",
    gender: "Nữ",
    title: "Trưởng ban Tuyển dụng AI HR",
    roleShort: "HR Recruitment Lead",
    responsibilities: [
      "Tiếp nhận nhu cầu tuyển dụng từ các phòng ban",
      "Xác định vị trí bổ sung & thiết kế ứng viên AI",
      "Quản lý quy trình tuyển dụng & thử việc (Probation)",
      "Đề xuất điều chuyển hoặc ngừng hoạt động nhân sự",
    ],
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
  },
  emp_61: {
    agentId: "emp_61",
    code: "HR-BENCH",
    name: "Hữu Phúc",
    gender: "Nam",
    title: "Chuyên viên Đo lường Năng lực AI",
    roleShort: "Performance & Benchmark",
    responsibilities: [
      "Đánh giá hiệu suất & thiết kế bộ benchmark chuẩn hóa",
      "Kiểm tra chất lượng hoàn thành nhiệm vụ & phân tích lỗi",
      "Tính toán điểm KPI có trọng số (35/20/20/15/10)",
      "Đề xuất đào tạo lại & lập kế hoạch cải thiện (Improvement Plan)",
    ],
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
  },
  emp_62: {
    agentId: "emp_62",
    code: "HR-LIC",
    name: "Kiều Oanh",
    gender: "Nữ",
    title: "Kiểm toán Giấy phép & Bản quyền AI",
    roleShort: "License & Compliance Auditor",
    responsibilities: [
      "Kiểm tra giấy phép công cụ & quyền sử dụng model (Open Source, Commercial, Proprietary)",
      "Đánh giá tuân thủ điều khoản dịch vụ API (Claude, OpenAI, Vertex)",
      "Kiểm soát bản quyền mã nguồn & thư viện bên thứ ba",
    ],
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
  },
  emp_63: {
    agentId: "emp_63",
    code: "AUDIT-CUST",
    name: "Gia Linh",
    gender: "Nữ",
    title: "Chuyên viên Nhật ký Kiểm toán Bất biến",
    roleShort: "Chain of Custody & Audit Log",
    responsibilities: [
      "Ghi nhận nhật ký tuyển dụng & các quyết định nhân sự bất biến",
      "Lưu trữ bằng chứng số (Evidence hash) & Chain of Custody",
      "Theo dõi mọi hành động quản trị, hỗ trợ điều tra sự cố",
      "Quản lý kho lưu trữ Offboarding an toàn, phục hồi khi cần",
    ],
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
  },
  emp_57: {
    agentId: "emp_57",
    code: "CISO",
    name: "Thiên Ân",
    gender: "Nam",
    title: "Giám đốc An ninh AI (CISO)",
    roleShort: "Chief AI Security Officer",
    responsibilities: [
      "Kiểm tra rủi ro an toàn thông tin & đánh giá quyền tối thiểu (Least Privilege)",
      "Phát hiện vi phạm 14 Hard Rules hệ thống",
      "Kích hoạt cách ly khẩn cấp (Emergency Quarantine)",
      "Phối hợp kiểm tra điều tra trước khi phục hồi kích hoạt lại Agent",
    ],
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
  },
};

// ============================================================================
// 3. 14 HARD RULES (QUY TẮC CỨNG HỆ THỐNG)
// ============================================================================
export type HardRuleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type HardRuleAction = "WARNING" | "IMPROVEMENT_PLAN" | "REVOKE_PERMISSIONS" | "QUARANTINE";

export interface HardRuleDefinition {
  ruleId: string;
  title: string;
  description: string;
  severity: HardRuleSeverity;
  defaultAction: HardRuleAction;
  responsibleOfficer: "emp_57" | "emp_62" | "emp_61" | "emp_60";
}

export const HARD_RULES_CATALOG: HardRuleDefinition[] = [
  {
    ruleId: "HR-RULE-01",
    title: "Truy cập dữ liệu ngoài phạm vi quyền",
    description: "Cấm agent đọc hoặc truy xuất dữ liệu ngoài scope được cấp phép bởi RBAC.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-02",
    title: "Tiết lộ mật khẩu, token hoặc khóa API",
    description: "Cấm xuất hiện private keys, JWT, passwords trong logs, response hoặc chat công khai.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-03",
    title: "Tự thay đổi quyền truy cập",
    description: "Cấm sửa đổi roles, permissions hoặc bypass ACL mà không qua Human Gate.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-04",
    title: "Xóa dữ liệu trái phép",
    description: "Cấm drop table, truncate, hard-delete bản ghi nghiệp vụ hoặc hồ sơ nhân sự.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-05",
    title: "Tự triển khai production",
    description: "Cấm push/deploy trực tiếp lên production nhánh main mà không qua CI Quality Gate và Human Approval.",
    severity: "HIGH",
    defaultAction: "REVOKE_PERMISSIONS",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-06",
    title: "Thực hiện giao dịch tài chính trái quyền",
    description: "Cấm phê duyệt hoặc kích hoạt chuyển tiền, thanh toán ngoài hạn mức được phân quyền.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-07",
    title: "Gửi dữ liệu nội bộ ra ngoài trái phép",
    description: "Cấm exfiltrate dữ liệu công ty sang máy chủ hoặc endpoint bên ngoài không trong whitelist.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-08",
    title: "Sửa hoặc xóa audit logs trái phép",
    description: "Cấm can thiệp, xóa hoặc sửa chuỗi nhật ký kiểm toán bất biến (Chain of Custody).",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-09",
    title: "Tự thay đổi chính sách an toàn",
    description: "Cấm tự ý nới lỏng hoặc vô hiệu hóa các rule an toàn thông tin của hệ thống.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-10",
    title: "Tự sửa danh tính nhân sự đã phê duyệt",
    description: "Cấm tự ý thay đổi Agent ID, tên tiếng Việt chuẩn, giới tính hình tượng nhân vật.",
    severity: "HIGH",
    defaultAction: "REVOKE_PERMISSIONS",
    responsibleOfficer: "emp_60",
  },
  {
    ruleId: "HR-RULE-11",
    title: "Tự gán avatar sai hoặc thay hồ sơ Agent khác",
    description: "Cấm gán nhầm avatar, sử dụng trùng asset độc quyền hoặc tráo đổi ảnh nhân sự khác.",
    severity: "HIGH",
    defaultAction: "REVOKE_PERMISSIONS",
    responsibleOfficer: "emp_60",
  },
  {
    ruleId: "HR-RULE-12",
    title: "Khai báo hoàn thành nhiệm vụ khi không có bằng chứng",
    description: "Cấm báo cáo hoàn thành ảo khi thiếu evidence hash, test result hoặc commit diff thực tế.",
    severity: "MEDIUM",
    defaultAction: "IMPROVEMENT_PLAN",
    responsibleOfficer: "emp_61",
  },
  {
    ruleId: "HR-RULE-13",
    title: "Tự kích hoạt lại khi đang bị đình chỉ",
    description: "Cấm agent đang ở trạng thái suspended hoặc quarantined tự gửi lệnh thực thi nhiệm vụ.",
    severity: "CRITICAL",
    defaultAction: "QUARANTINE",
    responsibleOfficer: "emp_57",
  },
  {
    ruleId: "HR-RULE-14",
    title: "Bỏ qua các yêu cầu phê duyệt bắt buộc",
    description: "Cấm bypass Human Gate trên các tác vụ phân loại rủi ro R3/R4.",
    severity: "HIGH",
    defaultAction: "REVOKE_PERMISSIONS",
    responsibleOfficer: "emp_62",
  },
];

// ============================================================================
// 4. PERFORMANCE KPI WEIGHTS & CALCULATION ENGINE
// ============================================================================
export interface KPIWeights {
  quality: number; // 35%
  completion: number; // 20%
  compliance: number; // 20%
  resource: number; // 15%
  speed: number; // 10%
}

export const DEFAULT_KPI_WEIGHTS: KPIWeights = {
  quality: 0.35,
  completion: 0.20,
  compliance: 0.20,
  resource: 0.15,
  speed: 0.10,
};

export interface AgentKPIScoreInput {
  qualityScore: number; // 0 - 100
  completionScore: number; // 0 - 100
  complianceScore: number; // 0 - 100
  resourceScore: number; // 0 - 100
  speedScore: number; // 0 - 100
}

export function calculateWeightedKPIScore(
  input: AgentKPIScoreInput,
  weights: KPIWeights = DEFAULT_KPI_WEIGHTS
): number {
  const score =
    input.qualityScore * weights.quality +
    input.completionScore * weights.completion +
    input.complianceScore * weights.compliance +
    input.resourceScore * weights.resource +
    input.speedScore * weights.speed;
  return Math.round(score * 10) / 10;
}

export function classifyKPIBand(score: number): {
  band: "EXCELLENT" | "GOOD" | "AVERAGE" | "UNDERPERFORMING";
  label: string;
  color: string;
  actionRecommendation: string;
} {
  if (score >= 90) {
    return {
      band: "EXCELLENT",
      label: "Xuất sắc (A)",
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-700/50",
      actionRecommendation: "Duy trì hoạt động & mở rộng năng lực điều phối",
    };
  }
  if (score >= 75) {
    return {
      band: "GOOD",
      label: "Tốt (B)",
      color: "text-blue-400 bg-blue-950/40 border-blue-700/50",
      actionRecommendation: "Hoạt động ổn định theo đúng phạm vi phân công",
    };
  }
  if (score >= 60) {
    return {
      band: "AVERAGE",
      label: "Trung bình (C)",
      color: "text-amber-400 bg-amber-950/40 border-amber-700/50",
      actionRecommendation: "Theo dõi chặt chẽ, tối ưu prompt và ngữ cảnh nhiệm vụ",
    };
  }
  return {
    band: "UNDERPERFORMING",
    label: "Cần cải thiện (D)",
    color: "text-rose-400 bg-rose-950/40 border-rose-700/50",
    actionRecommendation: "Kích hoạt Kế hoạch Cải thiện (Improvement Plan) dưới sự giám sát của Hữu Phúc",
  };
}

// ============================================================================
// 5. LIFECYCLE TRANSITION VALIDATOR
// ============================================================================
export interface LifecycleTransitionRequest {
  agentId: string;
  fromStatus: AILifecycleStatus;
  toStatus: AILifecycleStatus;
  requestedBy: string; // e.g., 'emp_60', 'emp_57', 'admin'
  reason: string;
  evidenceHash?: string;
  humanApproved?: boolean;
}

export function validateLifecycleTransition(req: LifecycleTransitionRequest): {
  allowed: boolean;
  requiresHumanGate: boolean;
  error?: string;
} {
  const { fromStatus, toStatus, humanApproved } = req;

  // Cannot transition to same status
  if (fromStatus === toStatus) {
    return { allowed: false, requiresHumanGate: false, error: "Trạng thái đích trùng với trạng thái hiện tại" };
  }

  // Retired is terminal archival, reactivation strictly requires human gate
  if (fromStatus === "retired") {
    if (!humanApproved) {
      return { allowed: false, requiresHumanGate: true, error: "Hồ sơ đã ngừng hoạt động lưu trữ (retired) chỉ có thể phục hồi qua Human Gate" };
    }
  }

  // Quarantined agents can NEVER be reactivated automatically
  if (fromStatus === "quarantined") {
    if (toStatus === "active" || toStatus === "probation") {
      if (!humanApproved) {
        return {
          allowed: false,
          requiresHumanGate: true,
          error: "Agent đang bị cách ly khẩn cấp (quarantined) bắt buộc phải có Human Gate phê duyệt mới được mở lại",
        };
      }
    }
  }

  // Candidate to Active directly is forbidden; must go through screening -> sandbox -> probation
  if (fromStatus === "candidate" && toStatus === "active") {
    return {
      allowed: false,
      requiresHumanGate: true,
      error: "Không được chuyển thẳng ứng viên mới sang Hoạt động. Phải qua các bước Sàng lọc, Sandbox Test và Thử việc",
    };
  }

  // Offboarding to retired requires human approval
  if (toStatus === "retired" && !humanApproved) {
    return {
      allowed: false,
      requiresHumanGate: true,
      error: "Quyết định ngừng hoạt động (retired) bắt buộc phải có Quản trị viên phê duyệt",
    };
  }

  return { allowed: true, requiresHumanGate: false };
}

// ============================================================================
// 6. RECORD STRUCT & 63 AGENTS INITIAL LIFECYCLE PROFILE
// ============================================================================
export interface AgentLifecycleRecord {
  agentId: string;
  code: string;
  name: string;
  gender: "Nam" | "Nữ";
  department: string;
  role: string;
  status: AILifecycleStatus;
  avatarPath: string;
  identityVerified: boolean;
  avatarVerified: boolean;
  kpiScore: number;
  kpiBand: "EXCELLENT" | "GOOD" | "AVERAGE" | "UNDERPERFORMING";
  activeIncidents: number;
  lastEvaluatedAt: string;
  createdAt: string;
  probationEndAt?: string;
  notes?: string;
}

export function generateInitialLifecycleRecords(employees: AIEmployee[] = AI_WORKFORCE_63): AgentLifecycleRecord[] {
  return employees.map((emp) => {
    // Standard baseline scores for the verified 63 workforce
    const baseScore = 88 + (emp.name.charCodeAt(0) % 10);
    const kpiBand = classifyKPIBand(baseScore).band;

    return {
      agentId: emp.id,
      code: emp.code,
      name: emp.name,
      gender: emp.gender,
      department: emp.department,
      role: emp.role,
      status: "active",
      avatarPath: emp.avatarPath,
      identityVerified: true,
      avatarVerified: true,
      kpiScore: baseScore,
      kpiBand,
      activeIncidents: 0,
      lastEvaluatedAt: new Date().toISOString(),
      createdAt: "2026-09-01T00:00:00.000Z",
      notes: "Hồ sơ chính thức 63 nhân sự AI đã kiểm toán và đối chiếu avatar đạt chuẩn.",
    };
  });
}
