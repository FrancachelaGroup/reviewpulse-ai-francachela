import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.0-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({ reply: 'El asistente requiere una GEMINI_API_KEY configurada en las variables de entorno.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents = Array.isArray(history) && history.length > 0
      ? [...history.map((h: { sender: string; text: string }) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })), { role: 'user', parts: [{ text: message }] }]
      : message;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: `Eres el Asistente Ejecutivo de ReviewPulse AI, plataforma premium de gestión de reputación digital.
Ayudas a optimizar reputación, responder reseñas difíciles y monitorear tendencias.
Responde en español con elegancia y concisión. Usa viñetas cuando sea útil.`,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text?.trim() ?? 'Entendido. ¿En qué más puedo asistirte?' });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el chat', details: String(error) });
  }
}
