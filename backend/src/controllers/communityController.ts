import { Request, Response } from 'express';
import { CommunityPost } from '../models/communityPost.model';

// Lấy tất cả bài viết của kênh
export const getChannelPosts = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const posts = await CommunityPost.find({ author: channelId })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar email');
    
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Tạo bài viết mới
export const createPost = async (req: any, res: Response) => {
  try {
    const { content, images } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    }

    const post = await CommunityPost.create({
      author: req.user.id, // Từ middleware auth
      content,
      images: images || [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi tạo bài viết' });
  }
};

// Like/Unlike bài viết
export const toggleLike = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    const hasLiked = post.likes.includes(userId);
    
    if (hasLiked) {
      post.likes = post.likes.filter((id: any) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi like bài viết' });
  }
};

// Xóa bài viết
export const deletePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    // Kiểm tra quyền xóa (chỉ author mới được xóa)
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa' });
    }

    await CommunityPost.findByIdAndDelete(id);
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa bài viết' });
  }
};