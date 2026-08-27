import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_db-adapter';
import { verifyAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const templates = await dataService.getTemplates();
      return res.status(200).json({ templates });
    }
    if (req.method === 'POST') {
      await dataService.saveTemplates(req.body);
      return res.status(200).json({ success: true, message: 'Templates saved successfully' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to handle templates: ' + error.message });
  }
}
