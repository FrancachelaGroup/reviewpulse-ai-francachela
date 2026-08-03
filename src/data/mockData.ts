import { Review, ConfigSettings, ActivityLog } from '../types';

export const INITIAL_CONFIG: ConfigSettings = {
  googleClientId: '84930291039-g92kfa0.apps.googleusercontent.com',
  googleClientSecret: '••••••••••••••••••••••••••••',
  isConnected: true,
  aiTone: 'formal',
  autopilotEnabled: false,
  protocolSignature: 'Atentamente,\nEl Equipo de Dirección de Aureate Group',
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Carlos Mendoza',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    platform: 'Google Business',
    rating: 5,
    date: 'Hace 2 horas',
    content: 'La atención recibida fue excepcional. El ambiente del establecimiento refleja elegancia y sofisticación. Definitivamente volveré pronto.',
    sentiment: 'positive',
    status: 'pending',
  },
  {
    id: 'rev-2',
    author: 'Elena Rivas',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    platform: 'TripAdvisor',
    rating: 4,
    date: 'Hace 5 horas',
    content: 'Muy buena experiencia general. La reserva estuvo lista a tiempo, aunque el tiempo de entrega de la confirmación tomó unos minutos más de lo estimado.',
    sentiment: 'neutral',
    status: 'pending',
  },
  {
    id: 'rev-3',
    author: 'Gabriel Torres',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    platform: 'Google Business',
    rating: 2,
    date: 'Ayer',
    content: 'Tuve un inconveniente con la atención en recepción. Me hicieron esperar más de 20 minutos sin darme una explicación clara.',
    sentiment: 'critical',
    status: 'pending',
  },
  {
    id: 'rev-4',
    author: 'Sofía Valenzuela',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    platform: 'Trustpilot',
    rating: 5,
    date: 'Hace 2 días',
    content: 'Increíble servicio y rapidez. La respuesta ante mis dudas fue inmediata y súper profesional.',
    sentiment: 'positive',
    status: 'responded',
    aiResponse: 'Estimada Sofía, le agradecemos profundamente sus amables palabras. Nos llena de orgullo saber que nuestro estándar de servicio cumplió con sus expectativas.\n\nAtentamente,\nEl Equipo de Dirección de Aureate Group',
    responseDate: 'Hace 2 días',
  },
  {
    id: 'rev-5',
    author: 'Marcos Alonso',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    platform: 'Yelp',
    rating: 5,
    date: 'Hace 3 días',
    content: 'Excelente propuesta y la IA que integran responde de forma súper personalizada.',
    sentiment: 'positive',
    status: 'responded',
    aiResponse: 'Estimado Marcos, valoramos sinceramente su retroalimentación positiva. Seguiremos trabajando para mantener la excelencia.\n\nAtentamente,\nEl Equipo de Dirección de Aureate Group',
    responseDate: 'Hace 3 días',
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    type: 'sync',
    title: 'Sincronización de Reseñas',
    description: 'Conexión exitosa con Google Business API (3 nuevas reseñas descargadas).',
    timestamp: 'Hoy, 19:45',
  },
  {
    id: 'log-2',
    type: 'ai_reply',
    title: 'Respuesta Generada',
    description: 'Respuesta aprobada para Sofía Valenzuela con tono Formal.',
    timestamp: 'Ayer, 14:20',
  },
  {
    id: 'log-3',
    type: 'config_update',
    title: 'Actualización de Personalidad',
    description: 'Tono predeterminado configurado en Formal con firma de protocolo activa.',
    timestamp: 'Hace 2 días',
  }
];
