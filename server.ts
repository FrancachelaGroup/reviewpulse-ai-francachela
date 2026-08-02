import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGenAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "placeholder_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.post("/api/generate-response", async (req, res) => {
  try {
    const { review, personality, customInstruction } = req.body;

    if (!review) {
      return res.status(400).json({ error: "Faltan datos de la reseña." });
    }

    const ai = getGenAIClient();
    const toneMap: Record<string, string> = {
      Formal: "Elegante, respetuoso, serio, enfocado en el protocolo de excelencia y la alta hospitalidad.",
      Cercano: "Cálido, amigable, empático, agradecido, usando un tono personal y humano.",
      Profesional: "Directo, corporativo, claro, solucionador, enfocado en la mejora continua y estándares de calidad.",
      Entusiasta: "Enérgico, alegre, muy agradecido, usando exclamaciones moderadas y mostrando verdadera pasión por el servicio.",
    };

    const selectedTonePrompt = toneMap[personality] || toneMap["Formal"];

    const prompt = `
Eres Roberto, gerente de atención al cliente y reputación de Francachela (un restaurante / establecimiento exclusivo de alta gastronomía).
Tu objetivo es redactar una respuesta profesional, impecable y personalizada en español para la siguiente reseña recibida en la plataforma ${review.platform || "Google Review"}.

Detalles de la reseña:
- Cliente/Autor: ${review.author || "Cliente"}
- Calificación: ${review.rating || 5} de 5 estrellas
- Comentario del cliente: "${review.text || ""}"
- Tono de personalidad solicitado para la IA: "${personality}" (${selectedTonePrompt})
${customInstruction ? `- Instrucción especial del usuario: "${customInstruction}"` : ""}

Instrucciones de redacción:
1. Responde directamente en primera persona del plural (o como Roberto de Francachela).
2. Mantén la respuesta concisa, elegante y natural (entre 2 y 4 oraciones).
3. Agradece la visita o retroalimentación respetando estrictamente el tono "${personality}".
4. Si la reseña menciona algún inconveniente o baja calificación, ofrece disculpas con elegancia y un canal directo de contacto o seguimiento.
5. NO uses corchetes como [Tu Nombre] o marcadores de posición; la respuesta debe quedar lista para ser publicada de inmediato.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const generatedText = response.text || "Gracias por tus comentarios. En Francachela valoramos mucho tu experiencia y seguiremos trabajando para brindarte el mejor servicio.";

    res.json({ response: generatedText });
  } catch (error: any) {
    console.error("Error al generar respuesta con Gemini:", error);
    res.status(500).json({
      error: "No se pudo generar la respuesta con IA.",
      details: error?.message || String(error),
    });
  }
});

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
