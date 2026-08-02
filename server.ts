import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint to generate AI review response
app.post("/api/ai/generate-reply", async (req, res) => {
  try {
    const { reviewContent, author, platform, rating, voiceProtocol } = req.body;

    if (!reviewContent) {
      return res.status(400).json({ error: "Falta el contenido de la reseña." });
    }

    const ai = getGeminiClient();

    const tone = voiceProtocol?.tone || "Elegante y Sofisticado";
    const brandVoice = voiceProtocol?.brandVoiceDescription || "Respuesta cordial, impecable y atenta.";
    const signature = voiceProtocol?.signature || "Atentamente, Francachela";
    const forbidden = voiceProtocol?.forbiddenWords?.join(", ") || "ninguna";

    const systemInstruction = `Eres el Asistente de IA oficial de reputación para 'Francachela' (ReviewPulse AI).
Tu tarea es redactar una respuesta exquisita y profesional para una reseña de un cliente.
Tono deseado: ${tone}.
Directrices de marca: ${brandVoice}.
Firma requerida al final: ${signature}.
Palabras estrictamente prohibidas: ${forbidden}.
Idioma: Español.
Responde de manera concisa (entre 2 y 4 párrafos cortos o 50-120 palabras), cálida y elegante. Muestra sincera gratitud por los elogios o empatía constructiva con soluciones si la reseña es negativa.`;

    const userPrompt = `Redacta la respuesta para la siguiente reseña:
Cliente: ${author || "Cliente"}
Plataforma: ${platform || "Google Review"}
Calificación: ${rating || 5} de 5 estrellas
Reseña: "${reviewContent}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Gracias por sus comentarios. En Francachela valoramos profundamente su preferencia.";

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error generating AI reply:", error);
    return res.status(500).json({ 
      error: "No se pudo generar la respuesta con IA.", 
      details: error?.message || String(error)
    });
  }
});

// API Endpoint to analyze sentiment and suggest action
app.post("/api/ai/analyze-review", async (req, res) => {
  try {
    const { reviewContent, rating } = req.body;
    const ai = getGeminiClient();

    const prompt = `Analiza la siguiente reseña recibida en el negocio 'Francachela':
Calificación: ${rating} estrellas
Texto: "${reviewContent}"

Devuelve únicamente un objeto JSON válido con los campos:
- "sentiment": "positivo", "neutro" o "negativo"
- "keywords": un arreglo de 3 palabras clave relevantes
- "suggestedAction": recomendación corta (máx 15 palabras)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text || "{}";
    const parsed = JSON.parse(jsonStr);

    return res.json(parsed);
  } catch (error: any) {
    console.error("Error analyzing review:", error);
    return res.status(500).json({ error: "Error analizando la reseña" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
