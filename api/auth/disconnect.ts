import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  // Borramos la cookie del token
  res.setHeader('Set-Cookie', [
    'gtoken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
  ]);
  return res.json({ ok: true });
}
