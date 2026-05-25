import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Lấy token từ HTTP-only cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Lấy thông tin user (ngoại trừ password) và gán vào req.user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        (req as any).user = user;
      }
    } catch (error) {
      // Ignored
    }
  }
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
