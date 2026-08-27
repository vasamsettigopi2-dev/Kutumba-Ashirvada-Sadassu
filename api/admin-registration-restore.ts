import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!verifyAdmin(req, res)) return;

  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing registration id' });

    await dataService.restoreRegistration(id);
    res.status(200).json({ success: true, message: 'Registration restored successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to restore: ' + error.message });
  }
}
