"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, RefreshCw, Layers, DollarSign, Award, Clock, Sparkles } from "lucide-react";

interface SaaSPlan {
  id: string;
  name: string;
  target: string;
  priceMonthly: number;
  priceYearly: number;
  desc: string;
}

interface AffiliateConfig {
  commissionPercent: number;
  bonusPointsPerReferral: number;
  cookieDurationDays: number;
}

export default function SaaSAndAffiliateSettingsTab() {
  const [saasTiers, setSaasTiers] = useState<SaaSPlan[]>([]);
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>({
    commissionPercent: 30,
    bonusPointsPerReferral: 500,
    cookieDurationDays: 30
  });

  // State cấu hình bảng đối chiếu So sánh Đặc quyền
  const [matrixFeatures, setMatrixFeatures] = useState<any[]>([
    { name: "Xem trước Tài liệu", free: "5 trang đầu", pro: "Không giới hạn", enterprise: "Không giới hạn" },
    { name: "Tải tài nguyên Ebook/Slide Premium", free: false, pro: true, enterprise: true },
    { name: "Truy cập Kho Prompt chuyên sâu", free: false, pro: true, enterprise: true },
    { name: "Tải kịch bản JSON Make.com / n8n", free: false, pro: false, enterprise: true },
    { name: "Tốc độ Tích lũy Point Gamification", free: "Tiêu chuẩn (x1)", pro: "Nhanh (x2)", enterprise: "Siêu tốc (x5)" },
    { name: "Cập nhật bài giảng mới định kỳ", free: "Hạn chế", pro: "Miễn phí liên tục", enterprise: "Miễn phí liên tục" },
    { name: "Hỗ trợ Kỹ thuật & Cố vấn", free: "Cộng đồng", pro: "Kênh riêng", enterprise: "Trực tiếp 1-1" }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ưu tiên nạp cấu hình ghi đè từ LocalStorage trước để giữ nguyên trạng thái Admin đã lưu
      const cachedTiers = localStorage.getItem("custom_saas_tiers");
      const cachedAff = localStorage.getItem("custom_affiliate_config");
      const cachedMatrix = localStorage.getItem("custom_matrix_features");

      let hasCache = false;
      if (cachedTiers) {
        try { setSaasTiers(JSON.parse(cachedTiers)); hasCache = true; } catch {}
      }
      if (cachedAff) {
        try { setAffiliateConfig(JSON.parse(cachedAff)); hasCache = true; } catch {}
      }
      if (cachedMatrix) {
        try { setMatrixFeatures(JSON.parse(cachedMatrix)); hasCache = true; } catch {}
      }

      // Nếu chưa có dữ liệu đệm, nạp từ Server API
      if (!hasCache) {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.saas_tiers) setSaasTiers(data.settings.saas_tiers);
          if (data.settings.affiliate_config) setAffiliateConfig(data.settings.affiliate_config);
          if (data.settings.matrix_features) setMatrixFeatures(data.settings.matrix_features);
        }
      }
    } catch (err) {
      console.error("Lỗi nạp cấu hình:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdateTier = (index: number, key: keyof SaaSPlan, val: any) => {
    const updated = [...saasTiers];
    updated[index] = { ...updated[index], [key]: val };
    setSaasTiers(updated);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 1. Lưu Tiers
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_name: "saas_tiers", setting_value: saasTiers })
      });

      // 2. Lưu Affiliate Config
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_name: "affiliate_config", setting_value: affiliateConfig })
      });

      // 3. Lưu Matrix Features
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_name: "matrix_features", setting_value: matrixFeatures })
      });

      // Lưu đệm ngầm vào localStorage để frontend pricing/affiliate có thể tải lại ngay lập tức
      localStorage.setItem("custom_saas_tiers", JSON.stringify(saasTiers));
      localStorage.setItem("custom_affiliate_config", JSON.stringify(affiliateConfig));
      localStorage.setItem("custom_matrix_features", JSON.stringify(matrixFeatures));

      setSaveMessage("🎉 Đã lưu cấu hình Bảng giá, Affiliate & Bảng đối chiếu đặc quyền thành công!");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveMessage("⚠️ Đã lưu cấu hình đệm (Yêu cầu chạy SQL bảng cms_settings để lưu vĩnh viễn)");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/30 p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-secondary">
            <Layers className="w-5 h-5" />
            <span>Cấu Hình Bảng Giá SaaS &amp; Tiếp Thị Liên Kết</span>
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Mọi thay đổi tại đây sẽ trực tiếp điều chỉnh thông số hiển thị ngoài frontend mà không cần sửa code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-black rounded-xl font-bold text-xs hover:bg-secondary/90 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Đang đồng bộ..." : "Lưu Cấu Hình"}</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold rounded-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* CỘT 1: Quản Lý Bảng Giá Các Gói SaaS */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>💎 1. Tùy Chỉnh Giá Các Gói Dịch Vụ (`/pricing`)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {saasTiers.map((tier, idx) => (
            <div key={tier.id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-secondary uppercase tracking-wider">{tier.name}</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-foreground/40">{tier.id}</span>
              </div>

              {/* Tên gói hiển thị */}
              <div>
                <label className="block text-[11px] font-medium text-foreground/60 mb-1">Tên nhãn / Tiêu đề:</label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => handleUpdateTier(idx, "name", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg p-2 text-xs text-foreground font-bold focus:border-secondary transition-all"
                />
              </div>

              {/* Nhãn khách hàng mục tiêu */}
              <div>
                <label className="block text-[11px] font-medium text-foreground/60 mb-1">Đối tượng mục tiêu:</label>
                <input
                  type="text"
                  value={tier.target || ""}
                  onChange={(e) => handleUpdateTier(idx, "target", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg p-2 text-xs text-foreground focus:border-secondary transition-all"
                />
              </div>

              {/* Giá tháng */}
              <div>
                <label className="block text-[11px] font-medium text-foreground/60 mb-1">Giá Hàng Tháng (VNĐ):</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-foreground/40 font-mono">đ</span>
                  <input
                    type="number"
                    value={tier.priceMonthly}
                    onChange={(e) => handleUpdateTier(idx, "priceMonthly", Number(e.target.value))}
                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-xs font-mono font-bold text-secondary focus:border-secondary transition-all"
                  />
                </div>
              </div>

              {/* Giá năm */}
              <div>
                <label className="block text-[11px] font-medium text-foreground/60 mb-1">Giá Hàng Năm (VNĐ):</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-foreground/40 font-mono">đ</span>
                  <input
                    type="number"
                    value={tier.priceYearly}
                    onChange={(e) => handleUpdateTier(idx, "priceYearly", Number(e.target.value))}
                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-xs font-mono font-bold text-amber-400 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block text-[11px] font-medium text-foreground/60 mb-1">Mô tả ngắn gọn:</label>
                <textarea
                  value={tier.desc}
                  onChange={(e) => handleUpdateTier(idx, "desc", e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-white/10 rounded-lg p-2 text-xs text-foreground/80 focus:border-secondary transition-all resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT 2: Quản Lý Cấu Hình Affiliate MMO */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>🤝 2. Thiết Lập Tham Số Tiếp Thị Liên Kết (`/affiliate`)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tỷ lệ Hoa hồng */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Tỷ Lệ Hoa Hồng Tiền Mặt (%)</span>
            </label>
            <p className="text-[11px] text-foreground/50">Phần trăm trích xuất tự động gạch nợ cho đối tác giới thiệu khi đơn hàng SUCCESS.</p>
            
            <div className="pt-2">
              <input
                type="number"
                value={affiliateConfig.commissionPercent}
                onChange={(e) => setAffiliateConfig({ ...affiliateConfig, commissionPercent: Number(e.target.value) })}
                className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-sm font-mono font-bold text-amber-400 focus:border-secondary transition-all"
              />
            </div>
          </div>

          {/* Điểm thưởng Point */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Thưởng Gamification (Points)</span>
            </label>
            <p className="text-[11px] text-foreground/50">Số lượng điểm thưởng cộng thẳng vào tài khoản của đối tác trên mỗi lượt giới thiệu.</p>
            
            <div className="pt-2">
              <input
                type="number"
                value={affiliateConfig.bonusPointsPerReferral}
                onChange={(e) => setAffiliateConfig({ ...affiliateConfig, bonusPointsPerReferral: Number(e.target.value) })}
                className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-sm font-mono font-bold text-orange-400 focus:border-secondary transition-all"
              />
            </div>
          </div>

          {/* Vòng đời Cookie */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Vòng Đời Lưu Vết (Days)</span>
            </label>
            <p className="text-[11px] text-foreground/50">Thời hạn duy trì Attribution Cookie trên trình duyệt của khách ghé thăm website.</p>
            
            <div className="pt-2">
              <input
                type="number"
                value={affiliateConfig.cookieDurationDays}
                onChange={(e) => setAffiliateConfig({ ...affiliateConfig, cookieDurationDays: Number(e.target.value) })}
                className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-sm font-mono font-bold text-cyan-400 focus:border-secondary transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CỘT 3: Quản Lý Bảng Đối Chiếu So Sánh Đặc Quyền */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>📊 3. Bảng Đối Chiếu So Sánh Đặc Quyền Chi Tiết</span>
          </h3>
          <p className="text-xs text-foreground/50 mt-1">
            Chỉnh sửa trực tiếp tên tính năng và giá trị quyền lợi của từng gói (nhập &quot;true&quot;/&quot;false&quot; để hiển thị dấu ✔️ hoặc dấu - bị khóa).
          </p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-surface/50">
                <th className="p-3 font-bold text-foreground/60 w-2/5">Tên Hạng Mục / Tính Năng</th>
                <th className="p-3 font-bold text-center text-foreground/80 w-1/5">Free Member</th>
                <th className="p-3 font-bold text-center text-secondary w-1/5">Pro Creator</th>
                <th className="p-3 font-bold text-center text-amber-400 w-1/5">Enterprise Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matrixFeatures.map((row, rIdx) => {
                const renderInput = (colKey: "free" | "pro" | "enterprise") => {
                  const val = row[colKey];
                  const isBool = typeof val === "boolean";
                  const strVal = isBool ? (val ? "true" : "false") : String(val ?? "");
                  return (
                    <input 
                      type="text"
                      value={strVal}
                      onChange={(e) => {
                        const inVal = e.target.value;
                        let finalVal: any = inVal;
                        if (inVal.toLowerCase() === "true") finalVal = true;
                        if (inVal.toLowerCase() === "false") finalVal = false;
                        
                        const updated = [...matrixFeatures];
                        updated[rIdx] = { ...updated[rIdx], [colKey]: finalVal };
                        setMatrixFeatures(updated);
                      }}
                      className="w-full text-center bg-surface/80 border border-white/5 hover:border-white/20 focus:border-secondary rounded px-2 py-1.5 font-medium transition-all text-xs"
                    />
                  );
                };

                return (
                  <tr key={rIdx} className="hover:bg-white/5">
                    <td className="p-2.5">
                      <input 
                        type="text"
                        value={row.name}
                        onChange={(e) => {
                          const updated = [...matrixFeatures];
                          updated[rIdx] = { ...updated[rIdx], name: e.target.value };
                          setMatrixFeatures(updated);
                        }}
                        className="w-full bg-surface/80 border border-white/5 hover:border-white/20 focus:border-secondary rounded px-2 py-1.5 font-bold text-foreground/90 transition-all text-xs"
                      />
                    </td>
                    <td className="p-2.5 text-center">{renderInput("free")}</td>
                    <td className="p-2.5 text-center">{renderInput("pro")}</td>
                    <td className="p-2.5 text-center">{renderInput("enterprise")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
