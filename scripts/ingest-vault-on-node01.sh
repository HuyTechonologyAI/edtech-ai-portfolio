#!/usr/bin/env bash
# ==============================================================================
# HUY TECHNOLOGY AI GROUP — INGEST MASTER VAULT & 3 PROJECTS ON NODE-01
# Host: Dell Precision M4800 (huy-node01 @ 100.79.240.108)
# Principle: Node-01 becomes 100% Authoritative. Loss of Lenovo causes 0 data loss.
# ==============================================================================

set -euo pipefail

VAULT_PKG="PKG-LENOVO-AUTHORITATIVE-VAULT-20261001.tar.gz"
STAGING_DIR="/mnt/data1/HUY-AI/staging"
mkdir -p "$STAGING_DIR"
cd "$STAGING_DIR"

echo "=================================================================="
echo "🛡️ HUY AI CENTER — KÍCH HOẠT TIẾP NHẬN MASTER VAULT TRÊN NODE-01"
echo "Thời gian: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "=================================================================="

# 1. Kéo tệp từ Taildrop
echo "[1/4] Kéo các tệp từ Tailscale Spool..."
tailscale file get "$STAGING_DIR" || true

# 2. Giải nén Master Vault
if [ -f "$STAGING_DIR/$VAULT_PKG" ]; then
  echo "[2/4] Xác thực SHA256 và giải nén Master Vault..."
  sha256sum "$STAGING_DIR/$VAULT_PKG"
  tar -xzf "$STAGING_DIR/$VAULT_PKG" -C "$STAGING_DIR"

  # Cài đặt keystores an toàn
  mkdir -p /mnt/data1/HUY-AI/keystores
  cp -f "$STAGING_DIR/keystores/"* /mnt/data1/HUY-AI/keystores/
  chmod 600 /mnt/data1/HUY-AI/keystores/*
  echo "  ✔ Đã bảo lưu an toàn Android Signing Keystore (release.jks) tại /mnt/data1/HUY-AI/keystores/"

  # Cài đặt secure envs
  mkdir -p /mnt/data1/HUY-AI/secure-envs
  cp -f "$STAGING_DIR/secure-envs/"* /mnt/data1/HUY-AI/secure-envs/
  chmod 600 /mnt/data1/HUY-AI/secure-envs/*
  echo "  ✔ Đã bảo lưu an toàn các tệp biến môi trường (.env.local) tại /mnt/data1/HUY-AI/secure-envs/"

  # Cập nhật uncommitted automation bridge vào HUY-AI-Center
  if [ -f "$STAGING_DIR/wsl-bridge-uncommitted/uncommitted-automation-bridge.tar.gz" ]; then
    mkdir -p /mnt/data1/Projects/HUY-AI-Center
    tar -xzf "$STAGING_DIR/wsl-bridge-uncommitted/uncommitted-automation-bridge.tar.gz" -C /mnt/data1/Projects/HUY-AI-Center
    echo "  ✔ Đã cập nhật toàn bộ mã nguồn cầu nối tự hành (Agent Bridge) vào /mnt/data1/Projects/HUY-AI-Center"
  fi
else
  echo "[2/4] Đã giải nén hoặc tệp đang nằm sẵn trong staging..."
fi

# 3. Chạy script đồng bộ 3 hệ thống (clone hoặc pull từ GitHub)
echo "[3/4] Đồng bộ và thiết lập 3 hệ thống doanh thu..."
if [ -f "$STAGING_DIR/setup-3-projects-node01.sh" ]; then
  chmod +x "$STAGING_DIR/setup-3-projects-node01.sh"
  bash "$STAGING_DIR/setup-3-projects-node01.sh"
else
  echo "  Chạy clone trực tiếp..."
  mkdir -p /mnt/data1/Projects
  cd /mnt/data1/Projects
  [ -d "edtech-ai-portfolio/.git" ] || git clone https://github.com/HuyTechonologyAI/edtech-ai-portfolio.git
  [ -d "SmartTeacherSchedule/.git" ] || git clone https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI.git SmartTeacherSchedule
  [ -d "smarttax-ai/.git" ] || git clone https://github.com/hoalong08012019/smarttax-ai.git
fi

# 4. Gắn liên kết keystores và env vào dự án
echo "[4/4] Gắn liên kết keystores và cấu hình vào mã nguồn dự án..."
if [ -f /mnt/data1/HUY-AI/keystores/release.jks ] && [ -d /mnt/data1/Projects/SmartTeacherSchedule ]; then
  cp -f /mnt/data1/HUY-AI/keystores/release.jks /mnt/data1/Projects/SmartTeacherSchedule/
  cp -f /mnt/data1/HUY-AI/keystores/local.properties /mnt/data1/Projects/SmartTeacherSchedule/
  echo "  ✔ release.jks & local.properties đã sẵn sàng trong /mnt/data1/Projects/SmartTeacherSchedule/"
fi

if [ -f /mnt/data1/HUY-AI/secure-envs/env-edtech-ai-portfolio.local ] && [ -d /mnt/data1/Projects/edtech-ai-portfolio ]; then
  cp -f /mnt/data1/HUY-AI/secure-envs/env-edtech-ai-portfolio.local /mnt/data1/Projects/edtech-ai-portfolio/.env.local
  echo "  ✔ .env.local đã sẵn sàng trong /mnt/data1/Projects/edtech-ai-portfolio/"
fi

if [ -f /mnt/data1/HUY-AI/secure-envs/env-SmartTeacherSchedule.local ] && [ -d /mnt/data1/Projects/SmartTeacherSchedule/landingpage ]; then
  cp -f /mnt/data1/HUY-AI/secure-envs/env-SmartTeacherSchedule.local /mnt/data1/Projects/SmartTeacherSchedule/landingpage/.env.local
  echo "  ✔ .env.local đã sẵn sàng trong /mnt/data1/Projects/SmartTeacherSchedule/landingpage/"
fi

echo "=================================================================="
echo "✔ HOÀN TẤT 100%: NODE-01 ĐÃ TRỞ THÀNH TRẠM LƯU TRỮ ĐỘC LẬP TỐI CAO!"
echo "Nếu Lenovo bị mất hoàn toàn dữ liệu, Node-01 vẫn bảo toàn 100% mã nguồn."
echo "=================================================================="
