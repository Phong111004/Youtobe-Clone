import express from 'express';
import { getComments, getReplies, addComment } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/:videoId', getComments);
router.get('/:videoId/replies/:commentId', getReplies);
router.post('/:videoId', protect, addComment);

export default router;
