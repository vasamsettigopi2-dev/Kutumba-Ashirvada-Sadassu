import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { getDb } = await import('./_lib/firebase-admin');
    const db = await getDb();
    res.status(200).json({ firebase_connected: Boolean(db) });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Firebase test failed' });
  }
}
