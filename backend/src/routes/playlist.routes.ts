import express from 'express';
import { getMyPlaylists, createPlaylist, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist } from '../controllers/playlist.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// GET /api/playlists - Lấy danh sách playlist của bản thân (Private)
router.get('/', protect, getMyPlaylists);

// POST /api/playlists - Tạo playlist mới (Private)
router.post('/', protect, createPlaylist);

// GET /api/playlists/:id - Lấy chi tiết playlist (Public/Private)
router.get('/:id', optionalAuth, getPlaylistById);

// POST /api/playlists/:id/add - Thêm video vào playlist
router.post('/:id/add', protect, addVideoToPlaylist);

// POST /api/playlists/:id/remove - Bỏ video khỏi playlist
router.post('/:id/remove', protect, removeVideoFromPlaylist);

export default router;
