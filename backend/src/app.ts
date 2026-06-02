import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import commentRoutes from './routes/comment.routes';
import userRoutes from './routes/user.routes';
import playlistRoutes from './routes/playlist.routes';
import notificationRoutes from './routes/notification.routes';
import studioRoutes from './routes/studio.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import communityRoutes from './routes/community.routes';
import { createServer } from 'http';
import { initSocket } from './socket';


// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

import './config/passport'; // Import passport config
import passport from 'passport';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(passport.initialize());

// Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'YouTube Clone API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes); // ⭐ THÊM DÒNG NÀY
// Port configuration
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
