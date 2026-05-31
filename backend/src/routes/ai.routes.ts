import { Router } from 'express';
import { summarizeVideo, translateSubtitle } from '../controllers/ai.controller';

const router = Router();

// Tóm tắt nội dung video
router.post('/summarize', summarizeVideo);

// Dịch phụ đề
router.post('/translate', translateSubtitle);

export default router;
