import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!verifyAdmin(req, res)) return;

  try {
    const forceFresh =
      Boolean(req.query.force) || String(req.query.forceFresh) === 'true';
    const registrations = await dataService.getAllRegistrations(forceFresh);
    res.status(200).json({ registrations });
  } catch (error: any) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations: ' + (error?.message || error) });
  }
}
