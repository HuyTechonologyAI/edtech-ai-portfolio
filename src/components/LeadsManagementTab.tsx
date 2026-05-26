"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Loader2, Calendar, ClipboardList, Laptop } from "lucide-react";

interface Lead {
  id: number;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  source: string;
  target_item_title: string | null;
  metadata: any;
  created_at: string;
}

export default function LeadsManagementTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [exporting, setExporting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Lọc danh sách Lead theo ô tìm kiếm và dropdown filter
  const filteredLeads = leads.filter((lead) => {
    const nameMatch = lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const emailMatch = lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = lead.phone_number?.includes(searchTerm) ?? false;
    const searchMatch = nameMatch || emailMatch || phoneMatch;

    const sourceMatch = sourceFilter === "ALL" || lead.source === sourceFilter;

    return searchMatch && sourceMatch;
  });

  // Trích xuất ngắn thông tin trình duyệt thiết bị
  const getBriefUserAgent = (ua: string) => {
    if (!ua) return "Chrome / Windows";
    if (ua.includes("iPhone")) return "Safari / iOS";
    if (ua.includes("Android")) return "Chrome / Android";
    if (ua.includes("Macintosh")) return "Safari / macOS";
    if (ua.includes("Windows")) return "Chrome / Windows";
    return "Web Browser";
  };

  // Xuất CSV chuẩn mã hóa Unicode tiếng Việt (có BOM để Excel mở không bị lỗi font)
  const handleExportCSV = () => {
    setExporting(true);
    try {
      if (filteredLeads.length === 0) {
        alert("Không có dữ liệu lead nào để xuất!");
        return;
      }

      const headers = ["Họ tên", "Email", "Số điện thoại", "Nguồn", "Tài nguyên quan tâm", "IP Client", "Thiết bị", "Ngày đăng ký"];
      const rows = filteredLeads.map((l) => [
        `"${l.full_name || ""}"`,
        `"${l.email}"`,
        `"${l.phone_number || ""}"`,
        `"${l.source}"`,
        `"${l.target_item_title || ""}"`,
        `"${l.metadata?.clientIp || ""}"`,
        `"${getBriefUserAgent(l.metadata?.userAgent || "")}"`,
        `"${new Date(l.created_at).toLocaleString("vi-VN")}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      
      // Bổ sung BOM để Excel mở hiển thị đúng tiếng Việt có dấu
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ZentraTech_Leads_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Tab Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-secondary" />
            <span>Danh Sách Leads Đăng Ký (CRM)</span>
          </h2>
          <p className="text-xs text-foreground/40 mt-1">
            Theo dõi, phân loại và lưu trữ thông tin khách hàng từ phễu tải Ebook và xem Video
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredLeads.length === 0}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-secondary text-black rounded-xl font-bold text-xs hover:shadow-[0_0_15px_rgba(0,255,133,0.3)] transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Xuất File Excel (CSV)</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-surface/40 p-4 rounded-2xl border border-white/5">
        {/* Search Input */}
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại..."
            className="w-full bg-background border border-border focus:border-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-foreground/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Dropdown filter */}
        <div className="sm:col-span-4 relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-background border border-border focus:border-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none transition-colors cursor-pointer appearance-none"
          >
            <option value="ALL">Tất cả các nguồn</option>
            <option value="DOWNLOAD_RESOURCE">Tải tài liệu (Ebook/Slide)</option>
            <option value="TRIAL_VIDEO">Xem video thử nghiệm</option>
            <option value="UNKNOWN">Nguồn không xác định</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
          <p className="text-xs text-foreground/40">Đang tải danh sách CRM...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl">
          <p className="text-xs text-foreground/45">Không có leads nào khớp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-surface/50 text-[10px] uppercase font-bold tracking-wider text-foreground/40">
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Thông tin liên lạc</th>
                <th className="p-4">Nguồn phễu</th>
                <th className="p-4">Tài nguyên quan tâm</th>
                <th className="p-4">Thông tin thiết bị / IP</th>
                <th className="p-4">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                  {/* Name */}
                  <td className="p-4 font-bold text-foreground">
                    {lead.full_name || <span className="text-foreground/30 italic">Chưa nhập tên</span>}
                  </td>

                  {/* Contact Info */}
                  <td className="p-4 space-y-0.5">
                    <p className="font-medium text-foreground">{lead.email}</p>
                    {lead.phone_number && (
                      <p className="text-[10px] text-secondary font-mono">{lead.phone_number}</p>
                    )}
                  </td>

                  {/* Source */}
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                        lead.source === "DOWNLOAD_RESOURCE"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {lead.source === "DOWNLOAD_RESOURCE" ? "📄 Tải Ebook" : "🎥 Video Trial"}
                    </span>
                  </td>

                  {/* Target item */}
                  <td className="p-4 font-medium text-foreground/80 max-w-[200px] truncate" title={lead.target_item_title || ""}>
                    {lead.target_item_title || "-"}
                  </td>

                  {/* Device / IP */}
                  <td className="p-4 space-y-0.5 text-foreground/60 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-foreground/30" />
                      <span>{getBriefUserAgent(lead.metadata?.userAgent)}</span>
                    </div>
                    {lead.metadata?.clientIp && (
                      <p className="font-mono text-foreground/30 pl-5">IP: {lead.metadata.clientIp}</p>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="p-4 text-foreground/50 space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-foreground/30" />
                      <span>{new Date(lead.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <p className="text-foreground/30 pl-4">{new Date(lead.created_at).toLocaleTimeString("vi-VN")}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
