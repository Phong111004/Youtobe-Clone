import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/auth.controller';
import passport from 'passport';
import { protect } from '../middlewares/auth.middleware';
import generateToken from '../utils/generateToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// --- Google OAuth Routes ---

// Bắt đầu quá trình xác thực Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback sau khi Google xác thực thành công
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Nếu thành công, req.user sẽ có thông tin
    if (req.user) {
      generateToken(res, (req.user as any)._id);
      // Chuyển hướng về Frontend sau khi login thành công
      res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
    } else {
      res.redirect('/login');
    }
  }
);

export default router;
