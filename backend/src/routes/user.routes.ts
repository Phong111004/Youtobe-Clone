import express from 'express';
import { toggleSubscribe, addToHistory, getHistory, getChannelProfile } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// GET /api/users/channel/:id - Get channel profile (Public)
router.get('/channel/:id', getChannelProfile);

// POST /api/users/subscribe/:channelId - Toggle subscribe
router.post('/subscribe/:channelId', protect, toggleSubscribe);

// POST /api/users/history/:videoId - Add video to history
router.post('/history/:videoId', protect, addToHistory);

// GET /api/users/history - Get watch history
router.get('/history', protect, getHistory);

export default router;
