import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../lib/app';

let cachedHandler: ((req: VercelRequest, res: VercelResponse) => void) | null = null;

async function getHandler() {
  if (!cachedHandler) {
    const { default: serverless } = await import('serverless-http');
    cachedHandler = serverless(app);
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = await getHandler();
  return fn(req, res);
}
