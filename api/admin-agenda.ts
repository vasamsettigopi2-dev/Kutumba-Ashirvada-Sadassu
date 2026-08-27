import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './db-adapter';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const agenda = await dataService.getAgenda();
    res.status(200).json({ agenda });
  } catch (error: any) {
    console.error('Agenda route error:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch agenda' });
  }
}
