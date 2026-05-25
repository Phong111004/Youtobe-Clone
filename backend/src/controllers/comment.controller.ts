import { Request, Response } from 'express';
import Comment from '../models/comment.model';
import Video from '../models/video.model';
import Notification from '../models/notification.model';
import { emitToUser } from '../socket';

// @desc    Get comments for a video (chỉ lấy comment gốc, không lấy replies)
// @route   GET /api/comments/:videoId
// @access  Public
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.videoId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: videoId, parentId: null })
      .populate('owner', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ video: videoId, parentId: null });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get replies for a specific comment
// @route   GET /api/comments/:videoId/replies/:commentId
// @access  Public
export const getReplies = async (req: Request, res: Response): Promise<void> => {
  try {
    const commentId = req.params.commentId as string;
    const replies = await Comment.find({ parentId: commentId })
      .populate('owner', 'username avatar')
      .sort({ createdAt: 1 }); // Replies thường xếp từ cũ đến mới

    res.json(replies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment or reply
// @route   POST /api/comments/:videoId
// @access  Private
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.videoId as string;
    const { content, parentId } = req.body;
    const userId = (req as any).user._id;

    // Kiểm tra video có tồn tại không
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({ message: 'Video không tồn tại' });
      return;
    }

    const newComment = await Comment.create({
      video: videoId,
      owner: userId,
      content,
      parentId: parentId ? (parentId as string) : null,
    });

    // Populate owner để trả về luôn cho frontend cập nhật UI
    const populatedComment = await Comment.findById(newComment._id).populate('owner', 'username avatar');

    // --- NOTIFICATION LOGIC ---
    try {
      if (parentId) {
        // Nếu là reply, gửi thông báo cho chủ của comment gốc
        const parentComment = await Comment.findById(parentId);
        if (parentComment && parentComment.owner.toString() !== userId.toString()) {
          const notification = new Notification({
            recipient: parentComment.owner.toString(),
            sender: userId,
            type: 'NEW_COMMENT',
            video: videoId,
            comment: newComment._id,
            message: 'đã trả lời bình luận của bạn.',
          });
          await notification.save();
          const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username avatar')
            .populate('video', 'title')
            .populate('comment', 'content');
          emitToUser(parentComment.owner.toString(), 'new_notification', populatedNotification);
        }
      } else {
        // Nếu là comment gốc, gửi thông báo cho chủ video
        if (video.owner.toString() !== userId.toString()) {
          const notification = new Notification({
            recipient: video.owner.toString(),
            sender: userId,
            type: 'NEW_COMMENT',
            video: videoId,
            comment: newComment._id,
            message: 'đã bình luận về video của bạn.',
          });
          await notification.save();
          const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username avatar')
            .populate('video', 'title')
            .populate('comment', 'content');
          emitToUser(video.owner.toString(), 'new_notification', populatedNotification);
        }
      }
    } catch (notifErr) {
      console.error('Lỗi khi tạo thông báo:', notifErr);
    }
    // --- END NOTIFICATION LOGIC ---

    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
