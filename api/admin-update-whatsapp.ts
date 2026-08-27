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
    const { id, messageType, status } = req.body || {};
    if (!id || !messageType || !status) {
      return res.status(400).json({ error: 'Missing id, messageType, or status' });
    }

    const updateData: Record<string, unknown> = {};
    updateData[`${messageType}_status`] = status;
    updateData[`${messageType}_at`] = new Date().toISOString();
    updateData[`${messageType}_by`] = user.email;
    updateData[`whatsapp_status.${messageType}`] = {
      status,
      timestamp: new Date().toISOString(),
      admin_email: user.email,
    };

    await dataService.updateRegistration(id, updateData);
    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update status: ' + (error?.message || error) });
  }
}
