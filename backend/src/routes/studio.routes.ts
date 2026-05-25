import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getChannelAnalytics } from '../controllers/studio.controller';

const router = express.Router();

// Tất cả các route studio đều cần đăng nhập
router.use(protect);

router.get('/analytics', getChannelAnalytics);

export default router;
