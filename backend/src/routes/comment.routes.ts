import express from 'express';
import { getComments, getReplies, addComment, likeComment, dislikeComment } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/:videoId', getComments);
router.get('/:videoId/replies/:commentId', getReplies);
router.post('/:videoId', protect, addComment);
router.post('/like/:commentId', protect, likeComment);
router.post('/dislike/:commentId', protect, dislikeComment);

export default router;
