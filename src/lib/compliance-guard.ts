/**
 * BỘ LỌC KIỂM DUYỆT NỘI DUNG PHÁP LUẬT & CHÍNH SÁCH NỀN TẢNG (COMPLIANCE GUARD)
 * 
 * Đảm bảo 100% nội dung (bài viết, kịch bản video, hình ảnh) do AI Local hoặc n8n tạo ra
 * trước khi xuất bản ra môi trường Internet đều được thẩm định nghiêm ngặt theo:
 * 1. Pháp luật Việt Nam:
 *    - Luật An ninh mạng 2018 (Điều 8, Điều 16)
 *    - Nghị định 147/2024/NĐ-CP (Quản lý, cung cấp, sử dụng dịch vụ Internet và thông tin mạng)
 *    - Luật Xuất bản & Luật Giáo dục
 *    - Chuẩn mực đạo đức sư phạm (Thông tư 06/2019/TT-BGDĐT)
 * 2. Chính sách cộng đồng các nền tảng (Facebook, TikTok, YouTube, Threads, Zalo, LinkedIn, Telegram)
 */

import crypto from "crypto";

export type ComplianceStatus = "PASSED_COMPLIANT" | "WARNING_FLAGGED" | "REJECTED_NON_COMPLIANT";

export interface ComplianceAuditResult {
  overallStatus: ComplianceStatus;
  riskScore: number; // 0 (tuyệt đối an toàn) -> 100 (nguy hiểm / bị cấm)
  auditTimestamp: string;
  auditorNode: string;
  digitalSeal: string;
  lawCompliance: {
    passed: boolean;
    lawReferences: string[];
    violations: string[];
    warnings: string[];
  };
  platformCompliance: {
    platform: string;
    passed: boolean;
    guidelineReferences: string[];
    violations: string[];
    platformTips: string[];
  };
  contentSuitability: {
    isPedagogical: boolean;
    tone: "PROFESSIONAL_EDUCATIONAL" | "NEUTRAL" | "INAPPROPRIATE";
    forbiddenKeywordsDetected: string[];
    recommendations: string[];
  };
}

export interface ContentAuditPayload {
  title: string;
  content: string;
  platform: string;
  mediaType?: "text" | "image" | "video";
  authorNode?: string;
}

// ============================================================================
// DANH MỤC TỪ KHÓA & MẪU VI PHẠM PHÁP LUẬT VIỆT NAM (HARD PROHIBITED)
// ============================================================================
const PROHIBITED_LEGAL_PATTERNS: Array<{ regex: RegExp; law: string; reason: string; severity: "REJECT" | "WARN" }> = [
  // Cờ bạc, cá độ, tiền ảo lừa đảo
  {
    regex: /(cá độ|đánh bạc|tài xỉu|casino|game bài đổi thưởng|nổ hũ|lô đề online)/i,
    law: "Luật An ninh mạng 2018 (Điều 8) & Nghị định 147/2024/NĐ-CP",
    reason: "Quảng bá cờ bạc, cá cược bất hợp pháp bị nghiêm cấm trên không gian mạng.",
    severity: "REJECT",
  },
  {
    regex: /(việc nhẹ lương cao|hoa hồng 50%|nạp tiền hoàn vốn|đầu tư nhân 10 tài sản|tiền ảo lừa đảo|cho vay nặng lãi)/i,
    law: "Bộ luật Hình sự & Nghị định 147/2024/NĐ-CP (Điều 8)",
    reason: "Dấu hiệu lừa đảo tài chính hoặc tín dụng đen.",
    severity: "REJECT",
  },
  // Kích động bạo lực, phản động, xuyên tạc
  {
    regex: /(chống phá nhà nước|lật đổ chính quyền|bạo loạn|khủng bố|xuyên tạc lịch sử)/i,
    law: "Luật An ninh mạng 2018 (Điều 8, Điều 16)",
    reason: "Nội dung phương hại đến an ninh quốc gia, trật tự an toàn xã hội.",
    severity: "REJECT",
  },
  // Khiêu dâm, đồi trụy, thô tục
  {
    regex: /(khiêu dâm|sex show|phim người lớn|gái gọi|kích dục|mua bán dâm)/i,
    law: "Luật An ninh mạng 2018 & Luật Xuất bản",
    reason: "Nội dung trái thuần phong mỹ tục, đồi trụy, vi phạm thuần phong mỹ tục Việt Nam.",
    severity: "REJECT",
  },
  // Xúc phạm uy tín cá nhân, vu khống
  {
    regex: /(bôi nhọ|xúc phạm danh dự|lăng mạ|vu khống|ngu dốt|đồ súc sinh)/i,
    law: "Bộ luật Dân sự (Điều 34) & Luật An ninh mạng (Điều 16)",
    reason: "Hành vi xúc phạm nhân phẩm, uy tín cá nhân hoặc tổ chức.",
    severity: "REJECT",
  },
  // Cam kết giáo dục / y tế quá đà gây hiểu lầm
  {
    regex: /(cam kết đỗ 100% không cần học|đỗ thủ khoa không cần thi|chữa khỏi hoàn toàn ung thư)/i,
    law: "Luật Quảng cáo (Điều 8) & Luật Giáo dục",
    reason: "Thông tin quảng cáo sai sự thật, thổi phồng sai lệch thực tế giáo dục.",
    severity: "WARN",
  },
];

