import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ping } from './lib/ping';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ping });
}
