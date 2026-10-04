#!/bin/bash
# ==============================================================================
# Script: node01-cleanup.sh
# Mục đích: Dọn dẹp log, cache Ollama, và các file rác để tránh tràn ổ đĩa (Disk Full) 
# cho hệ thống Dell M4800 hoạt động 24/7.
# Lịch trình đề xuất (Cron): 0 2 * * * (Chạy vào lúc 2:00 sáng mỗi ngày)
# ==============================================================================

LOG_DIR="/mnt/data1/HUY-AI"
MAX_LOG_SIZE_MB=500
DAYS_TO_KEEP_LOGS=7

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Bắt đầu quy trình dọn dẹp Node-01..."

# 1. Rotate & xóa log file quá lớn
if [ -f "$LOG_DIR/worker.log" ]; then
    FILE_SIZE=$(du -m "$LOG_DIR/worker.log" | cut -f1)
    if [ "$FILE_SIZE" -gt "$MAX_LOG_SIZE_MB" ]; then
        echo "[INFO] File worker.log vượt quá ${MAX_LOG_SIZE_MB}MB. Đang rotate..."
        cp "$LOG_DIR/worker.log" "$LOG_DIR/worker_$(date '+%Y%m%d').log"
        > "$LOG_DIR/worker.log" # Làm rỗng file log hiện tại
    fi
fi

# 2. Xóa các file log cũ hơn DAYS_TO_KEEP_LOGS ngày
echo "[INFO] Đang xóa các file log cũ hơn $DAYS_TO_KEEP_LOGS ngày..."
find "$LOG_DIR" -name "worker_*.log" -type f -mtime +$DAYS_TO_KEEP_LOGS -delete

# 3. Dọn dẹp cache của Ollama (Các layer bị hỏng hoặc tải dang dở)
echo "[INFO] Đang dọn dẹp cache của bộ máy Ollama..."
# Tùy thuộc vào người dùng chạy Ollama dưới user nào
# rm -rf ~/.ollama/models/blobs/tmp_* 2>/dev/null || true

# 4. Kiểm tra dung lượng ổ đĩa sau khi dọn
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dọn dẹp hoàn tất. Dung lượng ổ đĩa hiện tại: $DISK_USAGE"
echo "--------------------------------------------------------------------------------"
