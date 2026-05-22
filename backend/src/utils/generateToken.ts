import jwt from 'jsonwebtoken';
import { Response } from 'express';
import mongoose from 'mongoose';

const generateToken = (res: Response, userId: string | mongoose.Types.ObjectId) => {
  const token = jwt.sign({ id: userId }, (process.env.JWT_SECRET as string) || 'secret123', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Chỉ dùng https trên production
    sameSite: 'strict', // Ngăn chặn CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export default generateToken;
