import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ollama Local coordinator on NODE-01
const OLLAMA_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5-coder:3b";

// Data directories for tickets & leads
const DATA_DIR = path.join(process.cwd(), "src/data");
const TICKETS_FILE = path.join(DATA_DIR, "cskh_tickets.json");
const LEADS_FILE = path.join(DATA_DIR, "marketing_leads.json");

function ensureFile(filePath: string, defaultData: unknown) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

// System prompts for the 2 public ambassadors
const PROMPTS = {
  emp_43: `Bạn là **Trọng Nghĩa** (Mã nhân sự: emp_43) — Chuyên viên Hỗ trợ Khách hàng 24/7 của **HUY TECHNOLOGY AI GROUP**.
- Tính cách: Lịch thiệp, ân cần, nhịp nói vừa phải, mang âm sắc Bắc / Bắc Bộ.
- Nhiệm vụ: Giải đáp thắc mắc dịch vụ, hướng dẫn kỹ thuật, tiếp nhận khiếu nại, tạo ticket hỗ trợ.
- Giới hạn: Tuyệt đối không tiết lộ mã nguồn, database credentials, tài liệu bảo mật nội bộ, hoặc vượt thẩm quyền.
- Thông tin hỗ trợ:
  + Hotline kỹ thuật: 0961 364 600
  + Email: huytechnologyai2025@gmail.com
  + Các hệ sinh thái: EduViet AI (Trợ lý Giáo viên), SmartTax AI (Thuế & Tài chính), ZentraTech AI Hub.
- Nếu khách yêu cầu tạo ticket hỗ trợ, hướng dẫn khách để lại mô tả vấn đề và số liên hệ.`,

  emp_41: `Bạn là **Phương Thảo** (Mã nhân sự: emp_41) — Chuyên viên Tư vấn Dịch vụ & Khai thác Khách hàng (Marketing) của **HUY TECHNOLOGY AI GROUP**.
- Tính cách: Chững chạc, dễ hiểu, chuyên nghiệp, mang âm sắc Trung / Huế.
- Nhiệm vụ: Tìm hiểu nhu cầu tự động hóa doanh nghiệp, giới thiệu các giải pháp AI Agent, đào tạo n8n/Make.com, giải pháp chuyển đổi số toàn diện.
- Giới hạn: Không tự ý cam kết giảm giá hoặc thay đổi ngân sách ngoài chính sách niêm yết. Không tiết lộ thông tin nội bộ.
- Dịch vụ nổi bật:
  + Đào tạo thực chiến AI & Automation (n8n, Make.com, AI Agent)
  + Triển khai đội ngũ 63 Nhân sự AI cho Doanh nghiệp
  + Giải pháp SmartTax AI (Kê khai thuế tự động) & EduViet AI (Trường học số)
- Khi khách có nhu cầu báo giá hoặc tư vấn chuyên sâu 1-1, hãy lịch sự xin Tên và Số điện thoại/Email (với sự đồng ý của khách) để đội ngũ chuyên gia liên hệ lại.`
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, agent_id = "emp_43", action, contactData } = body;

    if (!message && !action) {
      return NextResponse.json({ error: "Missing message or action" }, { status: 400 });
    }

    // Handle ticket creation action
    if (action === "create_ticket") {
      ensureFile(TICKETS_FILE, []);
      const tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, "utf-8"));
      const ticketId = `TICKET-${Date.now().toString().slice(-6)}`;
      const newTicket = {
        ticket_id: ticketId,
        created_at: new Date().toISOString(),
        agent_id: "emp_43",
        agent_name: "Trọng Nghĩa",
        customer_name: contactData?.name || "Khách hàng",
        customer_contact: contactData?.contact || "Chưa cung cấp",
        issue_summary: contactData?.issue || message || "Yêu cầu hỗ trợ kỹ thuật",
        status: "OPEN",
        priority: "NORMAL"
      };
      tickets.push(newTicket);
      fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        ticket_id: ticketId,
        message: `Đã ghi nhận Ticket hỗ trợ mã #${ticketId}. Chuyên viên Trọng Nghĩa cùng đội ngũ kỹ thuật sẽ xử lý trong vòng 15-30 phút!`
      });
    }

    // Handle lead capture action
    if (action === "capture_lead") {
      ensureFile(LEADS_FILE, []);
      const leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
      const leadId = `LEAD-${Date.now().toString().slice(-6)}`;
      const newLead = {
        lead_id: leadId,
        created_at: new Date().toISOString(),
        agent_id: "emp_41",
        agent_name: "Phương Thảo",
        customer_name: contactData?.name || "Khách hàng tiềm năng",
        customer_phone: contactData?.phone || "",
        customer_email: contactData?.email || "",
        demand: contactData?.demand || message || "Quan tâm giải pháp AI & Tự động hóa",
        consent_given: true,
        status: "NEW"
      };
      leads.push(newLead);
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        lead_id: leadId,
        message: `Cảm ơn quý khách! Chuyên viên Phương Thảo đã tiếp nhận thông tin tư vấn (Mã #${leadId}). Chúng tôi sẽ liên hệ trong thời gian sớm nhất.`
      });
    }

    // Chat handling via Ollama Local or fallback
    const systemPrompt = PROMPTS[agent_id as keyof typeof PROMPTS] || PROMPTS.emp_43;

    try {
      const ollamaResp = await fetch(OLLAMA_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 500
          }
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (ollamaResp.ok) {
        const data = await ollamaResp.json();
        const replyText = data.message?.content || "Xin lỗi quý khách, tôi chưa thể xử lý yêu cầu lúc này.";
        return NextResponse.json({
          reply: replyText,
          agent_id,
          agent_name: agent_id === "emp_41" ? "Phương Thảo" : "Trọng Nghĩa",
          model: OLLAMA_MODEL
        });
      }
    } catch (ollamaErr) {
      console.warn("Ollama local chat timed out or error, using intelligent fallback response:", ollamaErr);
    }

    // High-quality deterministic fallback response if Ollama model is busy
    let fallbackReply = "";
    if (agent_id === "emp_41") {
      fallbackReply = `Dạ, Phương Thảo (Marketing & Tư vấn Doanh nghiệp) xin chào quý khách! Hệ sinh thái Huy Technology AI Group hiện cung cấp các gói giải pháp AI Agent tự động hóa toàn diện và các khóa đào tạo thực chiến n8n/Make.com. Quý khách vui lòng cho biết nhu cầu hoặc để lại thông tin để Thảo gửi bảng giải pháp chi tiết nhé!`;
    } else {
      fallbackReply = `Dạ, Trọng Nghĩa (Hỗ trợ CSKH 24/7) xin chào quý khách! Em có thể giúp quý khách giải đáp về tài khoản, dịch vụ EduViet AI, SmartTax AI hoặc các thắc mắc kỹ thuật. Quý khách cần hỗ trợ cụ thể ở nội dung nào ạ?`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      agent_id,
      agent_name: agent_id === "emp_41" ? "Phương Thảo" : "Trọng Nghĩa",
      fallback: true
    });

  } catch (error: unknown) {
    console.error("Public Chat Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi xử lý hệ thống";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
