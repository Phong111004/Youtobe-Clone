import { Request, Response } from 'express';
import Notification from '../models/notification.model';


// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: (req as any).user?._id })
      .populate('sender', 'username avatar')
      .populate('video', 'title')
      .populate('comment', 'text')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo' });
      return;
    }

    if (notification.recipient.toString() !== (req as any).user?._id.toString()) {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { recipient: (req as any).user?._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
