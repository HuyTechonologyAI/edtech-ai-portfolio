"use client";

import { useState } from "react";
import { Award, Search, Plus, Trash2, Eye, Printer, Sparkles, Brain, CheckCircle2, AlertCircle, FileText, Download, RefreshCw } from "lucide-react";

export function CertificateManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>({
    completionRate: "92.4%",
    topCourse: "Master AI & Automation Thực Chiến",
    viralShares: 486,
    recommendations: [
      "💡 Gợi ý 1: Khóa học Master AI đang có tỷ lệ tốt nghiệp cực cao. Đề xuất mở thêm chuỗi hội thảo chuyên sâu 'Xây dựng Custom AI Agents' dành riêng cho tập sinh viên đã nhận chứng chỉ.",
      "⚠️ Tối ưu: Dữ liệu cho thấy module 'Prompt Engineering' có 30% học viên dừng lại ở bài tập cuối. Hãy gửi email tự động hóa đính kèm thư viện Prompt mẫu để thúc đẩy họ hoàn thành.",
      "🚀 Xu hướng phát triển: 68% sinh viên xuất khẩu file PDF chứng chỉ chọn chia sẻ lên LinkedIn. Hãy gắn thêm mã QR động trỏ về trang đăng ký khóa học tiếp theo ngay trên góc văn bằng.",
    ],
    lastUpdated: "Vừa xong",
  });

  // Dữ liệu mẫu danh sách chứng chỉ
  const [certificates, setCertificates] = useState([
    {
      id: "cert-1",
      studentName: "Nguyễn Văn Chuyên Gia",
      email: "chuyengia.nguyen@company.com",
      courseTitle: "Master AI & Automation Thực Chiến",
      serialNo: "ZENTRA-CERT-2026-F8A1B",
      issueDate: "13/05/2026",
      shares: "LinkedIn, Facebook",
      status: "verified",
    },
    {
      id: "cert-2",
      studentName: "Trần Thị Marketing",
      email: "tran.mkt@agency.vn",
      courseTitle: "Làm Chủ Prompt Engineering & Agentic AI",
      serialNo: "ZENTRA-CERT-2026-C9E42",
      issueDate: "11/05/2026",
      shares: "LinkedIn",
      status: "verified",
    },
    {
      id: "cert-3",
      studentName: "Lê Hoàng Lập Trình",
      email: "hoang.dev@techcorp.io",
      courseTitle: "Tự Động Hóa Doanh Nghiệp Chuyên Sâu (Make/n8n)",
      serialNo: "ZENTRA-CERT-2026-1A2B3",
      issueDate: "09/05/2026",
      shares: "Chưa chia sẻ",
      status: "verified",
    },
    {
      id: "cert-4",
      studentName: "Phạm CEO Doanh Nghiệp",
      email: "pham.ceo@business.vn",
      courseTitle: "Master AI & Automation Thực Chiến",
      serialNo: "ZENTRA-CERT-2026-8D7F9",
      issueDate: "05/05/2026",
      shares: "LinkedIn",
      status: "verified",
    },
  ]);

  // Form cấp chứng chỉ thủ công
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCourse, setNewCourse] = useState("Master AI & Automation Thực Chiến");

  const handleIssueManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.trim()) return;

    const hash = Math.abs((newStudent + newCourse).split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    const newCert = {
      id: `cert-${Date.now()}`,
      studentName: newStudent.trim(),
      email: newEmail.trim() || "hocvien@domain.com",
      courseTitle: newCourse,
      serialNo: `ZENTRA-CERT-2026-${hash.toString(16).toUpperCase().substring(0, 6)}`,
      issueDate: new Date().toLocaleDateString("vi-VN"),
      shares: "Mới cấp",
      status: "verified",
    };

    setCertificates([newCert, ...certificates]);
    setIsAdding(false);
    setNewStudent("");
    setNewEmail("");
  };

  const handleDelete = (id: string) => {
    setCertificates(certificates.filter((c) => c.id !== id));
  };

  const triggerAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysisResult({
        completionRate: "94.8%",
        topCourse: "Master AI & Automation Thực Chiến",
        viralShares: 512,
        recommendations: [
          "💡 Đề xuất Đột phá: Lượng học viên tốt nghiệp tăng 15% tuần qua. Hệ thống AI khuyến nghị tự động kích hoạt mã giảm giá 30% cho khóa học tiếp theo gửi thẳng vào email của họ sau 24h.",
          "🎯 Tối ưu Nội dung: Học viên đặc biệt yêu thích các video thực hành Zapier/Make. Hãy nhóm các video này thành một Playlist nổi bật trên trang chủ.",
          "🔥 Tăng trưởng Tự nhiên: Tỷ lệ nhấp chuột từ URL chia sẻ chứng chỉ trên LinkedIn đạt 4.2%. Khuyến nghị tiếp tục duy trì phông chữ hoàng gia và thiết kế sang trọng hiện tại.",
        ],
        lastUpdated: "Vừa cập nhật",
      });
    }, 2000);
  };

  const filteredCerts = certificates.filter((c) =>
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Khối Thống kê Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Tổng Số Chứng Chỉ Đã Cấp</div>
          <div className="text-4xl font-black text-foreground tracking-tight">{certificates.length + 1280}</div>
          <div className="text-[10px] text-secondary mt-2 flex items-center gap-1 font-bold">
            <span>↑ Tăng 12% so với tháng trước</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Tỷ Lệ Hoàn Thành Khóa Học</div>
          <div className="text-4xl font-black text-amber-400 tracking-tight">{aiAnalysisResult?.completionRate || "92.4%"}</div>
          <div className="text-[10px] text-foreground/50 mt-2">Dữ liệu phân tích tự động từ video tracking</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Lan Tỏa Thương Hiệu (Viral)</div>
          <div className="text-4xl font-black text-blue-400 tracking-tight">{aiAnalysisResult?.viralShares || 486}</div>
          <div className="text-[10px] text-foreground/50 mt-2">Lượt chia sẻ thành tích trên LinkedIn/FB</div>
        </div>
      </div>

      {/* Bộ Máy Phân Tích & Gợi Ý Khóa Học Tiếp Theo (Agentic AI Recommendations) */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border-2 border-secondary/30 bg-gradient-to-br from-surface via-surface/80 to-secondary/5 relative shadow-[0_0_30px_rgba(0,255,133,0.1)]">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-2xl flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-secondary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">AI Context Analytics Engine</h3>
                <span className="bg-secondary/20 text-secondary text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-secondary/30 uppercase tracking-wider">
                  Agentic AI
                </span>
              </div>
              <p className="text-xs text-foreground/60 mt-0.5">
                Tự động tối ưu hóa lộ trình đào tạo dựa trên số liệu thực tế học viên cày xong bài giảng
              </p>
            </div>
          </div>

          <button
            onClick={triggerAiAnalysis}
            disabled={isAnalyzing}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-black font-extrabold rounded-xl text-xs hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(0,255,133,0.3)] disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Đang đọc &amp; phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Kích hoạt AI Tối Ưu Chiến Lược</span>
              </>
            )}
          </button>
        </div>

        {/* Nội dung tư vấn chiến lược */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <span>🎯 Khuyến nghị Chiến lược Đào tạo &amp; Phát triển Khóa học:</span>
            <span className="text-[10px] text-foreground/40 font-normal lowercase italic">(Cập nhật: {aiAnalysisResult.lastUpdated})</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {aiAnalysisResult.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="p-4 bg-background/60 rounded-2xl border border-white/5 flex items-start gap-3 text-xs leading-relaxed text-foreground/80 hover:border-secondary/30 transition-colors">
                <span className="text-base leading-none select-none mt-0.5">✨</span>
                <p className="flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Khung Quản lý Sổ cái Chứng chỉ (Certificate Ledgers) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold">Danh sách Học viên Nhận bằng</h3>
            <p className="text-xs text-foreground/50">Tra cứu và kiểm soát toàn bộ văn bằng Tốt nghiệp hệ thống</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-foreground/40" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên, khóa học, Serial..."
                className="w-full pl-9 pr-4 py-2 bg-surface border border-white/5 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50"
              />
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-white/10 hover:border-secondary/40 text-foreground rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-secondary" />
              <span>Cấp tay</span>
            </button>
          </div>
        </div>

        {/* Form cấp tay */}
        {isAdding && (
          <div className="p-6 bg-surface/40 border border-white/10 rounded-3xl animate-fade-in space-y-4">
            <div className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-white/5 pb-3">
              <Award className="w-4 h-4" />
              <span>Cấp Chứng Chỉ Tốt Nghiệp Đặc Cách (Manual Issue)</span>
            </div>

            <form onSubmit={handleIssueManual} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-foreground/60 block mb-1">Tên Học viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Đối Tác"
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  className="w-full p-2.5 bg-background border border-white/5 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/50 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/60 block mb-1">Email liên lạc</label>
                <input
                  type="email"
                  placeholder="doitac@company.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-background border border-white/5 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/50 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/60 block mb-1">Chuyên đề Khóa học</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full p-2.5 bg-background border border-white/5 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/50 font-medium"
                >
                  <option value="Master AI & Automation Thực Chiến">Master AI &amp; Automation Thực Chiến</option>
                  <option value="Làm Chủ Prompt Engineering & Agentic AI">Làm Chủ Prompt Engineering &amp; Agentic AI</option>
                  <option value="Tự Động Hóa Doanh Nghiệp Chuyên Sâu (Make/n8n)">Tự Động Hóa Doanh Nghiệp Chuyên Sâu (Make/n8n)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface/80 rounded-xl text-xs font-medium text-foreground/60"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-secondary text-black font-bold rounded-xl text-xs hover:opacity-90 shadow-[0_0_15px_rgba(0,255,133,0.2)]"
                >
                  Phát hành Văn bằng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bảng Danh Sách */}
        <div className="border border-white/5 rounded-3xl overflow-hidden bg-surface/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-background/40 text-[11px] font-bold uppercase tracking-wider text-foreground/40">
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Khóa đào tạo</th>
                  <th className="p-4">Mã xác thực Hash</th>
                  <th className="p-4">Chia sẻ MXH</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-foreground/40">
                      Không tìm thấy văn bằng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-surface/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{cert.studentName}</div>
                        <div className="text-[10px] text-foreground/40 font-mono">{cert.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-surface border border-white/5 px-2.5 py-1 rounded-lg text-foreground/80 font-bold max-w-[200px] truncate block">
                          {cert.courseTitle}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[#8C6D23] font-bold text-[11px]">
                        {cert.serialNo}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          cert.shares.includes("LinkedIn") 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                            : "bg-surface text-foreground/40 border border-white/5"
                        }`}>
                          {cert.shares}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={`/certificate?course=${cert.courseTitle.includes("Prompt") ? "prompt" : "masterclass"}&name=${encodeURIComponent(cert.studentName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Xem văn bằng PDF"
                          className="inline-flex p-1.5 bg-surface hover:bg-secondary/20 hover:text-secondary rounded-lg text-foreground/70 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          title="Thu hồi / Xóa văn bằng"
                          className="p-1.5 bg-surface hover:bg-red-500/20 hover:text-red-400 rounded-lg text-foreground/70 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
