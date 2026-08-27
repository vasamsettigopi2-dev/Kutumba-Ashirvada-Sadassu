import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const envAdminUser = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  const envAdminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
  const JWT_SECRET = process.env.JWT_SECRET || 'ngm-sadassu-2026-secret-key';

  const isValid =
    (username === 'admin1' && password === 'admin1') ||
    (username === 'admin2' && password === 'admin2') ||
    (username === 'admin@demo.com' && password === 'admin123') ||
    (envAdminUser && envAdminPass && username === envAdminUser && password === envAdminPass);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  try {
    const token = jwt.sign({ email: username, uid: username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, email: username });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate token: ' + (error?.message || error) });
  }
}
