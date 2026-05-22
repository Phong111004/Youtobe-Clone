import express from 'express';
import { uploadVideo, getVideos, getVideoById, likeVideo, dislikeVideo, getTrendingVideos, getRelatedVideos } from '../controllers/video.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

// GET /api/videos - Lấy danh sách video (Public)
router.get('/', getVideos);

// GET /api/videos/trending - Lấy video thịnh hành (Public)
router.get('/trending', getTrendingVideos);

// GET /api/videos/:id - Lấy chi tiết video (Public)
router.get('/:id', getVideoById);

// GET /api/videos/:id/related - Lấy video liên quan (Public)
router.get('/:id/related', getRelatedVideos);

// POST /api/videos/:id/like - Like video (Private)
router.post('/:id/like', protect, likeVideo);

// POST /api/videos/:id/dislike - Dislike video (Private)
router.post('/:id/dislike', protect, dislikeVideo);

// POST /api/videos/upload - Upload video mới (Private)
// Cần gửi multipart/form-data với 2 trường file: 'video' và 'thumbnail'
router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadVideo
);

export default router;
