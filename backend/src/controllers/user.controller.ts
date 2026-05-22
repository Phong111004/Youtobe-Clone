import { Request, Response } from 'express';
import User from '../models/user.model';
import mongoose from 'mongoose';

// @desc    Subscribe / Unsubscribe to a channel
// @route   POST /api/users/subscribe/:channelId
// @access  Private
export const toggleSubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const channelId = req.params.channelId;
    const userId = (req as any).user._id;

    if (channelId.toString() === userId.toString()) {
      res.status(400).json({ message: 'Không thể tự đăng ký kênh của mình' });
      return;
    }

    const channel = await User.findById(channelId);
    const currentUser = await User.findById(userId);

    if (!channel || !currentUser) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    const isSubscribed = currentUser.subscribedChannels.includes(channelId as any);

    if (isSubscribed) {
      // Unsubscribe
      currentUser.subscribedChannels = currentUser.subscribedChannels.filter(
        (id) => id.toString() !== channelId.toString()
      );
      channel.subscribersCount -= 1;
    } else {
      // Subscribe
      currentUser.subscribedChannels.push(channelId as any);
      channel.subscribersCount += 1;
    }

    await currentUser.save();
    await channel.save();

    res.json({ 
      isSubscribed: !isSubscribed, 
      subscribersCount: channel.subscribersCount 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add video to watch history
// @route   POST /api/users/history/:videoId
// @access  Private
export const addToHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Xóa videoId cũ nếu đã tồn tại để đẩy lên đầu
    user.watchHistory = user.watchHistory.filter(id => id.toString() !== videoId);
    
    // Thêm vào đầu mảng
    user.watchHistory.unshift(videoId as any);

    // Giới hạn lịch sử 100 video
    if (user.watchHistory.length > 100) {
      user.watchHistory.pop();
    }

    await user.save();
    res.json({ message: 'Added to history' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get watch history
// @route   GET /api/users/history
// @access  Private
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId).populate({
      path: 'watchHistory',
      populate: {
        path: 'owner',
        select: 'username avatar'
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.watchHistory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get channel profile
// @route   GET /api/users/channel/:id
// @access  Public
export const getChannelProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const channelId = req.params.id;
    const channel = await User.findById(channelId).select('username avatar subscribersCount coverImage');

    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }

    res.json(channel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
