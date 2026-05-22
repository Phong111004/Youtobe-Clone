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

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

import './config/passport'; // Import passport config
import passport from 'passport';

const app = express();

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

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
