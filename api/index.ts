import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import app from './lib/app';

const handler = serverless(app);

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  try {
    return handler(req, res);
  } catch (error: any) {
    console.error('API bootstrap error:', error);
    res.status(500).json({
      error: 'API failed to start',
      message: error?.message || String(error),
    });
  }
}