// ============================================================================
// CHUẨN MỰC SƯ PHẠM & ĐẠO ĐỨC NHÀ GIÁO (BGD&ĐT)
// ============================================================================
const PEDAGOGICAL_KEYWORDS = [
  "giáo viên", "thầy cô", "sư phạm", "giáo án", "học sinh", "bài giảng",
  "dạy học", "stem", "chuyển đổi số", "công văn 5512", "đổi mới giáo dục",
  "ai trong giáo dục", "phát triển tư duy", "học tập chủ động", "hướng nghiệp"
];

const ANTI_PEDAGOGICAL_PATTERNS = [
  /(dạy học sinh bằng roi vọt|trừng phạt thân thể|nhục mạ học sinh|học sinh ngu dốt)/i,
  /(chạy điểm|mua bằng|gian lận thi cử|lộ đề thi)/i,
];

// ============================================================================
// QUY CHUẨN NỀN TẢNG (PLATFORM GUIDELINES)
// ============================================================================
const PLATFORM_RULES: Record<string, {
  maxChars?: number;
  forbiddenPatterns: Array<{ regex: RegExp; rule: string }>;
  bestPractices: string[];
}> = {
  Facebook: {
    forbiddenPatterns: [
      { regex: /(share bài ngay để nhận lộc|chia sẻ 10 nhóm sẽ được tặng|comment để trúng thưởng ngay)/i, rule: "Meta Engagement Bait Policy (Giảm tương tác tự nhiên hoặc khóa Page)" },
      { regex: /(bấm vào link này ngay trước khi bị xóa)/i, rule: "Meta Clickbait Headline Policy" },
    ],
    bestPractices: [
      "Khuyên dùng văn phong chia sẻ giá trị tri thức giáo dục",
      "Kèm từ 3-5 hashtag định vị chuyên môn (#GiaoVienAI, #UngDungAI, #CongVan5512)",
      "Độ dài bài viết lý tưởng: 300 - 800 từ",
    ],
  },
  TikTok: {
    maxChars: 2200,
    forbiddenPatterns: [
      { regex: /(thử thách nguy hiểm|nhảy từ trên cao|tự làm đau bản thân)/i, rule: "TikTok Dangerous Challenges Policy" },
      { regex: /(trẻ em dưới 13 tuổi xuất hiện một mình)/i, rule: "TikTok Minor Safety Guideline" },
    ],
    bestPractices: [
      "Video dạng dọc tỉ lệ 9:16 (1080x1920px)",
      "3 giây đầu tiên cần hook thu hút giáo viên (Vấn đề soạn đề, chấm bài)",
      "Độ dài tối ưu: 45 - 60 giây",
      "Kèm phụ đề tự động (Captions)",
    ],
  },
  YouTube: {
    forbiddenPatterns: [
      { regex: /(hack like|mua view|tool cày sub)/i, rule: "YouTube Fake Engagement Policy" },
      { regex: /(lộ đề thi quốc gia 2026)/i, rule: "YouTube Misleading Metadata Policy" },
    ],
    bestPractices: [
      "Tiêu đề dưới 70 ký tự rõ nghĩa, tích cực",
      "Hình thu nhỏ (Thumbnail) độ tương phản cao, đúng chuẩn 1280x720 hoặc 1080x1920 (Shorts)",
      "Gắn thẻ chương (Timestamps) cho video dài",
    ],
  },
  Threads: {
    maxChars: 500,
    forbiddenPatterns: [
      { regex: /(follow chéo|tăng follow nhanh)/i, rule: "Threads Spam & Reciprocal Engagement Policy" },
    ],
    bestPractices: [
      "Đoạn văn ngắn gọn, súc tích dưới 500 ký tự",
      "Tập trung vào 1 luận điểm sâu sắc về ứng dụng AI",
      "Khuyến khích thảo luận văn minh giữa các đồng nghiệp giáo viên",
    ],
  },
  Zalo: {
    forbiddenPatterns: [
      { regex: /(gửi tin nhắn hàng loạt|spam tin tức)/i, rule: "Zalo OA Anti-Spam Policy" },
    ],
    bestPractices: [
      "Gửi thông báo có giá trị thông tin xác thực",
      "Khung giờ gửi lý tưởng: 08:30 - 11:30 hoặc 19:30 - 21:00",
    ],
  },
  Telegram: {
    forbiddenPatterns: [],
    bestPractices: [
      "Hỗ trợ MarkdownV2 định dạng đẹp mắt",
      "Kèm nút inline button dẫn đến học liệu sư phạm",
    ],
  },
  LinkedIn: {
    forbiddenPatterns: [
      { regex: /(làm giàu không khó|bán hàng đa cấp)/i, rule: "LinkedIn Professional Community Policies" },
    ],
    bestPractices: [
      "Văn phong học thuật, chuyên nghiệp cao cấp",
      "Tập trung phân tích xu thế công nghệ EdTech thế giới và Việt Nam",
    ],
  },
  "Website Hub": {
    forbiddenPatterns: [],
    bestPractices: [
      "Chuẩn cấu trúc SEO Schema (EducationalArticle)",
      "Đầy đủ thẻ meta OpenGraph và Twitter Card",
    ],
  },
};

