import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'parish_management_secret_key') as any;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Strict Access Control: Admin role required for this operation.' });
  }
  next();
};
