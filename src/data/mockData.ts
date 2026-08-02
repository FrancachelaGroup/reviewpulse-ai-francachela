import { Review, ActivityItem, BusinessConnection } from '../types';

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    platform: 'google',
    status: 'PENDIENTE',
    rating: 5,
    timeAgo: 'Hace 2 horas',
    text: 'El servicio fue absolutamente impecable. La atención al detalle superó todas mis expectativas. Sin duda volveré a contratar sus servicios muy pronto.',
    date: '2026-08-02T06:56:00Z',
    aiDraftResponse: 'Estimada Elena, nos llena de orgullo saber que su experiencia en Francachela haya superado todas sus expectativas. La excelencia en cada detalle es nuestro mayor compromiso. Esperamos tener el honor de recibirle nuevamente muy pronto.'
  },
  {
    id: 'rev-2',
    author: 'Carlos Mendoza',
    platform: 'trustpilot',
    status: 'RESPONDIDA',
    rating: 4,
    timeAgo: 'Ayer',
    text: 'Muy buen producto, aunque el tiempo de entrega podría mejorar un poco. En general, estoy satisfecho.',
    publishedResponse: '¡Gracias por tu comentario! Estamos trabajando para optimizar nuestra logística y garantizar la máxima puntualidad en tu próxima orden.',
    date: '2026-08-01T14:30:00Z'
  },
  {
    id: 'rev-3',
    author: 'Javier B.',
    platform: 'google',
    status: 'PENDIENTE',
    rating: 2,
    timeAgo: 'Hace 2 días',
    text: 'Tuve un pequeño problema con el acceso inicial, me costó mucho contactar con soporte técnico.',
    date: '2026-07-31T09:15:00Z',
    aiDraftResponse: 'Hola Javier, lamentamos profundamente el inconveniente con el acceso inicial. En Francachela valoramos tu tiempo y ya hemos reforzado nuestra línea de soporte técnico para atenderte de inmediato. Por favor contáctanos directamente a soporte@francachela.es para brindarte atención prioritaria.'
  },
  {
    id: 'rev-4',
    author: 'Sofia Delgado',
    platform: 'google',
    status: 'PENDIENTE',
    rating: 5,
    timeAgo: 'Hace 3 días',
    text: 'La velada en Francachela fue extraordinaria. La carta de vinos es incomparable y el maridaje propuesto por el sommelier fue sencillamente sublime.',
    date: '2026-07-30T20:00:00Z',
    aiDraftResponse: 'Estimada Sofia, le agradecemos de corazón sus generosas palabras sobre nuestra carta de vinos y el maridaje. Transmitiremos su felicitación a nuestro equipo de sommeliers. Será un auténtico placer recibirle de nuevo.'
  },
  {
    id: 'rev-5',
    author: 'Marc Vance',
    platform: 'trustpilot',
    status: 'RESPONDIDA',
    rating: 5,
    timeAgo: 'Hace 4 días',
    text: 'Impresionante nivel de profesionalismo. La gestión con Inteligencia Artificial nos ayudó a responder a más de 200 clientes en un fin de semana.',
    publishedResponse: 'Apreciado Marc, nos alegra enormemente saber que la plataforma impulsa la reputación y eficiencia de tu marca.',
    date: '2026-07-29T11:20:00Z'
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'review',
    title: 'New 5-star Google Review',
    subtitle: '"Excepcional servicio, el equipo de ReviewPulse..."',
    timeAgo: '2m ago',
    badges: ['AI ANALYZED', 'POSITIVE']
  },
  {
    id: 'act-2',
    type: 'ai_draft',
    title: 'AI Draft Generated',
    subtitle: 'Automatic response created for "Cafe Noir".',
    timeAgo: '1h ago'
  },
  {
    id: 'act-3',
    type: 'milestone',
    title: 'Milestone Reached',
    subtitle: 'Sentiment score increased by 5% this month.',
    timeAgo: '4h ago'
  },
  {
    id: 'act-4',
    type: 'review',
    title: 'Trustpilot Review Answered',
    subtitle: 'Roberto approved auto-generated response for Elena.',
    timeAgo: 'Yesterday'
  }
];

export const INITIAL_CONNECTIONS: BusinessConnection[] = [
  {
    id: 'conn-1',
    name: 'Google Business Profile',
    platform: 'google',
    status: 'connected',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZoJQplTX3EfUtLh40qI-DVgvdVmDg1kHHcqIjQR5QTHWqyeOPAi9WxzsG_cQONPLFFVUKtts5DR1xqXmp41W-qxE7e-LY7-ubd1UTJYoO8Xg4sftFcBtvZMdMQ_32L07lFRF0jBCEyMWNmkGTXCm7xZhGYSsTe7meyUAmsIJAI96gm2W0wysV9rVT0QkwXnbMFTmewwiUGpmuaK4prn2cRhIVOnSGNNl-d5qU_hPPR8uuD_3Tzomy'
  },
  {
    id: 'conn-2',
    name: 'Trustpilot Verified Account',
    platform: 'trustpilot',
    status: 'connected'
  },
  {
    id: 'conn-3',
    name: 'TripAdvisor Premium',
    platform: 'tripadvisor',
    status: 'disconnected'
  }
];

export const FRANCACHELA_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCOUnURMZfeBBgu3BxIGbFLzRitkQ4rpOl7tjLbAORfpZjJWykl8GE3_jOrb0yKJYiQK0t-7veD74DajQyzXD6qgM9YELDflwuiLSQJNMSE3-npHxMmjgkWHiZ3o1Nx0YsOOOK8PzwM93qw_7yR6M0V_9Y5emni4zJ35eYhrWzWAAYrI_No3CpFoAVQMt3sR5BqO2SLNV7pobksarLCOpbiY6mb_SOOrr_gQVrMqsIcrSiJxJPOGoDhJGvprXis9F22w';

export const ROBERTO_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuJdUMe13LOGecUpxH1FjF0rXl9J5SGLWuelkkHZks8owGL1kvK05UCNST7SBkcL_PFHt2xD6FBpaQqstDceEx8FFR1ADYa_5XS1AGY-1sig1Botzyn2kubTNOi-4xtuiR6NUbuBPiTbIdAhg5EqdO78l1_2LgkpiBwTm-OiB55wNq3GO6wzSNi6ixmKa-eCCDpanCt42QvgVhIFadpokMDHS9wto9eo9nDWDaCHp5Y3vmXTzaw2fE';
