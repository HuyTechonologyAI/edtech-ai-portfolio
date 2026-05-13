"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const refCode = searchParams.get("ref");
      if (refCode) {
        const cleanRef = refCode.trim().toUpperCase();
        
        // 1. Lưu trữ dài hạn vào LocalStorage
        localStorage.setItem("zentra_referral_code", cleanRef);
        
        // 2. Lưu trữ song song vào HTTP Cookie với vòng đời 30 ngày (2592000 giây)
        document.cookie = `zentra_ref=${cleanRef}; path=/; max-age=2592000; SameSite=Lax`;
        
        console.log(`[Affiliate Engine] Đã ghi nhận Attribution Cookie cho đối tác: ${cleanRef}`);
      }
    } catch (e) {
      // Silent error handler
    }
  }, [searchParams]);

  return null; // Component chạy ngầm hoàn toàn vô hình
}
