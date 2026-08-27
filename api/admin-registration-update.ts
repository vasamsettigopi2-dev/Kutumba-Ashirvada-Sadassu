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
    const { id, name, phone, church_city, gender, category, days_attending, email } = req.body || {};
    if (!id || !name || !phone) {
      return res.status(400).json({ error: 'Missing required attendee fields' });
    }
    await dataService.updateRegistration(id, {
      name,
      phone,
      church_city,
      gender,
      category,
      days_attending,
      email: email || '',
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    });
    res.status(200).json({ success: true, message: 'Registration updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update registration: ' + error.message });
  }
}
