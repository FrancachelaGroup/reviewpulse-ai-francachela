import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Faltan clientId o clientSecret' });
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/api/auth/callback`
    );

    // Codificamos las credenciales en el state para recuperarlas en el callback
    const state = Buffer.from(JSON.stringify({ clientId, clientSecret })).toString('base64');

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      state,
      scope: ['https://www.googleapis.com/auth/business.manage'],
    });

    return res.json({ url });
  } catch (error) {
    return res.status(500).json({ error: 'Error iniciando OAuth', details: String(error) });
  }
}
