import { Request, Response } from 'express';
import Video from '../models/video.model';
import User from '../models/user.model';


// @desc    Get channel analytics (mocked 28 days based on real totals)
// @route   GET /api/studio/analytics
// @access  Private
export const getChannelAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    // 1. Get real totals from DB
    const videos = await Video.find({ owner: userId as any });
    
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
    const totalDurationSeconds = videos.reduce((acc, video) => acc + (video.duration * video.views), 0);
    const watchTimeHours = Number((totalDurationSeconds / 3600).toFixed(1));
    const totalLikes = videos.reduce((acc, video) => acc + video.likes.length, 0);
    const subscribersCount = (req as any).user?.subscribersCount || 0;

    // 2. Get top performing videos
    const topVideos = await Video.find({ owner: userId as any })
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes dislikes duration thumbnailUrl createdAt');

    // 3. Generate mock 28-day data curve based on total views
    const chartData = [];
    const today = new Date();
    
    // Thuật toán: Phân bổ tổng views/likes vào 28 ngày qua theo một đường cong có độ ngẫu nhiên
    // Giả sử mỗi ngày có (tổng view / 28) views, +/- 30% ngẫu nhiên
    let remainingViews = totalViews;
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      let dailyViews = 0;
      if (i === 0) {
        dailyViews = remainingViews; // Ngày cuối lấy nốt số còn lại
      } else {
        const baseDaily = totalViews / 28;
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        dailyViews = Math.floor(baseDaily * randomFactor);
        
        // Đảm bảo không quá tổng view
        if (dailyViews > remainingViews) {
          dailyViews = remainingViews;
        }
        remainingViews -= dailyViews;
      }
      
      // Tính tương đối lượt like mỗi ngày dựa trên view
      const likeRatio = totalViews > 0 ? (totalLikes / totalViews) : 0;
      const dailyLikes = Math.floor(dailyViews * likeRatio);

      chartData.push({
        date: dateString,
        views: dailyViews,
        likes: dailyLikes,
      });
    }

    res.json({
      summary: {
        views: totalViews,
        watchTime: watchTimeHours,
        subscribers: subscribersCount,
        videos: videos.length,
      },
      topVideos,
      chartData,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
