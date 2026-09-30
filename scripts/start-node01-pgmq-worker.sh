#!/usr/bin/env bash
# ==============================================================================
# HUY TECHNOLOGY AI GROUP — NODE-01 OUTBOUND PGMQ WORKER LAUNCHER
# Host: Dell Precision M4800 (huy-ai-node-01 @ 100.79.240.108)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="/mnt/data1/HUY-AI/logs"
LOG_FILE="${LOG_DIR}/pgmq-worker-$(date +%Y%m%d).log"

mkdir -p "$LOG_DIR"

echo "=================================================================="
echo "⚡ Khởi chạy Node-01 Outbound PGMQ Worker Daemon..."
echo "📂 Thư mục dự án: $PROJECT_ROOT"
echo "📜 File ghi log: $LOG_FILE"
echo "=================================================================="

export OLLAMA_HOST="http://127.0.0.1:11434"
export OLLAMA_MODEL="qwen2.5-coder:3b"
export POLL_INTERVAL_MS="5000"

nohup node "${PROJECT_ROOT}/scripts/node01-outbound-pgmq-worker.mjs" >> "$LOG_FILE" 2>&1 &
WORKER_PID=$!

echo "✔ Daemon đã được kích hoạt chạy ngầm với PID: ${WORKER_PID}"
echo "Để kiểm tra log thời gian thực: tail -f $LOG_FILE"
