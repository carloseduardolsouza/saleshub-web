import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const DEV_SECRET = 'saleshub-secret-key-2026';
const JWT_SECRET = process.env.JWT_SECRET || DEV_SECRET;
if (JWT_SECRET === DEV_SECRET) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET deve ser definido em producao');
  console.warn('[auth] JWT_SECRET nao definido: usando segredo de desenvolvimento');
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalido ou expirado' });
  }
}

export function signToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
}
