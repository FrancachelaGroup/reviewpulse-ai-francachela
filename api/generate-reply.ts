import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.0-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { author, rating, content, tone, signature, platform } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const sign = signature ? `\n\n${signature}` : '\n\nAtentamente,\nEl Equipo de Dirección.';
    const text = rating >= 4
      ? `Estimado/a ${author || 'Cliente'}, le agradecemos por su reseña. Nos alegra que su experiencia haya sido satisfactoria.${sign}`
      : `Estimado/a ${author || 'Cliente'}, agradecemos sus comentarios y lamentamos que su experiencia no haya sido la esperada.${sign}`;
    return res.json({ reply: text, source: 'fallback' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
}
