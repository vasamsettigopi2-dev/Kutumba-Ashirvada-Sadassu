import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default agenda shown when Firestore is unavailable (matches local fallback data)
const DEFAULT_AGENDA = [
  {
    id: 'day1-1',
    date: '2026-10-16',
    time: '10:00 AM - 01:00 PM',
    title: 'Opening Family Dedication & Prayer',
    speaker: 'Bro. P. Sunil Kumar Garu',
    session_type: 'Family Life',
    target_audience: 'All',
  },
  {
    id: 'day1-2',
    date: '2026-10-16',
    time: '06:00 PM - 09:00 PM',
    title: 'Public Blessing Evening Revival',
    speaker: 'Bro. P. Sunil Kumar Garu',
    session_type: 'Revival Meeting',
    target_audience: 'Public',
  },
];

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { dataService } = await import('./lib/db-adapter');
    const agenda = await dataService.getAgenda();
    res.status(200).json({ agenda });
  } catch (error: any) {
    console.error('Agenda Firestore error, using defaults:', error?.message);
    res.status(200).json({ agenda: DEFAULT_AGENDA });
  }
}
