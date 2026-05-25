import { Request, Response } from 'express';
import Playlist from '../models/playlist.model';
import Video from '../models/video.model';

// @desc    Get user's playlists
// @route   GET /api/playlists
// @access  Private
export const getMyPlaylists = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });
    
    // Đảm bảo user luôn có playlist Xem sau (Watch Later)
    let hasWatchLater = playlists.some(p => p.isWatchLater);
    if (!hasWatchLater) {
      const watchLater = await Playlist.create({
        name: 'Xem sau',
        owner: userId,
        isPrivate: true,
        isWatchLater: true
      });
      playlists.unshift(watchLater);
    }
    
    res.json(playlists);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isPrivate } = req.body;
    const userId = (req as any).user._id;

    if (!name) {
      res.status(400).json({ message: 'Tên danh sách phát không được để trống' });
      return;
    }

    const playlist = await Playlist.create({
      name,
      owner: userId,
      isPrivate: isPrivate ?? true,
      isWatchLater: false
    });

    res.status(201).json(playlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Public/Private (depending on isPrivate)
export const getPlaylistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'videos',
        populate: { path: 'owner', select: 'username avatar' }
      });

    if (!playlist) {
      res.status(404).json({ message: 'Không tìm thấy danh sách phát' });
      return;
    }

    const userId = (req as any).user?._id;
    if (playlist.isPrivate && playlist.owner.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'Danh sách phát này là riêng tư' });
      return;
    }

    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add video to playlist
// @route   POST /api/playlists/:id/add
// @access  Private
export const addVideoToPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.body;
    const userId = (req as any).user._id;

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      res.status(404).json({ message: 'Không tìm thấy danh sách phát' });
      return;
    }

    if (playlist.owner.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Bạn không có quyền thêm video vào danh sách này' });
      return;
    }

    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
      await playlist.save();
    }

    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove video from playlist
// @route   POST /api/playlists/:id/remove
// @access  Private
export const removeVideoFromPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.body;
    const userId = (req as any).user._id;

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      res.status(404).json({ message: 'Không tìm thấy danh sách phát' });
      return;
    }

    if (playlist.owner.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Bạn không có quyền xóa video khỏi danh sách này' });
      return;
    }

    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId.toString());
    await playlist.save();

    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
