import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modelo correcto disponible en Gemini API
const GEMINI_MODEL = 'gemini-2.0-flash';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Inicialización lazy del cliente Gemini
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
    });
  });

  // ── Generar respuesta a reseña ───────────────────────────
  app.post('/api/generate-reply', async (req, res) => {
    try {
      const { author, rating, content, tone, signature, platform } = req.body;

      const ai = getGeminiClient();

      // Fallback si no hay API key
      if (!ai) {
        const sign = signature ? `\n\n${signature}` : '\n\nAtentamente,\nEl Equipo de Dirección.';
        let text = '';
        if (rating >= 4) {
          text = `Estimado/a ${author || 'Cliente'}, le agradecemos sinceramente por su reseña de ${rating} estrellas en ${platform || 'nuestra plataforma'}. Nos alegra saber que su experiencia fue satisfactoria y esperamos tenerle de vuelta pronto.${sign}`;
        } else {
          text = `Estimado/a ${author || 'Cliente'}, agradecemos que comparta sus comentarios. Lamentamos que su experiencia en ${platform || 'nuestro establecimiento'} no haya sido la esperada. Nos gustaría conocer más detalles para mejorar de inmediato.${sign}`;
        }
        return res.json({ reply: text, source: 'fallback' });
      }

      const systemPrompt = `Eres ReviewPulse AI, motor de inteligencia artificial para gestión de reputación corporativa.
Tu tarea es redactar una respuesta profesional en español a una reseña de cliente.

Tono solicitado: "${tone || 'Formal'}"
- Formal: lenguaje distinguido, respetuoso y estructurado.
- Cercano: empático, cálido y cordial.
- Conciso: directo, breve pero educado.
- Empático: comprensión profunda, validación de emociones.

Reglas:
1. Dirígete al cliente por su nombre con cortesía.
2. Calificación alta (4-5 ★): agradece con elegancia.
3. Calificación baja (1-3 ★): muestra preocupación genuina y ofrece canal de contacto.
4. Incluye la firma exactamente al final si se provee, sin duplicarla.
Firma: "${signature || ''}"`;

      const userPrompt = `Reseña:
Autor: ${author || 'Cliente'}
Calificación: ${rating}/5 ★
Plataforma: ${platform || 'Google Business'}
Mensaje: "${content}"

Genera una respuesta fluida y adaptada al tono "${tone}". Sin comillas alrededor del texto.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: { systemInstruction: systemPrompt, temperature: 0.7 },
      });

      const reply = response.text?.trim() ?? 'Agradecemos sinceramente su comentario.';
      return res.json({ reply, source: GEMINI_MODEL });

    } catch (error) {
      console.error('Error generating reply:', error);
      return res.status(500).json({ error: 'Error generando respuesta', details: String(error) });
    }
  });

  // ── Chat con asistente ───────────────────────────────────
  app.post('/api/assistant-chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: 'Hola, soy el Asistente ReviewPulse AI. Puedo ayudarte a redactar respuestas, analizar reputación y configurar el piloto automático. ¿En qué te enfoco hoy?\n\n*(Nota: configura tu GEMINI_API_KEY en el archivo .env para activar la IA completa.)*',
        });
      }

      const systemInstruction = `Eres el Asistente Ejecutivo de ReviewPulse AI, plataforma premium de gestión autónoma de reputación digital.
Ayudas a optimizar el índice de satisfacción, responder reseñas difíciles, configurar personalidades de IA y monitorear tendencias.
Responde siempre en español con elegancia y concisión. Usa viñetas cuando sea útil.`;

      const contents = Array.isArray(history) && history.length > 0
        ? [
            ...history.map((h: { sender: string; text: string }) => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ]
        : message;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: { systemInstruction, temperature: 0.7 },
      });

      return res.json({ reply: response.text?.trim() ?? 'Entendido. ¿En qué más puedo asistirte?' });

    } catch (error) {
      console.error('Error in assistant chat:', error);
      return res.status(500).json({ error: 'Error procesando el chat', details: String(error) });
    }
  });

  // ── Vite dev / producción ────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 ReviewPulse AI corriendo en http://localhost:${PORT}`);
    console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ configurada' : '⚠️  sin configurar (modo fallback)'}\n`);
  });
}

startServer().catch(console.error);
