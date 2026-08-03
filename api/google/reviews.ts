import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

function getTokensFromCookie(req: VercelRequest) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/gtoken=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const tokenData = getTokensFromCookie(req);
  if (!tokenData?.access_token) {
    return res.status(401).json({ error: 'No autenticado. Conecta tu cuenta de Google primero.' });
  }

  const { accountId, locationId } = req.body;
  if (!accountId || !locationId) {
    return res.status(400).json({ error: 'Faltan accountId o locationId' });
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const oauth2Client = new google.auth.OAuth2(
      tokenData.clientId,
      tokenData.clientSecret,
      `${appUrl}/api/auth/callback`
    );
    oauth2Client.setCredentials({
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date:   tokenData.expiry_date,
    });

    const cleanAccount  = (accountId  as string).replace('accounts/', '');
    const cleanLocation = (locationId as string).replace('locations/', '');
    const url = `https://mybusiness.googleapis.com/v4/accounts/${cleanAccount}/locations/${cleanLocation}/reviews`;

    const response = await oauth2Client.request<any>({ url });
    const raw = response.data;

    const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    const SENT_MAP: Record<string, string> = { ONE: 'critical', TWO: 'critical', THREE: 'neutral', FOUR: 'positive', FIVE: 'positive' };

    const reviews = (raw.reviews || []).map((r: any) => ({
      id:           r.reviewId,
      author:       r.reviewer?.displayName || 'Cliente',
      avatarUrl:    r.reviewer?.profilePhotoUrl,
      platform:     'Google Business',
      rating:       STAR_MAP[r.starRating] ?? 3,
      date:         new Date(r.createTime).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
      content:      r.comment || '(Sin comentario escrito)',
      sentiment:    SENT_MAP[r.starRating] ?? 'neutral',
      status:       r.reviewReply ? 'responded' : 'pending',
      aiResponse:   r.reviewReply?.comment,
      responseDate: r.reviewReply?.updateTime
        ? new Date(r.reviewReply.updateTime).toLocaleDateString('es-CO')
        : undefined,
    }));

    return res.json({ reviews, totalCount: raw.totalReviewCount ?? reviews.length });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const msg    = error?.response?.data?.error?.message || String(error);
    console.error('Error fetching reviews:', msg);
    return res.status(status).json({ error: 'Error obteniendo reseñas', details: msg });
  }
}
