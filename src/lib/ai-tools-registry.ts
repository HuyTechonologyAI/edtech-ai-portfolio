/**
 * Danh mục và Cấu hình kết nối 14 Công cụ AI Mã nguồn mở
 * Huy Technology AI Hub - Hệ thống điều phối AI đa phương tiện
 */

export interface OpenSourceAITool {
  id: string;
  name: string;
  category: "slide" | "image" | "video" | "voice" | "llm";
  categoryLabel: string;
  description: string;
  githubUrl: string;
  license: string;
  defaultEndpoint: string;
  status: "ready" | "connected" | "standby" | "local_only";
  recommendedRole: string;
  dockerCommand?: string;
  workflowSample?: string;
  supportedInput: string[];
  outputFormat: string;
}

export const OPEN_SOURCE_AI_TOOLS: OpenSourceAITool[] = [
  // --- Nhóm 1: Slide & Trình chiếu AI ---
  {
    id: "presenton",
    name: "Presenton",
    category: "slide",
    categoryLabel: "Tạo Slide PowerPoint",
    description: "Tạo bài trình chiếu từ prompt/tài liệu, dùng PPTX mẫu của trường làm template, xuất PPTX hoàn toàn chỉnh sửa được. Hỗ trợ Ollama, LM Studio, Gemini, OpenAI.",
    githubUrl: "https://github.com/presenton/presenton",
    license: "Apache-2.0",
    defaultEndpoint: "http://localhost:5000",
    status: "ready",
    recommendedRole: "Chủ lực tạo Slide PPTX cho Giáo viên & Trường học",
    dockerCommand: "docker run -d -p 5000:5000 presenton/presenton:latest",
    workflowSample: "SGK / PDF / Prompt -> AI Tóm tắt bài -> Presenton -> File .pptx chỉnh sửa được 100%",
    supportedInput: ["Văn bản", "Tài liệu PDF", "Template PPTX mẫu"],
    outputFormat: "Microsoft PowerPoint (.pptx)"
  },
  {
    id: "pptagent",
    name: "PPTAgent",
    category: "slide",
    categoryLabel: "AI Học Bố Cục Slide Mẫu",
    description: "Phân tích bài presentation tham chiếu của trường, học bố cục và phong cách rồi tạo bài mới. Tích hợp PPTEval đánh giá tính mạch lạc và thiết kế.",
    githubUrl: "https://github.com/ammadhh/pptagent",
    license: "Open Source",
    defaultEndpoint: "http://localhost:8000",
    status: "standby",
    recommendedRole: "Học phong cách slide chuẩn của đơn vị/trường học",
    workflowSample: "Upload slide mẫu của trường -> PPTAgent học phong cách -> Tự động sinh hàng loạt bài giảng đồng nhất giao diện",
    supportedInput: ["File PPTX mẫu", "Nội dung bài học mới"],
    outputFormat: "Slide chuẩn Style Guide (.pptx)"
  },
  {
    id: "slidev",
    name: "Slidev",
    category: "slide",
    categoryLabel: "Slide Lập trình & Kỹ thuật",
    description: "Tạo slide bằng Markdown, hỗ trợ Mermaid, LaTeX, syntax highlight, live code, Vue components, quay màn hình và xuất PDF/PPTX.",
    githubUrl: "https://github.com/slidevjs/slidev",
    license: "MIT",
    defaultEndpoint: "http://localhost:3030",
    status: "ready",
    recommendedRole: "Slide bài giảng Công nghệ, Cơ khí, Điện tử, CNC, AI & Lập trình",
    dockerCommand: "npx @slidev/cli slides.md",
    workflowSample: "Gemini / Ollama -> Markdown Slidev + Sơ đồ Mermaid -> Slidev Web Interactive / PDF",
    supportedInput: ["Markdown", "LaTeX Math", "Mermaid Diagram", "Code"],
    outputFormat: "Interactive Web Slide / PDF / PPTX"
  },
  {
    id: "marp",
    name: "Marp",
    category: "slide",
    categoryLabel: "Markdown sang PowerPoint Tức Thì",
    description: "Hệ thống siêu nhẹ chuyển đổi Markdown thành Slide HTML, PDF, PPTX hoặc hình ảnh. Hoạt động offline, hoàn toàn miễn phí.",
    githubUrl: "https://github.com/marp-team/marp",
    license: "MIT",
    defaultEndpoint: "cli",
    status: "ready",
    recommendedRole: "Bộ biên dịch Slide nhanh miễn phí cho toàn bộ hệ sinh thái",
    dockerCommand: "npx @marp-team/marp-cli slides.md --pptx",
    workflowSample: "AI Hub -> Sinh Markdown Marp -> Marp CLI -> PowerPoint .pptx tức thì",
    supportedInput: ["Markdown cú pháp Gaura / Marp"],
    outputFormat: "PPTX, PDF, HTML"
  },

  // --- Nhóm 2: Hình ảnh AI ---
  {
    id: "comfyui",
    name: "ComfyUI",
    category: "image",
    categoryLabel: "Thiết Kế Node Đa Phương Tiện",
    description: "Nền tảng node-based mạnh nhất để xây workflow AI tạo ảnh, video, audio và 3D. Hỗ trợ đầy đủ REST API để website gọi tự động.",
    githubUrl: "https://github.com/Comfy-Org/ComfyUI",
    license: "GPL-3.0",
    defaultEndpoint: "http://127.0.0.1:8188",
    status: "ready",
    recommendedRole: "Tự động sinh bộ 4 ảnh minh họa kỹ thuật (VD: Chu trình Nạp - Nén - Nổ - Xả)",
    dockerCommand: "docker run -d -p 8188:8188 --gpus all comfyui:latest",
    workflowSample: "Tên bài học -> AI sinh Prompt chi tiết -> ComfyUI API -> 4 Hình minh họa độ nét cao",
    supportedInput: ["Text Prompt", "Sơ đồ phác thảo", "Reference Image"],
    outputFormat: "PNG, WebP, SVG"
  },
  {
    id: "invokeai",
    name: "InvokeAI",
    category: "image",
    categoryLabel: "Studio Sáng Tạo Hình Ảnh WebUI",
    description: "Giao diện thân thiện trực quan cho người mới, hỗ trợ tạo ảnh, inpainting/outpainting và bảng vẽ canvas trực quan.",
    githubUrl: "https://github.com/invoke-ai/InvokeAI",
    license: "Apache-2.0",
    defaultEndpoint: "http://localhost:9090",
    status: "standby",
    recommendedRole: "Công cụ cho giáo viên và trợ lý tự chỉnh sửa ảnh bài giảng trực tiếp",
    supportedInput: ["Text Prompt", "Chổi quét Inpaint"],
    outputFormat: "PNG, JPEG"
  },

  // --- Nhóm 3: Video AI ---
  {
    id: "moneyprinterturbo",
    name: "MoneyPrinterTurbo",
    category: "video",
    categoryLabel: "Sản Xuất Video Tự Động Trọn Gói",
    description: "Nhận chủ đề hoặc kịch bản -> tự động viết script -> tạo voiceover -> tìm footage Pexels/Pixabay -> phụ đề -> nhạc nền -> render video HD MP4.",
    githubUrl: "https://github.com/harry0703/MoneyPrinterTurbo",
    license: "MIT",
    defaultEndpoint: "http://localhost:8501",
    status: "ready",
    recommendedRole: "Chủ lực sản xuất video bài giảng ngắn 3-5 phút tự động cho EduViet & mạng xã hội",
    dockerCommand: "docker run -d -p 8501:8501 moneyprinterturbo:latest",
    workflowSample: "Đề bài: 'Cấu tạo máy tiện CNC' -> Viết kịch bản -> Lồng tiếng -> Ghép footage -> Xuất MP4 HD",
    supportedInput: ["Chủ đề", "Kịch bản bài giảng", "Kho footage có sẵn"],
    outputFormat: "Video MP4 (16:9 hoặc 9:16)"
  },
  {
    id: "sadtalker",
    name: "SadTalker",
    category: "video",
    categoryLabel: "Avatar Giáo Viên AI Biết Nói",
    description: "Ghép 1 ảnh chân dung giáo viên + 1 file âm thanh bài giảng -> sinh video cử động môi, mắt, biểu cảm khuôn mặt chân thực.",
    githubUrl: "https://github.com/OpenTalker/SadTalker",
    license: "CC BY-NC 4.0",
    defaultEndpoint: "http://localhost:7860",
    status: "ready",
    recommendedRole: "Tạo trợ lý giáo viên ảo (AI Teacher) giảng bài ở góc slide",
    workflowSample: "Ảnh chân dung Chuyên gia + File đọc VietTTS -> Video thầy giáo AI giảng bài",
    supportedInput: ["Ảnh chân dung (JPG/PNG)", "Audio giọng đọc (WAV/MP3)"],
    outputFormat: "Video MP4 Avatar cử động"
  },
  {
    id: "wan21",
    name: "Wan2.1",
    category: "video",
    categoryLabel: "Mô Hình Video Generative Mở",
    description: "Model Text-to-Video & Image-to-Video mã nguồn mở. Bản 1.3B chạy mượt trên VRAM ~8GB (RTX 3060/4060 trở lên), tạo video chuyển động 5 giây.",
    githubUrl: "https://github.com/Wan-Video/Wan2.1",
    license: "Apache-2.0",
    defaultEndpoint: "http://localhost:7861",
    status: "standby",
    recommendedRole: "Biến hình minh họa kỹ thuật tĩnh thành video chuyển động mô phỏng cơ cấu",
    workflowSample: "Hình cơ cấu bánh răng tĩnh -> Wan2.1 -> Video 5s bánh răng quay ăn khớp",
    supportedInput: ["Ảnh minh họa tĩnh", "Prompt mô tả chuyển động"],
    outputFormat: "Video Clip MP4"
  },
  {
    id: "opensora",
    name: "Open-Sora",
    category: "video",
    categoryLabel: "Nghiên Cứu Video Điện Ảnh",
    description: "Dự án video generative mã nguồn mở cấp cao của HPC-AI Tech, hỗ trợ model 11B cho các hệ thống máy chủ GPU lớn.",
    githubUrl: "https://github.com/hpcaitech/Open-Sora",
    license: "Apache-2.0",
    defaultEndpoint: "http://localhost:7862",
    status: "local_only",
    recommendedRole: "Dành cho cấu hình Server GPU cao cấp khi mở rộng quy mô lớn",
    supportedInput: ["Prompt chi tiết"],
    outputFormat: "Video MP4 HD"
  },

  // --- Nhóm 4: Giọng nói & Âm thanh AI (TTS) ---
  {
    id: "viettts",
    name: "VietTTS",
    category: "voice",
    categoryLabel: "Giọng Đọc Tiếng Việt Chuyên Sâu",
    description: "Được phát triển chuyên biệt cho phát âm tiếng Việt chuẩn, hỗ trợ API tương thích OpenAI TTS (/v1/audio/speech), clone giọng đọc.",
    githubUrl: "https://github.com/dangvansam/viet-tts",
    license: "Apache-2.0",
    defaultEndpoint: "http://localhost:8080/v1/audio/speech",
    status: "ready",
    recommendedRole: "Ưu tiên số 1 cho đọc bài giảng, đọc slide và lồng tiếng video tiếng Việt",
    dockerCommand: "docker run -d -p 8080:8080 dangvansam/viet-tts:latest",
    workflowSample: "Nội dung slide -> VietTTS API -> File âm thanh MP3 giọng đọc truyền cảm chuẩn ngữ điệu Việt",
    supportedInput: ["Văn bản tiếng Việt", "Mẫu giọng đọc tham chiếu"],
    outputFormat: "Audio MP3 / WAV"
  },
  {
    id: "f5tts",
    name: "F5-TTS",
    category: "voice",
    categoryLabel: "Nhân Bản Giọng Đọc Đa Dạng",
    description: "Công nghệ Fast & Fluid Voice Cloning, hỗ trợ clone giọng nhanh chỉ với vài giây âm thanh mẫu, hỗ trợ nhiều người nói.",
    githubUrl: "https://github.com/SWivid/F5-TTS",
    license: "MIT",
    defaultEndpoint: "http://localhost:7863",
    status: "standby",
    recommendedRole: "Clone giọng đọc riêng của giáo viên để cá nhân hóa bài giảng",
    supportedInput: ["Đoạn ghi âm 5-10s", "Văn bản cần đọc"],
    outputFormat: "Audio WAV"
  },
  {
    id: "openvoice",
    name: "OpenVoice",
    category: "voice",
    categoryLabel: "Điều Khiển Cảm Xúc & Nhịp Điệu",
    description: "Kiểm soát sâu cảm xúc, trọng âm, nhịp độ và hỗ trợ cross-lingual voice cloning (giữ nguyên giọng khi đọc tiếng Anh/tiếng Việt).",
    githubUrl: "https://github.com/myshell-ai/OpenVoice",
    license: "MIT",
    defaultEndpoint: "http://localhost:7864",
    status: "standby",
    recommendedRole: "Lồng tiếng bài giảng ngoại ngữ và điều chỉnh cảm xúc kịch bản",
    supportedInput: ["Audio mẫu", "Văn bản đa ngôn ngữ"],
    outputFormat: "Audio MP3"
  },
  {
    id: "piper",
    name: "Piper TTS",
    category: "voice",
    categoryLabel: "TTS Siêu Nhẹ Chạy Offline",
    description: "TTS cực nhẹ, tối ưu hóa chạy trên Raspberry Pi, máy tính cá nhân không cần GPU rời, tốc độ phản hồi tính bằng mili-giây.",
    githubUrl: "https://github.com/OHF-Voice/piper1-gpl",
    license: "GPL-3.0",
    defaultEndpoint: "http://localhost:5500",
    status: "ready",
    recommendedRole: "Dự phòng đọc văn bản offline khi máy chủ không có mạng",
    supportedInput: ["Văn bản"],
    outputFormat: "Audio WAV tức thì"
  }
];
