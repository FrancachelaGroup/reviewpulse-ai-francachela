import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_MODEL = 'gemini-2.0-flash';

// ── Token store en memoria (en producción usar DB o Redis) ─
let oauthTokens: { access_token: string; refresh_token: string; expiry_date: number } | null = null;

// ── Crear cliente OAuth2 ───────────────────────────────────
function createOAuth2Client(clientId: string, clientSecret: string) {
  const redirectUri = process.env.APP_URL
    ? `${process.env.APP_URL}/auth/callback`
    : 'http://localhost:3000/auth/callback';
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  };

  // ── Health check ─────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      gemini: !!process.env.GEMINI_API_KEY,
      googleAuth: !!oauthTokens,
    });
  });

  // ── PASO 1: Generar URL de autorización OAuth ─────────────
  // El frontend llama a esto con las credenciales del usuario
  // y recibe una URL para redirigir al usuario a Google
  app.post('/api/auth/google-url', (req, res) => {
    try {
      const { clientId, clientSecret } = req.body;
      if (!clientId || !clientSecret) {
        return res.status(400).json({ error: 'Faltan clientId o clientSecret' });
      }
      const oauth2Client = createOAuth2Client(clientId, clientSecret);
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/business.manage',
        ],
      });
      return res.json({ url });
    } catch (error) {
      return res.status(500).json({ error: 'Error generando URL de auth', details: String(error) });
    }
  });

  // ── PASO 2: Callback de OAuth ─────────────────────────────
  // Google redirige aquí con el código de autorización
  app.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect('/?auth=error&reason=' + (error || 'no_code'));
    }
    // Recuperar credenciales temporales guardadas en query param state
    // En producción usar session o state JWT firmado
    const state = req.query.state as string;
    let clientId = '', clientSecret = '';
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      clientId = decoded.clientId;
      clientSecret = decoded.clientSecret;
    } catch {
      return res.redirect('/?auth=error&reason=invalid_state');
    }
    try {
      const oauth2Client = createOAuth2Client(clientId, clientSecret);
      const { tokens } = await oauth2Client.getToken(code as string);
      oauthTokens = {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        expiry_date: tokens.expiry_date!,
      };
      // Guardar clientId y clientSecret en proceso para reuso
      process.env.GOOGLE_CLIENT_ID = clientId;
      process.env.GOOGLE_CLIENT_SECRET = clientSecret;
      return res.redirect('/?auth=success');
    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.redirect('/?auth=error&reason=token_exchange');
    }
  });

  // ── PASO 2b: Iniciar OAuth con state ─────────────────────
  app.post('/api/auth/connect', (req, res) => {
    try {
      const { clientId, clientSecret } = req.body;
      if (!clientId || !clientSecret) {
        return res.status(400).json({ error: 'Faltan credenciales' });
      }
      const state = Buffer.from(JSON.stringify({ clientId, clientSecret })).toString('base64');
      const oauth2Client = createOAuth2Client(clientId, clientSecret);
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
  });

  // ── PASO 3: Estado de autenticación ──────────────────────
  app.get('/api/auth/status', (_req, res) => {
    res.json({ authenticated: !!oauthTokens });
  });

  // ── PASO 4: Obtener reseñas reales de Google Business ────
  app.post('/api/google/reviews', async (req, res) => {
    if (!oauthTokens) {
      return res.status(401).json({ error: 'No autenticado. Conecta tu cuenta de Google primero.' });
    }
    const { accountId, locationId } = req.body;
    if (!accountId || !locationId) {
      return res.status(400).json({ error: 'Faltan accountId o locationId' });
    }
    try {
      const oauth2Client = createOAuth2Client(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!
      );
      oauth2Client.setCredentials(oauthTokens);

      // Refrescar token si está vencido
      if (oauthTokens.expiry_date && Date.now() > oauthTokens.expiry_date - 60000) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauthTokens = {
          access_token: credentials.access_token!,
          refresh_token: credentials.refresh_token ?? oauthTokens.refresh_token,
          expiry_date: credentials.expiry_date!,
        };
        oauth2Client.setCredentials(oauthTokens);
      }

      // Llamada a la API de reseñas
      const cleanAccountId  = accountId.replace('accounts/', '');
      const cleanLocationId = locationId.replace('locations/', '');
      const url = `https://mybusiness.googleapis.com/v4/accounts/${cleanAccountId}/locations/${cleanLocationId}/reviews`;

      const response = await oauth2Client.request<any>({ url });
      const raw = response.data;

      // Mapear al formato de la app
      const reviews = (raw.reviews || []).map((r: any) => ({
        id: r.reviewId,
        author: r.reviewer?.displayName || 'Cliente',
        avatarUrl: r.reviewer?.profilePhotoUrl,
        platform: 'Google Business' as const,
        rating: { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r.starRating as string] || 3,
        date: new Date(r.createTime).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
        content: r.comment || '(Sin comentario escrito)',
        sentiment: (({ ONE: 'critical', TWO: 'critical', THREE: 'neutral', FOUR: 'positive', FIVE: 'positive' } as any)[r.starRating] || 'neutral'),
        status: r.reviewReply ? 'responded' : 'pending',
        aiResponse: r.reviewReply?.comment,
        responseDate: r.reviewReply?.updateTime
          ? new Date(r.reviewReply.updateTime).toLocaleDateString('es-CO')
          : undefined,
      }));

      return res.json({ reviews, totalCount: raw.totalReviewCount || reviews.length });
    } catch (error: any) {
      console.error('Error fetching reviews:', error?.response?.data || error);
      const status = error?.response?.status || 500;
      const msg = error?.response?.data?.error?.message || String(error);
      return res.status(status).json({ error: 'Error obteniendo reseñas de Google', details: msg });
    }
  });

  // ── Desconectar ───────────────────────────────────────────
  app.post('/api/auth/disconnect', (_req, res) => {
    oauthTokens = null;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    res.json({ ok: true });
  });

  // ── Generar respuesta a reseña ───────────────────────────
  app.post('/api/generate-reply', async (req, res) => {
    try {
      const { author, rating, content, tone, signature, platform } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        const sign = signature ? `\n\n${signature}` : '\n\nAtentamente,\nEl Equipo de Dirección.';
        const text = rating >= 4
          ? `Estimado/a ${author || 'Cliente'}, le agradecemos por su reseña de ${rating} estrellas. Nos alegra que su experiencia haya sido satisfactoria.${sign}`
          : `Estimado/a ${author || 'Cliente'}, agradecemos sus comentarios. Lamentamos que su experiencia no haya sido la esperada y nos gustaría conocer más detalles.${sign}`;
        return res.json({ reply: text, source: 'fallback' });
      }
      const systemPrompt = `Eres ReviewPulse AI, motor de IA para gestión de reputación corporativa.
Redacta una respuesta profesional en español a una reseña de cliente.
Tono: "${tone || 'Formal'}" — Formal: distinguido y estructurado. Cercano: empático y cálido. Conciso: breve y directo. Empático: comprensión profunda.
Reglas: dirígete por nombre, agradece si ≥4★, muestra preocupación si ≤3★, incluye firma al final sin duplicar.
Firma: "${signature || ''}"`;
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Autor: ${author}\nCalificación: ${rating}/5★\nPlataforma: ${platform}\nMensaje: "${content}"\nGenera respuesta con tono "${tone}". Sin comillas.`,
        config: { systemInstruction: systemPrompt, temperature: 0.7 },
      });
      return res.json({ reply: response.text?.trim() ?? 'Agradecemos su comentario.', source: GEMINI_MODEL });
    } catch (error) {
      return res.status(500).json({ error: 'Error generando respuesta', details: String(error) });
    }
  });

  // ── Chat con asistente ───────────────────────────────────
  app.post('/api/assistant-chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({ reply: 'Configura tu GEMINI_API_KEY para activar el asistente.' });
      }
      const contents = Array.isArray(history) && history.length > 0
        ? [...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
           { role: 'user', parts: [{ text: message }] }]
        : message;
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL, contents,
        config: { systemInstruction: `Eres el Asistente Ejecutivo de ReviewPulse AI. Ayudas a optimizar reputación digital, responder reseñas y configurar la IA. Responde en español con elegancia y concisión.`, temperature: 0.7 },
      });
      return res.json({ reply: response.text?.trim() ?? 'Entendido. ¿En qué más puedo asistirte?' });
    } catch (error) {
      return res.status(500).json({ error: 'Error en el chat', details: String(error) });
    }
  });

  // ── Vite dev / producción ────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 ReviewPulse AI en http://localhost:${PORT}`);
    console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅' : '⚠️  sin configurar'}`);
    console.log(`   Google OAuth: listo para conectar\n`);
  });
}

startServer().catch(console.error);
