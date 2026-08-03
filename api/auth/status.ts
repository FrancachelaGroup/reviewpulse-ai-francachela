import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cookie = req.headers.cookie || '';
  const hasToken = cookie.includes('gtoken=');
  return res.json({ authenticated: hasToken });
}
