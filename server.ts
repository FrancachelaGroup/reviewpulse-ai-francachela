import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper lazy initialize Gemini AI client
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", brand: "Francachela ReviewPulse AI", version: "v3.1" });
  });

  // AI Review Response Generation Endpoint
  app.post("/api/ai/generate-reply", async (req, res) => {
    try {
      const {
        reviewAuthor = "Cliente",
        starRating = 5,
        reviewText = "",
        tone = "Cercano",
        signature = "Atentamente, El equipo de Francachela",
        businessName = "Francachela",
      } = req.body;

      const ai = getAI();

      if (ai) {
        const prompt = `
Eres la Inteligencia Artificial encargada de gestionar las reseñas del restaurante y lugar de entretenimiento "${businessName}".
Genera una respuesta elegante, empática y profesional para la siguiente reseña recibida en Google Business Profile:

- Cliente: ${reviewAuthor}
- Calificación: ${starRating} de 5 estrellas
- Comentario de la reseña: "${reviewText}"
- Tono deseado: ${tone} (Opciones posibles: Formal, Cercano, Profesional, Entusiasta)
- Firma a incluir al final: "${signature}"

Instrucciones:
1. Responde de forma muy natural, coherente y adaptada exactamente al tono "${tone}".
2. Si es una reseña positiva (4-5 estrellas), agradece el comentario e invita al cliente a regresar a ${businessName}.
3. Si es una reseña crítica o negativa (1-3 estrellas), ofrece una disculpa sincera, demuestra preocupación por su experiencia y ofrece un canal directo para solucionar la situación.
4. Incluye la firma al final.
5. Mantén la respuesta con una longitud óptima (entre 2 y 4 oraciones).
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
            systemInstruction: `Eres la voz oficial de la marca Francachela en respuestas a reseñas de clientes. Muestra siempre sofisticación y atención personalizada.`,
          },
        });

        const replyText = response.text ? response.text.trim() : "";

        if (replyText) {
          return res.json({
            success: true,
            replyText,
            toneUsed: tone,
            model: "gemini-3.6-flash",
          });
        }
      }

      // Fallback generator if AI API key is not present or API returned empty
      const fallbacks: Record<string, string[]> = {
        Formal: [
          `Estimado/a ${reviewAuthor}, le agradecemos sinceramente por compartir su opinión sobre su experiencia en ${businessName}. Nos alegra saber que su visita haya sido satisfactoria. Esperamos tener el honor de recibirle nuevamente muy pronto.\n\n${signature}`,
          `Apreciable ${reviewAuthor}, tomamos nota atenta de sus comentarios sobre ${businessName}. Su retroalimentación es muy valiosa para mantener la excelencia en nuestro servicio.\n\n${signature}`,
        ],
        Cercano: [
          `¡Hola, ${reviewAuthor}! Muchísimas gracias por visitarnos en ${businessName} y dejar tu reseña. Nos alegra mucho saber que disfrutaste la noche con nosotros. ¡Te esperamos pronto de vuelta!\n\n${signature}`,
          `¡Muchas gracias por tus palabras, ${reviewAuthor}! Nos encanta saber que la pasaste genial en ${businessName}. ¡Un fuerte abrazo y nos vemos pronto!\n\n${signature}`,
        ],
        Profesional: [
          `Estimado/a ${reviewAuthor}, agradecemos que se haya tomado el tiempo de evaluar su experiencia en ${businessName}. Mantenemos un compromiso firme con la calidad y la atención al cliente.\n\n${signature}`,
        ],
        Entusiasta: [
          `¡Genial, ${reviewAuthor}! 🎉 Nos emociona muchísimo saber que viviste una experiencia fantástica en ${businessName}. ¡El ambiente y el equipo siempre estarán listos para recibirte con los brazos abiertos!\n\n${signature}`,
        ],
      };

      const toneOptions = fallbacks[tone] || fallbacks["Cercano"];
      const randomReply = toneOptions[Math.floor(Math.random() * toneOptions.length)];

      return res.json({
        success: true,
        replyText: randomReply,
        toneUsed: tone,
        isFallback: true,
      });
    } catch (err: any) {
      console.error("Error generating reply:", err);
      return res.status(500).json({
        success: false,
        error: "Error al generar la respuesta con la IA.",
        details: err.message,
      });
    }
  });

  // Vite middleware in development mode
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
