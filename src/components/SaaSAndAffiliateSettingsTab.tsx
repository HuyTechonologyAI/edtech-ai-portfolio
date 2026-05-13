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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.saas_tiers) setSaasTiers(data.settings.saas_tiers);
        if (data.settings.affiliate_config) setAffiliateConfig(data.settings.affiliate_config);
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

      // Lưu đệm ngầm vào localStorage để frontend pricing/affiliate có thể tải lại nếu cần
      localStorage.setItem("custom_saas_tiers", JSON.stringify(saasTiers));
      localStorage.setItem("custom_affiliate_config", JSON.stringify(affiliateConfig));

      setSaveMessage("🎉 Đã lưu cấu hình Bảng giá & Tỷ lệ Affiliate thành công trên toàn hệ thống!");
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

    </div>
  );
}
