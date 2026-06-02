import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { 
  getChannelPosts, 
  createPost, 
  toggleLike,
  deletePost 
} from '../controllers/communityController';

const router = express.Router();

router.get('/:id', getChannelPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);

export default router;