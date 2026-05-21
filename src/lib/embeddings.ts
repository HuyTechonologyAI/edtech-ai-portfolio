import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Tạo vector embedding 768-dim từ một đoạn văn bản
 * Sử dụng Gemini text-embedding-004 model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Tách nội dung dài thành các đoạn (chunks) có overlap
 * @param content - Nội dung văn bản gốc
 * @param chunkSize - Số ký tự tối đa mỗi chunk (mặc định 800)
 * @param overlap - Số ký tự chồng lấn giữa 2 chunks liên tiếp (mặc định 100)
 */
export function chunkText(
  content: string,
  chunkSize: number = 800,
  overlap: number = 100
): string[] {
  if (!content || content.trim().length === 0) return [];

  // Normalize whitespace
  const cleaned = content.replace(/\s+/g, " ").trim();

  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + chunkSize;

    // Cố gắng cắt tại ranh giới câu gần nhất (dấu chấm, xuống dòng)
    if (end < cleaned.length) {
      const lastSentenceEnd = Math.max(
        cleaned.lastIndexOf(". ", end),
        cleaned.lastIndexOf(".\n", end),
        cleaned.lastIndexOf("! ", end),
        cleaned.lastIndexOf("? ", end)
      );

      // Nếu tìm thấy ranh giới câu trong khoảng hợp lý, cắt tại đó
      if (lastSentenceEnd > start + chunkSize * 0.5) {
        end = lastSentenceEnd + 1;
      }
    } else {
      end = cleaned.length;
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 20) {
      // Bỏ qua chunks quá ngắn (không có giá trị ngữ nghĩa)
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start >= cleaned.length) break;
  }

  return chunks;
}

/**
 * Xử lý pipeline nạp tri thức đầy đủ:
 * Text → Chunks → Embeddings
 * Trả về mảng các cặp {chunk, embedding}
 */
export async function processContentForIngestion(
  content: string,
  chunkSize: number = 800
): Promise<Array<{ chunk: string; embedding: number[] }>> {
  const chunks = chunkText(content, chunkSize);
  const results: Array<{ chunk: string; embedding: number[] }> = [];

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk);
      results.push({ chunk, embedding });
    } catch (error) {
      console.error("Embedding generation failed for chunk:", chunk.substring(0, 50), error);
      // Skip failed chunks but continue processing
    }
  }

  return results;
}
