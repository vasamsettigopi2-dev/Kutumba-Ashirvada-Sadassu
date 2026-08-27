import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const user = verifyAdmin(req, res);
  if (!user) return;

  try {
    const { id, permanent } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing registration id' });

    await dataService.deleteRegistration(id, Boolean(permanent), user.email);
    res.status(200).json({
      success: true,
      message: permanent ? 'Permanently deleted' : 'Moved to Deleted Bin',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete: ' + error.message });
  }
}
