import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_firebase-admin';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDb();
    res.status(200).json({ firebase_connected: Boolean(db) });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Firebase test failed' });
  }
}
