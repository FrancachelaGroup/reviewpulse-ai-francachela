import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ReviewPulse AI Server" });
});

// Generate AI Review Reply
app.post("/api/generate-reply", async (req, res) => {
  try {
    const { review, authorName, rating, tone, customInstructions, businessContext, avoidKeywords } = req.body;

    const toneDescriptions: Record<string, string> = {
      formal: "Elegante, respetuoso y formal. Utiliza tratamiento de usted y fórmulas de cortesía refinadas.",
      cercano: "Cálido, amigable y empático. Trato de tú, cercano, expresivo e informal pero impecable.",
      profesional: "Directo, claro, corporativo y transparente. Enfocado en calidad y estándares.",
      entusiasta: "Enérgico, alegre, apasionado y entusiasta. Usa exclamaciones naturales y calidez."
    };

    const selectedToneDesc = toneDescriptions[tone] || toneDescriptions.formal;

    const prompt = `
Eres la Inteligencia Artificial oficial de respuestas de reseñas para el negocio "${businessContext || 'Restaurante Francachela'}".
Tu objetivo es redactar una respuesta profesional, impecable y estratégica para la siguiente reseña recibida en Google Business Profile:

DATOS DE LA RESEÑA:
- Cliente: ${authorName || 'Cliente'}
- Calificación: ${rating || 5} de 5 estrellas
- Comentario del cliente: "${review || ''}"

GUÍA Y TONO DE RESPUESTA:
- Tono seleccionado: ${tone?.toUpperCase()} (${selectedToneDesc})
- Instrucciones personalizadas de la marca: ${customInstructions || 'Agradecer la visita e invitar a regresar.'}
- Palabras o conceptos a EVITAR estrictamente: ${avoidKeywords ? avoidKeywords.join(', ') : 'Ninguno en específico'}

REGLAS OBLIGATORIAS:
1. Responde en español neutro/de España según corresponda al contexto.
2. Si la reseña es positiva (4-5 estrellas), muestra gratitud auténtica y resalta los puntos que el cliente disfrutó.
3. Si la reseña es crítica o negativa (1-3 estrellas), responde con alta empatía, pide disculpas sinceramente si corresponde y ofrece un canal de contacto directo para solucionar el inconveniente.
4. Mantén la respuesta en un rango de 2 a 5 oraciones (concisa pero completa).
5. NO uses corchetes, marcadores de posición ni texto de relleno como [Nombre]. Todo debe estar listo para publicar.

Redacta únicamente el texto final de la respuesta:
`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const replyText = response.text ? response.text.trim() : "Agradecemos sinceramente su visita e interés en compartir su experiencia con nosotros.";
    res.json({ replyText });
  } catch (error: any) {
    console.error("Error generating review reply:", error);
    res.status(500).json({
      error: "No se pudo generar la respuesta automáticamente.",
      details: error?.message || "Error interno del servidor",
      fallback: "Estimado/a cliente, le agradecemos sinceramente su comentario y su visita a nuestro establecimiento. Tomamos nota de su experiencia para continuar ofreciendo el mejor servicio."
    });
  }
});

// Test Persona Tone Simulation
app.post("/api/test-tone", async (req, res) => {
  try {
    const { tone, testReview } = req.body;

    const sampleReview = testReview || "El ambiente es impecable y la comida exquisita, pero tardaron un poco en traernos la cuenta al final.";

    const tonePrompts: Record<string, string> = {
      formal: "Estimado/a cliente, le agradecemos sinceramente su visita. Nos alegra conocer su valoración positiva sobre nuestro ambiente y gastronomía. Tomamos atenta nota sobre los tiempos de gestión al momento del cierre para perfeccionar nuestro servicio.",
      cercano: "¡Hola! Muchísimas gracias por venir a visitarnos y por tus lindas palabras sobre la comida y el ambiente. Sentimos mucho la pequeña espera con la cuenta al final; ¡tomamos nota para que tu próxima visita sea perfecta!",
      profesional: "Agradecemos sus comentarios. Nos complace saber que la propuesta gastronómica y el ambiente estuvieron a la altura de sus expectativas. Revisaremos el proceso de atención en sala para agilizar la entrega de la cuenta.",
      entusiasta: "¡Qué gran alegría leerte! 🎉 Nos apasiona saber que disfrutaste de nuestra gastronomía y del ambiente. ¡Muchas gracias por el feedback sobre la cuenta, trabajamos cada día con toda la energía para mejorar! ✨"
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ sampleResponse: tonePrompts[tone] || tonePrompts.formal });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Genera una respuesta en tono ${tone} a esta reseña de restaurante: "${sampleReview}". Responde en 2-3 oraciones directo en español listo para publicar.`,
      config: { temperature: 0.7 }
    });

    res.json({ sampleResponse: response.text?.trim() || tonePrompts[tone] });
  } catch (error) {
    res.json({
      sampleResponse: "Agradecemos sinceramente su comentario sobre su visita. Continuaremos trabajando para brindarle una experiencia óptima en cada oportunidad."
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReviewPulse AI Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
