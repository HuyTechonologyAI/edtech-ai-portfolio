#!/usr/bin/env bash
# ==============================================================================
# HUY TECHNOLOGY AI GROUP — SETUP 3 REVENUE PROJECTS ON NODE-01
# Target: Dell Precision M4800 (huy-node01 @ 100.79.240.108 / 192.168.1.230)
# Role: Authoritative Storage Anchor & Local AI Workforce Workspace
# Projects:
#   1. edtech-ai-portfolio (https://www.huycncdsai.io.vn)
#   2. SmartTeacherSchedule (https://www.gvcncdsai.io.vn)
#   3. smarttax-ai (https://smarttax-ai.vercel.app)
# Safety: /mnt/data2 is R4 PROTECTED (Untouched)
# ==============================================================================

set -euo pipefail

LOG_FILE="/mnt/data1/HUY-AI/logs/setup-3-projects-$(date +%Y%m%d-%H%M%S).log"
mkdir -p /mnt/data1/HUY-AI/logs
mkdir -p /mnt/data1/HUY-AI/staging
mkdir -p /mnt/data1/Projects

echo "==================================================================" | tee -a "$LOG_FILE"
echo "🚀 HUY AI CENTER — KÍCH HOẠT ĐỒNG BỘ 3 HỆ THỐNG DOANH THU" | tee -a "$LOG_FILE"
echo "Thời gian: $(date '+%Y-%m-%d %H:%M:%S %z')" | tee -a "$LOG_FILE"
echo "Máy chủ: $(hostname) (Tailscale: $(tailscale ip -4 2>/dev/null || echo '100.79.240.108'))" | tee -a "$LOG_FILE"
echo "==================================================================" | tee -a "$LOG_FILE"

# BƯỚC 1: Thu thập gói tệp và cấu hình từ Taildrop Inbox
echo "[BƯỚC 1/5] Thu thập tệp từ Taildrop Spool..." | tee -a "$LOG_FILE"
tailscale file get /mnt/data1/HUY-AI/staging || true

# BƯỚC 2: Đồng bộ Dự án 1 — edtech-ai-portfolio (huycncdsai.io.vn)
echo -e "\n[BƯỚC 2/5] Đồng bộ edtech-ai-portfolio (Tập đoàn & AdminCenter)..." | tee -a "$LOG_FILE"
TARGET_PORTFOLIO="/mnt/data1/Projects/edtech-ai-portfolio"
if [ -d "$TARGET_PORTFOLIO/.git" ]; then
  echo "  ✔ Thư mục đã tồn tại, đang fetch & pull main mới nhất..." | tee -a "$LOG_FILE"
  cd "$TARGET_PORTFOLIO"
  git pull origin main | tee -a "$LOG_FILE"
else
  echo "  📥 Đang clone từ https://github.com/HuyTechonologyAI/edtech-ai-portfolio.git..." | tee -a "$LOG_FILE"
  git clone https://github.com/HuyTechonologyAI/edtech-ai-portfolio.git "$TARGET_PORTFOLIO" | tee -a "$LOG_FILE"
fi

# BƯỚC 3: Đồng bộ Dự án 2 — SmartTeacherSchedule (gvcncdsai.io.vn)
echo -e "\n[BƯỚC 3/5] Đồng bộ SmartTeacherSchedule (EduViet Smart Teacher SaaS)..." | tee -a "$LOG_FILE"
TARGET_STS="/mnt/data1/Projects/SmartTeacherSchedule"
if [ -d "$TARGET_STS/.git" ]; then
  echo "  ✔ Thư mục đã tồn tại, đang fetch & pull main mới nhất..." | tee -a "$LOG_FILE"
  cd "$TARGET_STS"
  git pull origin main | tee -a "$LOG_FILE"
else
  echo "  📥 Đang clone từ https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI.git..." | tee -a "$LOG_FILE"
  git clone https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI.git "$TARGET_STS" | tee -a "$LOG_FILE"
fi

# BƯỚC 4: Đồng bộ Dự án 3 — smarttax-ai (smarttax-ai.vercel.app)
echo -e "\n[BƯỚC 4/5] Đồng bộ smarttax-ai (SmartTax AI Invoice Copilot)..." | tee -a "$LOG_FILE"
TARGET_TAX="/mnt/data1/Projects/smarttax-ai"
if [ -d "$TARGET_TAX/.git" ]; then
  echo "  ✔ Thư mục đã tồn tại, đang fetch & pull main mới nhất..." | tee -a "$LOG_FILE"
  cd "$TARGET_TAX"
  git pull origin main | tee -a "$LOG_FILE"
else
  echo "  📥 Đang clone từ https://github.com/hoalong08012019/smarttax-ai.git..." | tee -a "$LOG_FILE"
  git clone https://github.com/hoalong08012019/smarttax-ai.git "$TARGET_TAX" | tee -a "$LOG_FILE"
fi

# BƯỚC 5: Nạp cấu hình bảo mật .env.local từ staging (nếu có)
echo -e "\n[BƯỚC 5/5] Cài đặt cấu hình môi trường (.env.local)..." | tee -a "$LOG_FILE"
cd /mnt/data1/HUY-AI/staging
if [ -f "env-edtech-ai-portfolio.local" ]; then
  cp "env-edtech-ai-portfolio.local" "$TARGET_PORTFOLIO/.env.local"
  echo "  ✔ Đã thiết lập .env.local cho edtech-ai-portfolio" | tee -a "$LOG_FILE"
fi

if [ -f "env-SmartTeacherSchedule.local" ]; then
  mkdir -p "$TARGET_STS/landingpage"
  cp "env-SmartTeacherSchedule.local" "$TARGET_STS/landingpage/.env.local"
  echo "  ✔ Đã thiết lập .env.local cho SmartTeacherSchedule (landingpage)" | tee -a "$LOG_FILE"
fi

echo -e "\n==================================================================" | tee -a "$LOG_FILE"
echo "✔ HOÀN TẤT ĐỒNG BỘ 3 HỆ THỐNG DOANH THU TRÊN TRẠM NODE-01!" | tee -a "$LOG_FILE"
echo "Danh mục dự án tại /mnt/data1/Projects/:" | tee -a "$LOG_FILE"
ls -ld /mnt/data1/Projects/* | tee -a "$LOG_FILE"
echo "==================================================================" | tee -a "$LOG_FILE"
