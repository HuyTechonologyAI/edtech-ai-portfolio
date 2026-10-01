// ==============================================================================
// HUY AI CENTER × EDUVIET — SKILL PACK & CONTEXT MATERIALIZATION
// Generates .ai-agency/skills/education/EDU-00 .. EDU-17 and context frameworks
// ==============================================================================

import fs from "fs";
import path from "path";

const baseDir = path.resolve(process.cwd(), ".ai-agency");

const dirs = [
  path.join(baseDir, "context", "education"),
  path.join(baseDir, "state"),
  path.join(baseDir, "workstreams", "education-generation"),
];

for (const d of dirs) {
  fs.mkdirSync(d, { recursive: true });
}

// 1. Context Files
const productContext = `# EDUCATION PRODUCT CONTEXT — EDUVIET & HUY AI CENTER
Product: EduViet / Smart Teacher Schedule AI
Source app: gvcncdsai.io.vn
Control plane: HUY AI Center (https://www.huycncdsai.io.vn/admincenter)
Organization: org-02-aischool
Language: Vietnamese first
Primary actors: Teacher (Giáo viên), Student (Học sinh)
Primary outputs:
- Lesson Plan (Kế hoạch bài dạy)
- Slides (Kịch bản trình chiếu)
- Mindmap (Sơ đồ tư duy)
- Mini Game (Bộ câu hỏi tương tác)
Standards:
- 5512: Công văn 5512/BGDĐT-GDTrH (Chương trình GDPT 2018 phổ thông)
- 2634: Công văn 2634/GDNN (Giáo dục nghề nghiệp, thực hành xưởng)
`;

const educationPolicy = `# EDUCATION POLICY — CANONICAL RULES
1. Grounding: Tất cả định nghĩa, công thức, thông số kỹ thuật phải bám sát tài liệu bài giảng hoặc giáo trình chuẩn.
2. Structure 5512: Phải chia đủ 4 hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng) với 2 cột (Tổ chức thực hiện 4 bước & Sản phẩm dự kiến).
3. Structure 2634: Phải thể hiện quy trình thao tác mẫu 3 lần của giáo viên, an toàn ATLĐ, quy cách phôi và vệ sinh 5S.
4. Consistency: Mục tiêu bài dạy, slide, sơ đồ tư duy và mini game phải đồng nhất 100% về thuật ngữ và nội dung.
5. Privacy: Dữ liệu học sinh mặc định KHÔNG được dùng để huấn luyện mô hình (consent_learning_use = false).
`;

const educationBridgeState = {
  schema_version: "1.0",
  status: "ACTIVE",
  source_app: "eduviet",
  control_plane: "huy-ai-center",
  queue: "pgmq.ai-jobs",
  organization_id: "org-02-aischool",
  supported_request_types: [
    "LESSON_PACKAGE",
    "LESSON_PLAN",
    "SLIDES",
    "MINDMAP",
    "MINI_GAME",
    "QUESTION_BANK",
    "WORKSHEET",
    "RUBRIC",
    "VIDEO_SCRIPT",
    "TEACHER_ASSIST",
    "STUDENT_TUTOR"
  ],
  supported_output_types: [
    "LESSON_PLAN",
    "SLIDES",
    "MINDMAP",
    "MINI_GAME"
  ],
  active_workers: [
    {
      id: "WORKER-L3-DEV-01",
      role: "Node01 Education Execution Worker",
      node: "huy-ai-node-01",
      model: "qwen2.5-coder:3b",
      status: "ONLINE"
    }
  ],
  last_verified_e2e: new Date().toISOString(),
  last_schema_version: "1.0.0",
  known_issues: [],
  next_actions: ["CONTINUOUS_OBSERVABILITY", "MONITOR_QUEUED_TASKS"]
};

fs.writeFileSync(path.join(baseDir, "context", "education", "EDUCATION_PRODUCT_CONTEXT.md"), productContext);
fs.writeFileSync(path.join(baseDir, "context", "education", "EDUCATION_POLICY.md"), educationPolicy);
fs.writeFileSync(path.join(baseDir, "state", "EDUCATION_BRIDGE_STATE.json"), JSON.stringify(educationBridgeState, null, 2));

