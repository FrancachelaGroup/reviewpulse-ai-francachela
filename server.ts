import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route to generate AI Response for a review
  app.post('/api/generate-response', async (req, res) => {
    try {
      const { reviewText, rating, author, platform, protocol, customInstructions } = req.body;

      if (!reviewText) {
        return res.status(400).json({ error: 'reviewText is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response if GEMINI_API_KEY is not configured yet
        const fallback = rating >= 4
          ? `Estimado/a ${author || 'Cliente'}, agradecemos sinceramente su comentario en ${platform || 'Google Review'}. En Francachela nos esforzamos por ofrecer un servicio impecable y una experiencia memorable. ¡Nos encantará recibirle de nuevo muy pronto!`
          : `Estimado/a ${author || 'Cliente'}, lamentamos que su experiencia no haya sido plenamente satisfactoria. En Francachela tomamos su retroalimentación con máxima seriedad. Le invitamos a contactarnos directamente para atender su caso personalmente.`;
        return res.json({
          responseText: fallback,
          sentiment: rating >= 4 ? 'POSITIVE' : rating === 3 ? 'NEUTRAL' : 'NEGATIVE',
          confidence: 90,
          keyPoints: ['Generado con protocolo por defecto'],
        });
      }

      const ai = getAiClient();
      const systemInstruction = `Eres el asistente de IA oficial de 'Francachela' (ReviewPulse AI).
Tu misión es generar respuestas pulidas, altamente profesionales y con elegancia según el Protocolo de Voz de la marca.
Tono configurado: ${protocol?.tone || 'Nocturno & Elegante'}.
Palabras clave de marca a incluir si es oportuno: ${(protocol?.brandKeywords || []).join(', ')}.
Palabras prohibidas (NUNCA USAR): ${(protocol?.forbiddenWords || []).join(', ')}.
Plantilla de saludo: ${protocol?.greetingTemplate || 'Estimado/a {Nombre},'}
Plantilla de despedida: ${protocol?.signOffTemplate || 'Atentamente,\nEl Equipo de Francachela'}
Instrucciones personalizadas del protocolo: ${protocol?.customRules || 'Responde con elegancia y máxima atención al detalle.'}

Formato de respuesta deseado: Un objeto JSON que contenga:
- responseText: la respuesta lista para publicar
- sentiment: POSITIVE, NEUTRAL, o NEGATIVE
- confidence: un número del 1 al 100
- keyPoints: un array de 2-3 puntos clave identificados en la reseña.`;

      const prompt = `Reseña de usuario:
Autor: ${author || 'Anónimo'}
Plataforma: ${platform || 'Google Review'}
Calificación: ${rating || 5}/5 estrellas
Texto de la reseña: "${reviewText}"
Instrucciones adicionales para esta respuesta: ${customInstructions || 'Ninguna'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING, description: 'La respuesta redactada para el cliente' },
              sentiment: { type: Type.STRING, description: 'POSITIVE, NEUTRAL or NEGATIVE' },
              confidence: { type: Type.NUMBER, description: 'Score from 0 to 100' },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Puntos clave analizados',
              },
            },
            required: ['responseText', 'sentiment', 'confidence'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);

      return res.json({
        responseText: parsed.responseText,
        sentiment: parsed.sentiment || (rating >= 4 ? 'POSITIVE' : 'NEGATIVE'),
        confidence: parsed.confidence || 95,
        keyPoints: parsed.keyPoints || [],
      });
    } catch (error: any) {
      console.error('Error generating AI review response:', error);
      return res.status(500).json({
        error: 'Failed to generate response',
        details: error?.message || String(error),
      });
    }
  });

  // API Route to analyze sentiment & topics for a review
  app.post('/api/analyze-review', async (req, res) => {
    try {
      const { content, rating } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          sentiment: rating >= 4 ? 'POSITIVE' : rating === 3 ? 'NEUTRAL' : 'NEGATIVE',
          summary: content.slice(0, 100) + '...',
          priority: rating <= 2 ? 'ALTA' : 'NORMAL',
        });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Analiza esta reseña para el restaurante/marca Francachela:
"${content}"
Calificación: ${rating}/5`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              summary: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ['sentiment', 'summary', 'priority'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error analyzing review:', error);
      return res.status(500).json({ error: error?.message || 'Error analyzing review' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
