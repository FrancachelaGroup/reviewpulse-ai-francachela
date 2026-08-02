import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Review Response Endpoint
app.post('/api/generate-response', async (req, res) => {
  try {
    const { reviewText, rating, authorName, tone = 'Formal', protocolSignature = '', businessName = 'Francachela' } = req.body;

    const ai = getGeminiClient();

    const prompt = `Eres el Gerente de Reputación y Relación con Clientes de "${businessName}".
Tu objetivo es redactar una respuesta profesional, empática, elegante y muy atenta a una reseña publicada por un cliente en Google Business Profile.

Datos de la Reseña:
- Nombre del Cliente: ${authorName || 'Cliente'}
- Calificación: ${rating} de 5 estrellas
- Comentario de la Reseña: "${reviewText || 'Sin comentario de texto'}"

Instrucciones de Tono y Estilo:
- Tono seleccionado: ${tone} (Formal, Cercano, Profesional o Entusiasta).
- Adapta el lenguaje rigurosamente al tono "${tone}".
- Si la calificación es baja (1-3 estrellas), muestra mucha empatía, ofrece resolver el problema directamente y proporciona discreción.
- Si la calificación es alta (4-5 estrellas), agradece efusivamente la preferencia, destaca detalles positivos y reitera la bienvenida para su próxima visita.
- Mantén la respuesta breve y contundente (máximo 3 párrafos cortos).
${protocolSignature ? `- Finaliza el mensaje añadiendo la siguiente firma oficial exactamente al final: "${protocolSignature}"` : ''}

Escribe solo la respuesta final lista para publicar, sin introducciones adicionales ni comillas externas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const reply = response.text?.trim() || '';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error generating AI review response:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al generar la respuesta con la Inteligencia Artificial.',
    });
  }
});

// AI Assistant Chat Endpoint
app.post('/api/assistant-chat', async (req, res) => {
  try {
    const { messages, tone = 'Formal', businessName = 'Francachela' } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `Eres "Francachela ReviewPulse AI Assistant", un consultor experto en reputación de marca, experiencia de cliente y marketing gastronómico para la marca "${businessName}".
Ayudas al usuario (Roberto o el gerente del negocio) a redactar mensajes, analizar tendencias de opinión, manejar crisis de comunicación, optimizar su Google Business Profile y afinar la voz de la marca.
Responde siempre en español, de forma muy distinguida, elegante, concisa y útil.`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
    });

    let lastUserMessage = 'Hola';
    if (Array.isArray(messages) && messages.length > 0) {
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        if (msg.role === 'user') {
          await chat.sendMessage({ message: msg.content || msg.text });
        }
      }
      lastUserMessage = messages[messages.length - 1].content || messages[messages.length - 1].text;
    }

    const response = await chat.sendMessage({ message: lastUserMessage });

    res.json({
      success: true,
      reply: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('Error in assistant chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al comunicarse con el asistente de IA.',
    });
  }
});

async function startServer() {
  // Vite Middleware for Development or Static Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