// 2. Skills EDU-00 .. EDU-17
const skills = [
  { id: "EDU-00_REQUEST_ROUTER", name: "Education Request Router", desc: "Biến yêu cầu EduViet thành TaskContract chuẩn thuộc org-02-aischool." },
  { id: "EDU-01_SOURCE_VALIDATOR", name: "Education Source Validator", desc: "Kiểm định nguồn tài liệu giáo viên upload, ưu tiên nguồn chính thống." },
  { id: "EDU-02_LESSON_BLUEPRINT_PLANNER", name: "Lesson Blueprint Planner", desc: "Tạo cấu trúc cốt lõi duy nhất (Single Source of Truth) cho bài dạy." },
  { id: "EDU-03_LESSON_PLAN_5512", name: "Lesson Plan 5512 Builder", desc: "Soạn kế hoạch bài dạy chuẩn CV 5512/BGDĐT 4 hoạt động 2 cột." },
  { id: "EDU-04_LESSON_PLAN_2634", name: "Lesson Plan 2634 Builder", desc: "Soạn giáo án thực hành xưởng nghề nghiệp chuẩn CV 2634/GDNN thao tác mẫu 3 lần." },
  { id: "EDU-05_SLIDE_CONTENT_ARCHITECT", name: "Slide Content Architect", desc: "Thiết kế kịch bản slide theo nguyên tắc 1 slide = 1 thông điệp giảng dạy." },
  { id: "EDU-06_SLIDE_ARTIFACT_BUILDER", name: "Slide Artifact Builder", desc: "Biên dịch cấu trúc Slide JSON thành bản trình chiếu PPTX và preview." },
  { id: "EDU-07_MINDMAP_BUILDER", name: "Mindmap Builder", desc: "Biên dịch cấu trúc bài học thành sơ đồ tư duy dạng Mermaid SVG / PNG." },
  { id: "EDU-08_MINIGAME_DESIGNER", name: "MiniGame Designer", desc: "Thiết kế bộ câu hỏi tương tác trắc nghiệm có đáp án, số liệu và lời giải chi tiết." },
  { id: "EDU-09_PEDAGOGICAL_QA", name: "Pedagogical QA", desc: "Kiểm tra tính hợp lý sư phạm, thời lượng, phân bổ độ khó nhận thức." },
  { id: "EDU-10_FACT_SOURCE_QA", name: "Fact Source QA", desc: "Kiểm tra tính chính xác của dữ kiện, công thức đối chiếu với nguồn, chống hallucination." },
  { id: "EDU-11_CROSS_ARTIFACT_QA", name: "Cross-Artifact QA", desc: "Đảm bảo tính nhất quán chéo giữa Giáo án, Slide, Sơ đồ tư duy và Mini game." },
  { id: "EDU-12_ARTIFACT_PACKAGER", name: "Artifact Packager", desc: "Đóng gói toàn bộ sản phẩm giáo dục thành Manifest chuẩn sẵn sàng giao cho EduViet." },
  { id: "EDU-13_USER_FEEDBACK_CURATOR", name: "User Feedback Curator", desc: "Chuyển hóa đánh giá và phản hồi của giáo viên thành tín hiệu học tập cho hệ thống." },
  { id: "EDU-14_LEARNING_DATA_GOVERNOR", name: "Learning Data Governor", desc: "Quản trị vòng đời dữ liệu huấn luyện: lọc PII, gán nhãn, bảo vệ quyền riêng tư." },
  { id: "EDU-15_STUDENT_DATA_GUARD", name: "Student Data Guard", desc: "Bảo vệ tuyệt đối thông tin học sinh, không tự ý đưa dữ liệu học sinh vào dataset huấn luyện." },
  { id: "EDU-16_EDUCATION_CONTEXT_HYDRATOR", name: "Education Context Hydrator", desc: "Nạp ngữ cảnh sư phạm theo cấu trúc phân tầng trước khi suy luận AI." },
  { id: "EDU-17_EDUCATION_RECOVERY", name: "Education Recovery", desc: "Cơ chế tự phục hồi, tiếp tục chạy từ checkpoint đã đạt mà không cần tạo lại từ đầu." },
];

for (const s of skills) {
  const skillFolder = path.join(baseDir, "skills", "education", s.id);
  fs.mkdirSync(skillFolder, { recursive: true });
  const content = `---
name: ${s.id}
description: ${s.desc}
version: 1.0.0
organization: org-02-aischool
author: HUY AI Center
---

# ${s.name} (${s.id})

## Mục tiêu
${s.desc}

## Quy tắc thực thi
- Tổ chức quản lý: \`org-02-aischool\`
- Protocol: HAIP / A2A
- Tuân thủ \`SYSTEM_CONSTITUTION.md\` và \`EDUCATION_POLICY.md\`
`;
  fs.writeFileSync(path.join(skillFolder, "SKILL.md"), content);
}

console.log(`✅ Đã khởi tạo hoàn tất ${skills.length} Education Skills và Context Framework tại .ai-agency/`);
