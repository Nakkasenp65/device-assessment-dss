import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

import { sendResponse } from '../utils/responseHelper.js';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || (req as any).cookies?.token;

  if (!token) {
    sendResponse(res, 401, null, 'Access token required');
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: unknown, user: any) => {
    if (err) {
      sendResponse(res, 401, null, 'Invalid or expired token');
      return;
    }

    req.user = user as NonNullable<AuthRequest['user']>;

    next();
  });
};

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== requiredRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
