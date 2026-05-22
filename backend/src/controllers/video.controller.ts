import { Request, Response } from 'express';
import fs from 'fs';
import Video from '../models/video.model';
import cloudinary from '../config/cloudinary';

// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private
export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, tags, visibility, isShort } = req.body;
    
    // req.files chứa các file upload từ multer (fields)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.video || !files.thumbnail) {
      res.status(400).json({ message: 'Vui lòng cung cấp đủ video và thumbnail' });
      return;
    }

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail[0];

    const videoUploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_large(
        videoFile.path,
        {
          resource_type: 'video',
          folder: 'youtube_clone/videos',
          chunk_size: 6000000 // Gửi từng chunk 6MB
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Upload thumbnail
    const thumbnailUploadResult = await cloudinary.uploader.upload(thumbnailFile.path, {
      resource_type: 'image',
      folder: 'youtube_clone/thumbnails',
    });

    // Sau khi upload thành công, xóa file tạm trên server (disk)
    fs.unlinkSync(videoFile.path);
    fs.unlinkSync(thumbnailFile.path);

    // Lưu thông tin vào DB
    const newVideo = await Video.create({
      title,
      description,
      category,
      tags: tags ? tags.split(',') : [],
      visibility,
      isShort: isShort === 'true',
      videoUrl: videoUploadResult.secure_url,
      thumbnailUrl: thumbnailUploadResult.secure_url,
      duration: videoUploadResult.duration || 0,
      owner: (req as any).user._id,
    });

    res.status(201).json(newVideo);
  } catch (error: any) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pagination cơ bản
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const { isShort, q, userId } = req.query;
    const skip = (page - 1) * limit;

    const query: any = { visibility: 'public' };
    if (isShort !== undefined) {
      query.isShort = isShort === 'true';
    }
    if (userId) {
      query.owner = userId;
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }

    const videos = await Video.find(query)
      .populate('owner', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Video.countDocuments(query);

    res.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVideos: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id).populate('owner', 'username avatar subscribersCount');
    
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    // Tự động tăng lượt xem (+1) mỗi khi fetch video
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a video
// @route   POST /api/videos/:id/like
// @access  Private
export const likeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = (req as any).user._id;

    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    const isLiked = video.likes.includes(userId);
    const isDisliked = video.dislikes.includes(userId);

    if (isLiked) {
      // Bỏ like
      video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Thêm like, bỏ dislike nếu có
      video.likes.push(userId);
      if (isDisliked) {
        video.dislikes = video.dislikes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dislike a video
// @route   POST /api/videos/:id/dislike
// @access  Private
export const dislikeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = (req as any).user._id;

    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    const isLiked = video.likes.includes(userId);
    const isDisliked = video.dislikes.includes(userId);

    if (isDisliked) {
      // Bỏ dislike
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Thêm dislike, bỏ like nếu có
      video.dislikes.push(userId);
      if (isLiked) {
        video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending videos (Dựa trên views & lượt like)
// @route   GET /api/videos/trending
// @access  Public
export const getTrendingVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const videos = await Video.find({ visibility: 'public' })
      .populate('owner', 'username avatar')
      // Sắp xếp theo lượt view giảm dần và lượt like
      .sort({ views: -1, 'likes.length': -1 })
      .limit(20);

    res.json(videos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related videos (Gợi ý dựa trên tags hoặc category)
// @route   GET /api/videos/:id/related
// @access  Public
export const getRelatedVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    // Tìm các video có cùng tags hoặc cùng category, loại trừ video hiện tại
    const relatedVideos = await Video.find({
      _id: { $ne: video._id },
      visibility: 'public',
      $or: [
        { tags: { $in: video.tags } },
        { category: video.category }
      ]
    })
      .populate('owner', 'username avatar')
      .sort({ views: -1 })
      .limit(10);

    // Nếu không đủ video related, lấy thêm video ngẫu nhiên bù vào (tổng 10)
    if (relatedVideos.length < 5) {
      const randomVideos = await Video.aggregate([
        { $match: { _id: { $ne: video._id, $nin: relatedVideos.map(v => v._id) }, visibility: 'public' } },
        { $sample: { size: 10 - relatedVideos.length } }
      ]);

      const populatedRandom = await Video.populate(randomVideos, { path: 'owner', select: 'username avatar' });
      res.json([...relatedVideos, ...populatedRandom]);
      return;
    }

    res.json(relatedVideos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
