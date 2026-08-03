import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for lazy Gemini initialization
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Generate Review Response with AI
  app.post('/api/generate-reply', async (req, res) => {
    try {
      const { author, rating, content, tone, signature, platform } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        // High quality fallback generation if key not configured
        const fallbackSign = signature ? `\n\n${signature}` : '\n\nAtentamente, El Equipo de Dirección.';
        let fallbackText = '';
        if (rating >= 4) {
          fallbackText = `Estimado/a ${author || 'Cliente'}: Le agradecemos sinceramente por su excelente reseña de ${rating} estrellas en ${platform || 'nuestra plataforma'}. Nos alegra enormemente saber que su experiencia fue muy satisfactoria. Esperamos tener el honor de atenderle de nuevo pronto.${fallbackSign}`;
        } else {
          fallbackText = `Estimado/a ${author || 'Cliente'}: Agradecemos que se haya tomado el tiempo de compartir sus comentarios sobre su experiencia en ${platform || 'nuestra empresa'}. Lamentos sinceramente que su vivencia no haya superado sus expectativas en esta ocasión. Nos gustaría escuchar más detalles para mejorar de inmediato.${fallbackSign}`;
        }
        return res.json({ reply: fallbackText, source: 'rule-based' });
      }

      const systemPrompt = `Eres ReviewPulse AI, el motor de inteligencia artificial líder en gestión de reputación corporativa e imagen de marca. 
Tu tarea es redactar una respuesta profesional en español a una reseña de un cliente.

Instrucciones de tono:
- Tono solicitado: "${tone || 'Formal'}"
- Si el tono es "Formal": usa un lenguaje distinguido, respetuoso y estructurado.
- Si el tono es "Cercano": usa un lenguaje empático, cálido, accesible y cordial.
- Si el tono es "Conciso": sé directo, ágil y breve pero muy educado.
- Si el tono es "Empático": enfócate en la comprensión profunda, la validación de emociones y la calidez.

Reglas adicionales:
1. Dirígete a ${author || 'el cliente'} con cortesía.
2. Si la calificación es alta (4 o 5 estrellas), agradece con elegancia.
3. Si la calificación es baja (1, 2 o 3 estrellas), muestra preocupación genuina, ofrece soluciones discretas o canal de contacto directo.
4. Si se proporciona firma de protocolo, incorpórala al final del texto sin duplicar.
Firma a incluir al final si aplica: "${signature || ''}"`;

      const userPrompt = `Reseña de cliente:
Autor: ${author || 'Cliente'}
Calificación: ${rating} / 5 estrellas
Plataforma: ${platform || 'Google Business'}
Mensaje de la reseña: "${content}"

Genera una respuesta única, fluida y perfectamente adaptada al tono "${tone}". No agregues comillas alrededor del texto final.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const replyText = response.text ? response.text.trim() : 'Agradecemos sinceramente su comentario.';
      return res.json({ reply: replyText, source: 'gemini-3.6-flash' });
    } catch (error) {
      console.error('Error generating AI reply:', error);
      return res.status(500).json({ error: 'Failed to generate response', details: String(error) });
    }
  });

  // Assistant Chat with AI
  app.post('/api/assistant-chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          reply: `Hola, soy el asistente ReviewPulse AI. Puedo ayudarte a redactar respuestas a clientes, analizar la reputación de tu negocio, sugerir ajustes al tono de voz y responder consultas sobre el piloto automático. ¿En qué te gustaría enfocar hoy?`,
        });
      }

      const systemInstruction = `Eres el Asistente Ejecutivo de ReviewPulse AI, una plataforma premium de inteligencia artificial y gestión autónoma de reputación digital para marcas de lujo y negocios de alto nivel.
Tu comunicación es sofisticada, clara, objetiva, profesional y resolutiva.
Ayudas a los directores a optimizar su índice de satisfacción, responder a reseñas difíciles, configurar su personalidades de IA y monitorear tendencias de servicio.
Responde siempre en español con elegancia y concisión. Usa viñetas cuando sea útil.`;

      const contents = history && Array.isArray(history) && history.length > 0
        ? [
            ...history.map((h: any) => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ]
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text ? response.text.trim() : 'Entendido. ¿En qué más puedo asistirte?' });
    } catch (error) {
      console.error('Error in assistant chat:', error);
      return res.status(500).json({ error: 'Error processing chat request' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviewPulse AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
