import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    googleClientId:     process.env.GOOGLE_CLIENT_ID     || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleAccountId:    process.env.GOOGLE_ACCOUNT_ID    || '',
    googleLocationId:   process.env.GOOGLE_LOCATION_ID   || '',
  });
}
