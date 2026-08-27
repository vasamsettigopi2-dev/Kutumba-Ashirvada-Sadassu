import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;
let cachedHandler: Handler | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!cachedHandler) {
      const [{ default: app }, { default: serverless }] = await Promise.all([
        import('../lib/app'),
        import('serverless-http'),
      ]);
      cachedHandler = serverless(app) as Handler;
    }
    return cachedHandler(req, res);
  } catch (error: any) {
    console.error('API bootstrap error:', error);
    res.status(500).json({
      error: 'API failed to start',
      message: error?.message || String(error),
    });
  }
}
