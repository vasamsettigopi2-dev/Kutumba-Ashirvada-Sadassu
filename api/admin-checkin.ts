import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!verifyAdmin(req, res)) return;

  try {
    const { unique_code } = req.body || {};
    const attendee = await dataService.findRegistrationByCode(unique_code);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found with this code' });

    if (attendee.checked_in) {
      return res.status(200).json({ success: true, message: 'Already checked in', doc: attendee });
    }

    await dataService.updateRegistration(attendee.id, {
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    });
    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      doc: { ...attendee, checked_in: true },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Check-in failed: ' + (error?.message || error) });
  }
}
