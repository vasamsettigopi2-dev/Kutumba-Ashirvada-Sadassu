import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  try {
    if (req.method === 'GET' && !id) {
      const agenda = await dataService.getAgenda();
      return res.status(200).json({ agenda });
    }

    if (!verifyAdmin(req, res)) return;

    if (req.method === 'POST' && !id) {
      const newId = await dataService.addAgenda(req.body);
      return res.status(200).json({ success: true, id: newId });
    }

    if (req.method === 'PUT' && id) {
      await dataService.updateAgenda(id, req.body);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE' && id) {
      await dataService.deleteAgenda(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Agenda route error:', error);
    res.status(500).json({ error: error?.message || 'Agenda request failed' });
  }
}
