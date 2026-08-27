import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ngm-sadassu-2026-secret-key';

export function verifyAdmin(
  req: VercelRequest,
  res: VercelResponse
): { email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string };
    return { email: decoded.email || 'admin' };
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}
