import api from '@/services/api';

export const aiApi = {
  /**
   * Yêu cầu AI tóm tắt nội dung video
   * @param videoId ID của video cần tóm tắt
   * @returns Chuỗi văn bản tóm tắt
   */
  summarizeVideo: async (videoId: string): Promise<string> => {
    const response = await api.post('/ai/summarize', { videoId });
    return response.data.summary;
  },

  /**
   * Yêu cầu AI dịch đoạn text phụ đề sang ngôn ngữ đích
   * @param text Đoạn văn bản cần dịch
   * @param targetLanguage Ngôn ngữ muốn dịch sang (vd: 'Vietnamese', 'English')
   * @returns Văn bản đã được dịch
   */
  translateSubtitle: async (text: string, targetLanguage: string): Promise<string> => {
    const response = await api.post('/ai/translate', { text, targetLanguage });
    return response.data.translatedText;
  },
};
