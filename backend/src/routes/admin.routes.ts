import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware';
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllPlatformVideos,
  deleteAnyVideo,
  makeMeAdmin
} from '../controllers/admin.controller';

const router = express.Router();

// Cheat endpoint (Chỉ cần đăng nhập)
router.get('/make-me-admin', protect, makeMeAdmin);

// Các route bên dưới yêu cầu quyền Admin
router.use(protect, isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/videos', getAllPlatformVideos);
router.delete('/videos/:id', deleteAnyVideo);

export default router;
