import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import Video from '../models/video.model';

export const summarizeVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: 'videoId is required' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Nếu video chưa có subtitle thì tóm tắt qua meta (title & description)
    // Trong thực tế, bạn sẽ tải VTT/SRT file từ video.subtitles[0].url và truyền vào summarizeVideo
    // Tạm thời để demo tính năng, ta lấy nội dung title/description
    const summary = await AIService.summarizeVideoFromMeta(video.title, video.description || 'Không có mô tả');

    res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Lỗi summarizeVideo:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const translateSubtitle = async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: 'text and targetLanguage are required' });
    }

    const translatedText = await AIService.translateSubtitle(text, targetLanguage);

    res.status(200).json({ translatedText });
  } catch (error: any) {
    console.error('Lỗi translateSubtitle:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
