import { Request, Response } from 'express';
import Comment from '../models/comment.model';
import Video from '../models/video.model';

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

    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
