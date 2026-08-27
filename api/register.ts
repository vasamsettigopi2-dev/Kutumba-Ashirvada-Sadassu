import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataService } = await import('./lib/db-adapter');
    const { name, phone, email, church_city, category, gender, days_attending } = req.body || {};

    if (!name || !phone || !days_attending || !Array.isArray(days_attending) || days_attending.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanPhone = String(phone).trim();
    const existing = await dataService.findRegistrationByPhone(cleanPhone);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Already registered',
        unique_code: existing.unique_code,
        isDuplicate: true,
      });
    }

    const result = await dataService.createRegistration({
      name,
      phone: cleanPhone,
      email: email || '',
      church_city: church_city || '',
      category: category || 'Adult',
      gender: gender || 'Male',
      days_attending,
      created_at: new Date().toISOString(),
      confirmation_status: 'not_sent',
      confirmation_at: null,
      confirmation_by: null,
      reminder_3_status: 'not_sent',
      reminder_3_at: null,
      reminder_3_by: null,
      reminder_2_status: 'not_sent',
      reminder_2_at: null,
      reminder_2_by: null,
      reminder_1_status: 'not_sent',
      reminder_1_at: null,
      reminder_1_by: null,
      checked_in: false,
      checked_in_at: null,
    });

    res.status(200).json({ success: true, unique_code: result.unique_code, isDuplicate: false });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to process registration: ' + (error?.message || error) });
  }
}
