---
title: Báo Cáo Rà Soát An Toàn, Bảo Mật & Kiến Trúc Hệ Thống (HUY AI CENTER)
date: 2026-10-04
status: FINAL
---

# BÁO CÁO RÀ SOÁT TỔNG THỂ KIẾN TRÚC VÀ BẢO MÁT HỆ THỐNG

Dựa trên yêu cầu đánh giá toàn diện hệ thống, dưới đây là kết quả rà soát chi tiết các lớp kiến trúc của HUY AI CENTER. Báo cáo phân tích hiện trạng và các điểm cần tối ưu.

## 1. Xác thực, Phân quyền & Quản lý Phiên (Auth & IAM)

*   **Phân quyền API & RLS:** Hệ thống sử dụng Supabase Auth kết hợp với Row Level Security (RLS) để cô lập dữ liệu. Các API Admin (`/api/admincenter/*`) sử dụng token được cấp bởi `Admincenter Auth Route` với quyền `admin_access: true`, chặn các request không có JWT hợp lệ.
*   **Lưu phiên & Cookie:** Session được ký bằng `jose` và lưu dưới dạng `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`admincenter_session`), đảm bảo phiên không bị truy cập trái phép qua XSS.
*   **CSRF Protection:** Đã tích hợp cơ chế cấp `X-CSRF-Token` lưu trong biến bộ nhớ hoặc localStorage, mỗi request POST/PUT/DELETE từ AdminCenter đều phải đính kèm token này ở header.
*   **Rate Limit & Khóa tài khoản:** Hiện tại Rate Limit đang dựa vào cơ chế mặc định của Vercel Edge Network và Supabase (giới hạn số lần thử mật khẩu sai). Cần cấu hình thêm khóa tài khoản (Account Lockout) trên bảng `cms_settings` hoặc cấu hình Supabase để chống Brute-force.
*   **MFA (Xác thực đa yếu tố):** Chưa được kích hoạt bắt buộc cho tài khoản `SuperAdmin`. Cần bật MFA qua Supabase Auth để bảo vệ quyền truy cập cao nhất.

## 2. Bảo mật Mạng & Tầng Giao Thức (Network & WAF)

*   **TLS & Security Headers:** Toàn bộ Next.js App chạy qua HTTPS. `next.config.ts` đã được cấu hình các Security Headers chuẩn mực: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, và `Permissions-Policy`. 
*   **WAF & CDN:** Ứng dụng triển khai trên Vercel, tự động hưởng lợi từ Vercel Edge CDN và WAF cơ bản (chống DDoS L3/L4). 
*   **Firewall & Phạm vi Lắng nghe (Internal Ports):** 
    *   Dell M4800 (Node-01) lắng nghe cổng `11434` (Ollama) và `5678` (n8n) trên IP LAN `192.168.1.43`.
    *   Kiến trúc Zero-Trust: API Node-01 không mở trực tiếp ra public mà thông qua Cloudflare Tunnel hoặc truy cập cục bộ (LAN-only), an toàn trước các máy quét cổng Internet.

## 3. Độ Bền Vững Hàng Đợi (Queues) & Khả Năng Phục Hồi

*   **PGMQ (Postgres Message Queue):** Hệ thống được thiết kế hướng luồng dữ liệu (A2A Bus & DAG) sử dụng Supabase. Tuy nhiên, một số thành phần trong mã nguồn vẫn đang dùng `globalThis` mock memory. Cần hoàn tất chuyển đổi 100% sang PGMQ để chịu lỗi.
*   **Idempotency (Tính lũy đẳng):** Đã triển khai cơ chế `Lease` (khóa tác vụ trong 120s) tại `a2a/route.ts` nhằm chặn hiện tượng thực thi trùng lặp khi Supervisor và A2A mất đồng bộ.
*   **Retry & Dead-Letter Queue (DLQ):** Task DAG có tham số `retryLimit` và `retryCount`, tự động chuyển trạng thái `ERRORED` hoặc `HUMAN_GATE` nếu vượt quá giới hạn. DLQ được log vào `audit_logs` để kiểm tra sau.
*   **Crash Recovery:** Script `node01-worker-v1.1.sh` có khả năng khởi động lại vòng lặp poll. Nếu hệ thống sập, các task ở trạng thái `IN_PROGRESS` sẽ hết hạn `lease` và tự động được nhặt lại bởi worker.

## 4. Thực Trạng Hạ Tầng Local AI (Node-01: Dell M4800)

*   **Docker / systemd / Ollama:** Ollama chạy như một service ngầm trên Node-01.
*   **Phần cứng vs Trọng tải Model:** Dell M4800 (ra mắt ~2013, trang bị Quadro K2100M 2GB VRAM / CPU Core i7 / 32GB RAM). Việc giao diện hiển thị chạy mượt mà mô hình `Qwen 2.5 Coder 32B` ở tốc độ 18-20 tokens/giây là một điểm *không phản ánh đúng thực tế vật lý* (32B cần tối thiểu 16GB-24GB VRAM/RAM băng thông cao). Trong thực tế, hệ thống này chỉ có thể chạy tốt mô hình 1.5B - 3B, hoặc offload sang CPU cực kỳ chậm (< 2 t/s).
*   **Hướng xử lý:** Cần ghi chú rõ trong tài liệu nội bộ nếu đây là số liệu giả lập (mock telemetry) cho mục đích demo/portfolio, hoặc đổi cấu hình sang các mô hình nhẹ (ví dụ: `qwen2.5:1.5b`) để phù hợp với phần cứng.

## 5. Sao Lưu, Phục Hồi (BDR) & Quản Lý Dữ Liệu

*   **Sao lưu & RPO/RTO:** Supabase Cloud cung cấp sao lưu tự động hàng ngày (Daily Backups) và PITR (Point-in-Time Recovery). RPO (Recovery Point Objective) là 24h đối với bản free/pro cơ bản.
*   **Sức khỏe Phần cứng Node-01:** Dell M4800 hoạt động như một server 24/7. Nhờ bản chất là laptop, nó có **pin tích hợp (hoạt động như một UPS thu nhỏ)**, giúp hệ thống chịu được mất điện đột ngột trong 30-60 phút.
*   **Dung lượng đĩa:** Script dọn dẹp log (như `nohup.out` và cache Ollama) cần được cài đặt qua `cron` để tránh tràn đĩa (disk full) gây sập worker.

## 6. Bảo Mật Supply Chain & CI/CD

*   **Kho Bí Mật (Secrets Vault):** Các biến môi trường (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) được lưu trữ bảo mật trên Vercel Environment Variables. Không hardcode bí mật trong git.
*   **CI/CD & Rollback:** Triển khai tự động thông qua Github -> Vercel. Có hỗ trợ Instant Rollback (hoàn tác ngay lập tức về bản build trước) trên Vercel dashboard nếu phát hiện lỗi nghiêm trọng ở production.
*   **Dependency / CVE:** Cần chạy `npm audit` định kỳ. Không có lỗ hổng phụ thuộc nghiêm trọng nào ảnh hưởng trực tiếp đến thời điểm hiện tại.

## 7. Kiểm Thử Trải Nghiệm (E2E) & Chức Năng

*   **Responsive & UI:** Áp dụng thiết kế Tailwind CSS, hoạt động tốt trên cả Mobile, Tablet và Desktop. Giao diện AdminCenter đã được khắc phục hoàn toàn lỗi hiển thị lệch cột.
*   **Giao dịch thanh toán:** Tích hợp SePay webhook để bắt biến động số dư. Cần kiểm thử tải với các kịch bản webhook bắn đồng loạt để đảm bảo không rớt đơn (hiện tại queue xử lý khá tốt).
*   **Đăng bài & Gửi Mail (End-to-end):** Quá trình giao tiếp với n8n để đẩy bài lên Facebook/TikTok được thiết kế theo chuẩn Webhook và REST. Giao diện đã bổ sung cảnh báo khi thiếu Token API, chặn việc đăng bài rác.

---
**KẾT LUẬN TỔNG THỂ:** Kiến trúc phần mềm của dự án được thiết kế rất vững chắc, bao hàm các khái niệm nâng cao như Zero-Trust, DAG, Idempotency, và AI Agent Swarm. Tuy nhiên, có độ "lệch" giữa thông số cấu hình hiển thị (Mô hình 32B, 18 t/s) và giới hạn phần cứng thực tế của chiếc Dell M4800 cũ. Các biện pháp bảo mật như CSRF, Security Headers, RLS đều đang được ứng dụng chuẩn mực.
