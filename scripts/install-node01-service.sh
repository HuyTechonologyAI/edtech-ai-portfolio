#!/usr/bin/env bash
# =============================================================================
# HUY AI CENTER — SYSTEMD SERVICE INSTALLER FOR NODE-01 (24/7 AUTONOMOUS)
# =============================================================================
# Run on Node-01:
#   sudo bash /mnt/data1/Projects/HUY-AI-Center/scripts/install-node01-service.sh
# =============================================================================

set -euo pipefail

SERVICE_PATH="/etc/systemd/system/huy-ai-worker.service"
WORKER_SCRIPT="/mnt/data1/Projects/HUY-AI-Center/scripts/node01-worker-v1.1.sh"
PROJECT_DIR="/mnt/data1/Projects/HUY-AI-Center"

echo "[1/4] Ensuring executable permissions on worker script..."
chmod +x "$WORKER_SCRIPT"
mkdir -p /mnt/data1/HUY-AI /mnt/data1/Projects/HUY-AI-Center/.agent-worktrees

echo "[2/4] Generating systemd service unit at ${SERVICE_PATH}..."
cat << 'EOF' | sudo tee "$SERVICE_PATH" > /dev/null
[Unit]
Description=HUY AI Center 24/7 Autonomous Node-01 Worker
After=network.target

[Service]
Type=simple
User=huy
WorkingDirectory=/mnt/data1/Projects/HUY-AI-Center
Environment=SUPERVISOR_URL=https://www.huycncdsai.io.vn
Environment=WORKER_ID=NODE01-QWEN32B
Environment=OLLAMA_MODEL=qwen2.5-coder:32b
Environment=OLLAMA_URL=http://localhost:11434
Environment=POLL_INTERVAL=15
ExecStart=/bin/bash /mnt/data1/Projects/HUY-AI-Center/scripts/node01-worker-v1.1.sh
Restart=always
RestartSec=5
StandardOutput=append:/mnt/data1/HUY-AI/worker.log
StandardError=append:/mnt/data1/HUY-AI/worker.log

[Install]
WantedBy=multi-user.target
EOF

echo "[3/4] Reloading systemd daemon and enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable huy-ai-worker.service

echo "[4/4] Starting 24/7 autonomous worker service..."
sudo systemctl restart huy-ai-worker.service

echo "================================================================="
echo "✅ HUY AI WORKER 24/7 SERVICE INSTALLED & ACTIVATED!"
echo "Status check:  sudo systemctl status huy-ai-worker.service"
echo "Live logs:     tail -f /mnt/data1/HUY-AI/worker.log"
echo "================================================================="
