import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error, state } = req.query;

  if (error || !code) {
    return res.redirect(`/?auth=error&reason=${error || 'no_code'}`);
  }

  let clientId = '', clientSecret = '';
  try {
    const decoded = JSON.parse(Buffer.from(state as string, 'base64').toString('utf8'));
    clientId = decoded.clientId;
    clientSecret = decoded.clientSecret;
  } catch {
    return res.redirect('/?auth=error&reason=invalid_state');
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/api/auth/callback`
    );

    const { tokens } = await oauth2Client.getToken(code as string);

    // Guardar tokens en cookie httpOnly segura
    const tokenData = JSON.stringify({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date:   tokens.expiry_date,
      clientId,
      clientSecret,
    });

    const encoded = Buffer.from(tokenData).toString('base64');
    const maxAge  = 60 * 60 * 24 * 30; // 30 días

    res.setHeader('Set-Cookie',
      `gtoken=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.redirect('/?auth=success');
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.redirect('/?auth=error&reason=token_exchange');
  }
}
