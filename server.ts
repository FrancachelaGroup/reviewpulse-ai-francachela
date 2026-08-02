import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Response Generation for Reviews
app.post("/api/ai/generate-response", async (req, res) => {
  try {
    const {
      customerName = "Cliente",
      rating = 5,
      reviewText = "",
      platform = "Google Maps",
      tone = "Elegante & Exclusivo",
      protocolInstructions = "Agradece cálidamente, mantén una voz sofisticada y nocturna de Francachela Restaurante & Bar Nocturno, e invita al cliente a volver pronto.",
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if API key not available
      return res.json({
        response: `Estimado/a ${customerName}, muchas gracias por compartir su experiencia en Francachela (${platform}). Valoramos profundamente sus ${rating} estrellas. Nuestro equipo continuará brindándole la mejor atmósfera y gastronomía nocturna. ¡Esperamos recibirle pronto de nuevo!`,
        generatedByAi: false,
      });
    }

    const systemInstruction = `
Eres el Asistente Inteligente de Reputación y Protocolo de Voz de "Francachela" (Restaurante y Bar Nocturno de Alta Gama).
Tu objetivo es redactar respuestas a reseñas de clientes de manera impecable, personalizada y profesional.

Instrucciones del Protocolo de Voz actual de Francachela:
- Tono asignado: ${tone}
- Pautas específicas: ${protocolInstructions}
- Reglas:
  1. Si la calificación es de 4-5 estrellas: Agradece la visita, resalta el ambiente, los platillos o cocteles, y haz una cordial invitación a regresar.
  2. Si la calificación es de 1-3 estrellas: Muestra empatía sincera sin excusas defensivas, ofrece atención personalizada enviando un correo o contacto privado para dar seguimiento directo.
  3. Firma siempre de manera refinada (ej. "Atentamente, El equipo de Francachela").
  4. La respuesta debe estar redactada en español fluido y elegante, ajustada para la plataforma ${platform}.
`;

    const userPrompt = `
Redacta la respuesta oficial para la siguiente reseña:
Cliente: ${customerName}
Calificación: ${rating}/5 estrellas
Plataforma: ${platform}
Comentario de la reseña: "${reviewText || "Visita muy agradable, excelente comida y ambiente."}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      response: response.text?.trim() || "Gracias por su preferencia en Francachela.",
      generatedByAi: true,
    });
  } catch (error: any) {
    console.error("Error invoking Gemini API:", error);
    res.status(500).json({
      error: "Error al generar la respuesta de la reseña.",
      details: error?.message || String(error),
    });
  }
});

// AI Voice Protocol Suggestion / Optimizer
app.post("/api/ai/optimize-protocol", async (req, res) => {
  try {
    const { currentTone, brandVoiceNotes } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        optimizedProtocol: `Francachela mantiene un tono ${currentTone || "Elegante y Sofisticado"}, priorizando respuestas cálidas para clientes satisfechos y resoluciones privadas e inmediatas para cualquier inconveniente nocturno.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Optimiza y redacta un protocolo de voz y tono refinado para las respuestas de IA de Francachela. Tono actual: "${currentTone}". Notas adicionales: "${brandVoiceNotes || "Garantizar una experiencia memorable en gastronomía y coctelería nocturna."}"`,
      config: {
        systemInstruction: "Eres un consultor experto en branding de lujo y gestión de reputación para restaurantes de alta gama.",
      },
    });

    res.json({
      optimizedProtocol: response.text?.trim(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Francachela AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
