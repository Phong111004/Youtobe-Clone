export class AIService {
  private static OLLAMA_URL = 'http://localhost:11434/api/generate';
  private static MODEL_NAME = 'gemma:2b';

  /**
   * Gọi Ollama API để sinh text dựa trên prompt
   */
  private static async generateFromOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL_NAME,
          prompt: prompt,
          stream: false, // Tắt stream để lấy full text 1 lần
        }),
      });

      if (!response.ok) {
        console.error('Ollama Error Response:', await response.text());
        throw new Error(`Ollama request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Lỗi khi gọi Ollama:', error);
      throw new Error('AI Service (Ollama) is currently unavailable or model is missing. Please ensure Ollama is running and model gemma4 is downloaded.');
    }
  }

  /**
   * Tóm tắt nội dung video từ phụ đề
   */
  public static async summarizeVideo(subtitleText: string): Promise<string> {
    const prompt = `Bạn là một trợ lý AI phân tích nội dung video. 
Hãy đọc đoạn phụ đề sau đây và viết một đoạn tóm tắt ngắn gọn (khoảng 2-3 câu) bằng tiếng Việt về nội dung chính của video:
---
Phụ đề:
${subtitleText}
---
Trả lời bằng tiếng Việt:`;

    return this.generateFromOllama(prompt);
  }

  /**
   * Tóm tắt nội dung video từ Title và Description (Dành cho video không có phụ đề)
   */
  public static async summarizeVideoFromMeta(title: string, description: string): Promise<string> {
    const prompt = `Bạn là một trợ lý AI tóm tắt nội dung. 
Dựa vào tiêu đề và mô tả của video sau đây, hãy viết một đoạn tóm tắt ngắn gọn (2-3 câu) bằng tiếng Việt về nội dung video:
---
Tiêu đề: ${title}
Mô tả: ${description}
---
Trả lời bằng tiếng Việt:`;

    return this.generateFromOllama(prompt);
  }

  /**
   * Dịch đoạn phụ đề sang ngôn ngữ khác
   */
  public static async translateSubtitle(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Bạn là một chuyên gia dịch thuật. 
Hãy dịch chính xác đoạn văn bản sau sang ngôn ngữ ${targetLanguage}. 
Lưu ý: Chỉ trả về đoạn văn bản đã dịch, KHÔNG thêm bất kỳ giải thích, chào hỏi hay dấu ngoặc kép nào dư thừa.
---
Văn bản gốc:
${text}
---
Bản dịch:`;

    return this.generateFromOllama(prompt);
  }
}