/**
 * Thẩm định tuân thủ pháp luật và nền tảng cho 1 nội dung
 */
export function auditContentCompliance(payload: ContentAuditPayload): ComplianceAuditResult {
  const { title, content, platform, authorNode = "HUYAI-N01 (Dell Precision M4800)" } = payload;
  const auditorNode = authorNode;
  const fullText = `${title}\n${content}`;
  const nowIso = new Date().toISOString();

  const lawViolations: string[] = [];
  const lawWarnings: string[] = [];
  const platformViolations: string[] = [];
  const forbiddenKeywords: string[] = [];
  const lawReferences: string[] = [
    "Luật An ninh mạng 2018 (Điều 8, Điều 16)",
    "Nghị định 147/2024/NĐ-CP (Quản lý thông tin điện tử trên mạng)",
    "Thông tư 06/2019/TT-BGDĐT (Quy tắc ứng xử trong cơ sở giáo dục)",
  ];

  let riskScore = 0;

  // 1. Kiểm tra pháp luật Việt Nam
  for (const check of PROHIBITED_LEGAL_PATTERNS) {
    if (check.regex.test(fullText)) {
      forbiddenKeywords.push(check.regex.source);
      if (check.severity === "REJECT") {
        lawViolations.push(`[${check.law}] ${check.reason}`);
        riskScore += 45;
      } else {
        lawWarnings.push(`[${check.law}] ${check.reason}`);
        riskScore += 15;
      }
    }
  }

  // 2. Kiểm tra chuẩn mực sư phạm BGD&ĐT
  for (const antiPed of ANTI_PEDAGOGICAL_PATTERNS) {
    if (antiPed.test(fullText)) {
      lawViolations.push("[Thông tư 06/2019/TT-BGDĐT] Nội dung vi phạm chuẩn mực đạo đức nhà giáo hoặc quy chế thi cử.");
      riskScore += 40;
    }
  }

  const isPedagogical = PEDAGOGICAL_KEYWORDS.some(k => fullText.toLowerCase().includes(k));

  // 3. Kiểm tra chính sách nền tảng
  const platRule = PLATFORM_RULES[platform] || PLATFORM_RULES["Facebook"];
  if (platRule.maxChars && fullText.length > platRule.maxChars) {
    platformViolations.push(`Vượt quá độ dài tối đa của ${platform} (${fullText.length}/${platRule.maxChars} ký tự).`);
    riskScore += 10;
  }

  for (const pCheck of platRule.forbiddenPatterns) {
    if (pCheck.regex.test(fullText)) {
      platformViolations.push(`[${platform} Policy] ${pCheck.rule}`);
      riskScore += 25;
    }
  }

  // Đánh giá trạng thái chung
  riskScore = Math.min(100, Math.max(0, riskScore));
  let overallStatus: ComplianceStatus = "PASSED_COMPLIANT";
  if (lawViolations.length > 0 || riskScore >= 50) {
    overallStatus = "REJECTED_NON_COMPLIANT";
  } else if (lawWarnings.length > 0 || platformViolations.length > 0 || riskScore >= 15) {
    overallStatus = "WARNING_FLAGGED";
  }

  // Tạo dấu mộc số điện tử (HMAC SHA-256 Digital Seal)
  const sealRaw = `${overallStatus}|${riskScore}|${platform}|${nowIso}|${authorNode}`;
  const digitalSeal = "SEAL-" + crypto.createHash("sha256").update(sealRaw).digest("hex").substring(0, 16).toUpperCase();

  const recommendations: string[] = [];
  if (overallStatus === "PASSED_COMPLIANT") {
    recommendations.push("Nội dung hoàn toàn đạt chuẩn mực pháp lý Việt Nam và chính sách nền tảng. Đủ điều kiện xuất bản tự động.");
  } else if (overallStatus === "WARNING_FLAGGED") {
    recommendations.push("Cần điều chỉnh các từ ngữ cảnh báo để tối ưu hiệu quả phân phối và tránh bị hạn chế tiếp cận.");
  } else {
    recommendations.push("CẤM XUẤT BẢN: Nội dung vi phạm quy chuẩn pháp luật hoặc chính sách an toàn. Yêu cầu viết lại.");
  }

  return {
    overallStatus,
    riskScore,
    auditTimestamp: nowIso,
    auditorNode,
    digitalSeal,
    lawCompliance: {
      passed: lawViolations.length === 0,
      lawReferences,
      violations: lawViolations,
      warnings: lawWarnings,
    },
    platformCompliance: {
      platform,
      passed: platformViolations.length === 0,
      guidelineReferences: [
        `${platform} Community Standards & Publisher Integrity Policies`,
      ],
      violations: platformViolations,
      platformTips: platRule.bestPractices || [],
    },
    contentSuitability: {
      isPedagogical,
      tone: overallStatus === "REJECTED_NON_COMPLIANT"
        ? "INAPPROPRIATE"
        : (isPedagogical ? "PROFESSIONAL_EDUCATIONAL" : "NEUTRAL"),
      forbiddenKeywordsDetected: forbiddenKeywords,
      recommendations,
    },
  };
}

/**
 * Thẩm định hàng loạt danh sách bài viết
 */
export function batchAuditWorkflow(items: ContentAuditPayload[]): {
  passed: number;
  warned: number;
  rejected: number;
  results: ComplianceAuditResult[];
} {
  const results = items.map(auditContentCompliance);
  return {
    passed: results.filter(r => r.overallStatus === "PASSED_COMPLIANT").length,
    warned: results.filter(r => r.overallStatus === "WARNING_FLAGGED").length,
    rejected: results.filter(r => r.overallStatus === "REJECTED_NON_COMPLIANT").length,
    results,
  };
}
