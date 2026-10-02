import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  auditContentCompliance,
  batchAuditWorkflow,
  ComplianceAuditResult,
} from "./compliance-guard";

describe("Compliance Guard Engine (Pháp Luật VN & Chính Sách Nền Tảng)", () => {
  test("Cho phép bài viết giáo dục AI đạt chuẩn sư phạm và pháp luật (PASSED_COMPLIANT)", () => {
    const validPost = {
      title: "Ứng dụng AI Hỗ Trợ Giáo Viên Soạn Giáo Án Theo Công Văn 5512",
      content: "Hướng dẫn quý thầy cô ứng dụng mô hình AI Local trên máy chủ trường học để thiết kế hoạt động dạy học tích cực, phát triển năng lực học sinh theo chương trình GDPT 2018.",
      platform: "Facebook",
    };

    const result: ComplianceAuditResult = auditContentCompliance(validPost);

    assert.equal(result.overallStatus, "PASSED_COMPLIANT");
    assert.equal(result.riskScore, 0);
    assert.equal(result.lawCompliance.passed, true);
    assert.equal(result.platformCompliance.passed, true);
    assert.equal(result.contentSuitability.isPedagogical, true);
    assert.equal(result.contentSuitability.tone, "PROFESSIONAL_EDUCATIONAL");
    assert.match(result.digitalSeal, /^SEAL-[0-9A-F]{16}$/);
    assert.equal(result.lawCompliance.violations.length, 0);
  });

  test("Chặn ngay lập tức bài viết chứa cờ bạc, cá độ hoặc lừa đảo tài chính (REJECTED_NON_COMPLIANT)", () => {
    const maliciousPost = {
      title: "Tham gia cá độ bóng đá và game bài đổi thưởng uy tín",
      content: "Kiếm tiền nhanh mỗi ngày nổ hũ nhận quà liền tay không cần làm việc.",
      platform: "TikTok",
    };

    const result: ComplianceAuditResult = auditContentCompliance(maliciousPost);

    assert.equal(result.overallStatus, "REJECTED_NON_COMPLIANT");
    assert.ok(result.riskScore >= 45, "Risk score must be high for illegal gambling keywords");
    assert.equal(result.lawCompliance.passed, false);
    assert.ok(result.lawCompliance.violations.some(v => v.includes("Luật An ninh mạng 2018")));
  });

  test("Chặn hành vi phi sư phạm, bạo lực học đường (REJECTED_NON_COMPLIANT)", () => {
    const antiEduPost = {
      title: "Phương pháp dạy học sinh bằng roi vọt và trừng phạt",
      content: "Cách xử lý học sinh ngu dốt trong lớp học một cách nghiêm khắc.",
      platform: "Facebook",
    };

    const result = auditContentCompliance(antiEduPost);

    assert.equal(result.overallStatus, "REJECTED_NON_COMPLIANT");
    assert.equal(result.lawCompliance.passed, false);
    assert.ok(result.lawCompliance.violations.some(v => v.includes("Thông tư 06/2019/TT-BGDĐT")));
  });

  test("Cảnh báo khi vi phạm chính sách mồi tương tác của Meta (WARNING_FLAGGED)", () => {
    const baitPost = {
      title: "Tài liệu giáo án AI cực hay cho giáo viên",
      content: "Các thầy cô hãy share bài ngay để nhận lộc và bình luận bên dưới nhé.",
      platform: "Facebook",
    };

    const result = auditContentCompliance(baitPost);

    assert.equal(result.overallStatus, "WARNING_FLAGGED");
    assert.ok(result.riskScore > 0 && result.riskScore < 50);
    assert.equal(result.platformCompliance.passed, false);
    assert.ok(result.platformCompliance.violations.some(v => v.includes("Meta Engagement Bait Policy")));
  });

  test("Thẩm định hàng loạt (batchAuditWorkflow) phân loại chính xác số lượng", () => {
    const items = [
      {
        title: "STEM AI cho học sinh THPT",
        content: "Giáo viên hướng dẫn học sinh lập trình robot mini.",
        platform: "Website Hub",
      },
      {
        title: "Tài xỉu online hoàn tiền 100%",
        content: "Nạp tiền cá cược nhận thưởng.",
        platform: "TikTok",
      },
      {
        title: "Khóa học AI 39k",
        content: "Share bài ngay để nhận lộc giảm giá.",
        platform: "Facebook",
      },
    ];

    const batch = batchAuditWorkflow(items);

    assert.equal(batch.passed, 1);
    assert.equal(batch.rejected, 1);
    assert.equal(batch.warned, 1);
    assert.equal(batch.results.length, 3);
  });
});
