import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { Review, VoiceProtocol, MetricStats } from './src/types';

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize Gemini SDK securely on server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Initial In-Memory State
  let voiceProtocol: VoiceProtocol = {
    personaName: 'Anfitrión Francachela',
    tone: 'sofisticado',
    formality: 'alta',
    signatureGreeting: 'Estimado/a cliente de Francachela,',
    brandKeywords: ['Francachela', 'experiencia nocturna', 'coctelería de autor', 'hospitalidad'],
    specialInstructions: 'Mapea la elegancia de un lounge exclusivo. Muestra gratitud por la visita, responde de manera sofisticada y personalizada, e invita sutilmente a retornar en su próxima velada.',
    autoApproveFiveStar: false,
    mentionNightPromos: true,
  };

  let reviews: Review[] = [
    {
      id: 'rev-1',
      author: 'Carlos Mendoza',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: 'Hace 2 horas',
      platform: 'Google',
      comment: 'Una noche insuperable en Francachela. El servicio de los cócteles de autor y el ambiente sofisticado superaron todas mis expectativas.',
      status: 'pending',
      sentiment: 'positive',
      tags: ['Cócteles', 'Ambiente Nocturno', 'Atención VIP'],
    },
    {
      id: 'rev-2',
      author: 'Lucía Valenzuela',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      rating: 4,
      date: 'Ayer',
      platform: 'TripAdvisor',
      comment: 'La comida deliciosa y la música excelente. Solo hubo una ligera espera para conseguir mesa en la terraza, pero valió la pena.',
      status: 'pending',
      sentiment: 'positive',
      tags: ['Música', 'Terraza'],
    },
    {
      id: 'rev-3',
      author: 'Ignacio Rivas',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: 'Hace 3 días',
      platform: 'Google',
      comment: 'Celebré mi aniversario en Francachela y el trato fue de primer nivel. Volveremos sin duda.',
      response: 'Estimado Ignacio, en Francachela fue un verdadero honor ser el escenario de una velada tan especial para su aniversario. Agradecemos profundamente sus amables palabras y nos alegra saber que nuestro equipo le brindó una experiencia de primer nivel. Esperamos tener el placer de darles la bienvenida nuevamente en su próxima celebración nocturna. ¡Salud!',
      status: 'responded',
      sentiment: 'positive',
      tags: ['Aniversario', 'Servicio Exclusivo'],
    },
  ];

  let isConnectedGoogle = false;

  // API ROUTES
  app.get('/api/reviews', (req, res) => {
    const { status } = req.query;
    if (status && (status === 'pending' || status === 'responded')) {
      return res.json(reviews.filter((r) => r.status === status));
    }
    res.json(reviews);
  });

  app.post('/api/reviews/add-mock', (req, res) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: req.body.author || 'Cliente Nocturno',
      avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      rating: req.body.rating || 5,
      date: 'Justo ahora',
      platform: req.body.platform || 'Google',
      comment: req.body.comment || 'Extraordinaria velada en Francachela. La ambientación e iluminación crean un ambiente verdaderamente mágico.',
      status: 'pending',
      sentiment: req.body.rating && req.body.rating < 3 ? 'negative' : 'positive',
      tags: ['Google Business', 'Experiencia'],
    };
    reviews.unshift(newReview);
    res.json({ success: true, review: newReview });
  });

  app.post('/api/reviews/:id/reply', (req, res) => {
    const { id } = req.params;
    const { responseText } = req.body;

    const review = reviews.find((r) => r.id === id);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    review.response = responseText;
    review.status = 'responded';
    res.json({ success: true, review });
  });

  app.post('/api/ai/generate-reply', async (req, res) => {
    try {
      const { reviewComment, rating, authorName, customTone } = req.body;

      const toneToUse = customTone || voiceProtocol.tone;

      const systemPrompt = `Eres el asistente oficial de Inteligencia Artificial para "Francachela", un exclusivo bar, restaurante y lounge de alta gama.
Tu personalidad es "${voiceProtocol.personaName}", con un tono ${toneToUse.toUpperCase()} y nivel de formalidad ${voiceProtocol.formality.toUpperCase()}.
Pautas de marca:
- Saludo característico: "${voiceProtocol.signatureGreeting}" (o similar personalizado para el autor).
- Palabras clave de marca a incorporar si es natural: ${voiceProtocol.brandKeywords.join(', ')}.
- Instrucciones especiales: ${voiceProtocol.specialInstructions}.
${voiceProtocol.mentionNightPromos ? '- Menciona sutilmente la atmósfera nocturna y las reservaciones exclusivas.' : ''}
Instrucción: Genera una respuesta elegante, cordial, profesional y personalizada para la reseña recibida de parte de ${authorName || 'un cliente'}.
Escribe únicamente el texto final de la respuesta en español, listo para ser enviado en Google Business / TripAdvisor. Sin comillas adicionales.`;

      const userPrompt = `Calificación del cliente: ${rating}/5 estrellas.
Comentario del cliente: "${reviewComment}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const generatedText = response.text || 'Estimado/a cliente, le agradecemos profundamente su visita a Francachela y sus comentarios.';
      res.json({ success: true, reply: generatedText.trim() });
    } catch (err: any) {
      console.error('Error in Gemini generate-reply:', err);
      res.status(500).json({
        error: 'No se pudo generar la respuesta con IA',
        details: err?.message || 'Error del servidor',
      });
    }
  });

  app.post('/api/reviews/resolve-all-pending', async (req, res) => {
    try {
      const pendingReviews = reviews.filter((r) => r.status === 'pending');
      for (const r of pendingReviews) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Calificación: ${r.rating}/5 estrellas. Reseña: "${r.comment}"`,
          config: {
            systemInstruction: `Eres el anfitrión IA de Francachela. Genera una respuesta en español elegante y sofisticada para el cliente ${r.author}. Responde en máximo 3 oraciones.`,
          },
        });
        r.response = response.text?.trim() || `Estimado/a ${r.author}, en Francachela valoramos mucho su opinión y esperamos recibirle nuevamente.`;
        r.status = 'responded';
      }
      res.json({ success: true, count: pendingReviews.length });
    } catch (err: any) {
      console.error('Error resolving pending reviews:', err);
      reviews.forEach((r) => {
        if (r.status === 'pending') {
          r.response = `Estimado/a ${r.author}, le agradecemos sinceramente su visita a Francachela y nos alegra que comparta su experiencia con nosotros.`;
          r.status = 'responded';
        }
      });
      res.json({ success: true, count: reviews.length });
    }
  });

  app.get('/api/voice-protocol', (req, res) => {
    res.json(voiceProtocol);
  });

  app.put('/api/voice-protocol', (req, res) => {
    voiceProtocol = { ...voiceProtocol, ...req.body };
    res.json({ success: true, voiceProtocol });
  });

  app.get('/api/metrics', (req, res) => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const responded = reviews.filter((r) => r.status === 'responded').length;
    const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? (sumRating / total).toFixed(1) : '0';

    const stats: MetricStats = {
      totalReviews: total,
      avgRating: parseFloat(avg),
      pendingCount: pending,
      satisfactionPercentage: 98.4,
      responseRatePercentage: total > 0 ? Math.round((responded / total) * 100) : 100,
      weeklyTrend: [
        { day: 'M', count: 4, avgRating: 4.8 },
        { day: 'T', count: 6, avgRating: 5.0 },
        { day: 'W', count: 3, avgRating: 4.7 },
        { day: 'T', count: 8, avgRating: 4.9 },
        { day: 'F', count: 12, avgRating: 5.0 },
        { day: 'S', count: 15, avgRating: 4.9 },
        { day: 'S', count: 9, avgRating: 4.8 },
      ],
    };

    res.json(stats);
  });

  app.post('/api/sync-google', (req, res) => {
    isConnectedGoogle = !isConnectedGoogle;
    if (isConnectedGoogle) {
      reviews.unshift({
        id: `rev-sync-${Date.now()}`,
        author: 'Sofía Arciniega',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        date: 'Sincronizado de Google Maps',
        platform: 'Google',
        comment: 'Los mejores trago nocturnos y ambiente exclusivo de la ciudad. El servicio al cliente en Francachela es imponente.',
        status: 'pending',
        sentiment: 'positive',
        tags: ['Sincronizado', 'Google Business'],
      });
    }
    res.json({ connected: isConnectedGoogle, reviewCount: reviews.length });
  });

  // Vite or Static Serving
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
    console.log(`Francachela AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
