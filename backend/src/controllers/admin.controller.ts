import { Request, Response } from 'express';
import User from '../models/user.model';
import Video from '../models/video.model';

// @desc    Get system overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    
    // Tổng số view toàn nền tảng
    const viewsAggregation = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalPlatformViews = viewsAggregation[0]?.totalViews || 0;

    res.json({
      totalUsers,
      totalVideos,
      totalPlatformViews,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.role === 'admin') {
      res.status(400).json({ message: 'Cannot delete an admin user' });
      return;
    }

    // Xóa video của user này
    await Video.deleteMany({ owner: user._id as any });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all videos across platform
// @route   GET /api/admin/videos
// @access  Private/Admin
export const getAllPlatformVideos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const videos = await Video.find({})
      .populate('owner', 'username avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments();

    res.json({
      videos,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any video
// @route   DELETE /api/admin/videos/:id
// @access  Private/Admin
export const deleteAnyVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Make myself admin (Cheat endpoint for testing)
// @route   GET /api/admin/make-me-admin
// @access  Private
export const makeMeAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);
    if (user) {
      user.role = 'admin';
      await user.save();
      res.json({ message: 'You are now an admin!' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
