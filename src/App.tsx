import { useState, useRef, useEffect, ReactNode } from 'react';
import {
  LayoutDashboard, Star, MessageSquare, Settings,
  RefreshCw, Send, Copy, Check, ChevronRight,
  Zap, TrendingUp, AlertCircle, CheckCircle2, Clock,
  Bot, User, Loader2, ToggleLeft, ToggleRight, LogOut
} from 'lucide-react';
import { NavTab, Review, ConfigSettings, ChatMessage, ActivityLog, ToneType } from './types';
import { INITIAL_REVIEWS, INITIAL_CONFIG, INITIAL_LOGS } from './data/mockData';

// ── Helpers ───────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  'Google Business': 'bg-blue-100 text-blue-700',
  'TripAdvisor':     'bg-green-100 text-green-700',
  'Trustpilot':      'bg-emerald-100 text-emerald-700',
  'Yelp':            'bg-red-100 text-red-700',
};

const SENTIMENT_CONFIG = {
  positive: { label: 'Positiva', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '😊' },
  neutral:  { label: 'Neutral',  color: 'text-amber-600',   bg: 'bg-amber-50',   icon: '😐' },
  critical: { label: 'Crítica',  color: 'text-red-600',     bg: 'bg-red-50',     icon: '😞' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13}
          className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function Avatar({ name, url, size = 'md' }: { name: string; url?: string; size?: 'sm'|'md'|'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  if (url) return <img src={url} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────
function Dashboard({ reviews, logs, onNav }: { reviews: Review[]; logs: ActivityLog[]; onNav: (t: NavTab) => void }) {
  const pending   = reviews.filter(r => r.status === 'pending').length;
  const responded = reviews.filter(r => r.status === 'responded').length;
  const avg       = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const critical  = reviews.filter(r => r.sentiment === 'critical').length;

  const kpis = [
    { label: 'Reseñas pendientes', value: pending,          icon: <Clock size={20}/>,       color: 'text-amber-500',   bg: 'bg-amber-50' },
    { label: 'Respondidas',        value: responded,         icon: <CheckCircle2 size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Calificación media', value: avg.toFixed(1)+'★', icon: <Star size={20}/>,        color: 'text-blue-500',    bg: 'bg-blue-50' },
    { label: 'Reseñas críticas',   value: critical,          icon: <AlertCircle size={20}/>, color: 'text-red-500',     bg: 'bg-red-50' },
  ];

  const logIcons: Record<string, ReactNode> = {
    sync:          <RefreshCw size={14} className="text-blue-500"/>,
    ai_reply:      <Bot size={14} className="text-purple-500"/>,
    autopilot:     <Zap size={14} className="text-amber-500"/>,
    config_update: <Settings size={14} className="text-slate-500"/>,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Torre de Control</h1>
        <p className="text-slate-500 text-sm mt-1">Monitoreo en tiempo real de tu reputación digital</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center ${k.color} mb-3`}>
              {k.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Reseñas recientes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800 text-sm">Reseñas recientes</h2>
            <button onClick={() => onNav('reviews')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={12}/>
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {reviews.slice(0,4).map(r => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                <Avatar name={r.author} url={r.avatarUrl} size="sm"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{r.author}</span>
                    <StarRating rating={r.rating}/>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{r.content}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {r.status === 'pending' ? 'Pendiente' : 'Respondida'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800 text-sm">Actividad reciente</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {logIcons[l.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{l.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l.description}</div>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{l.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel de reseña individual ────────────────────────────
function ReviewPanel({ review, config, onUpdate }: {
  key?: string;
  review: Review;
  config: ConfigSettings;
  onUpdate: (r: Review) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const s = SENTIMENT_CONFIG[review.sentiment];

  const generateReply = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: review.author,
          rating: review.rating,
          content: review.content,
          tone: config.aiTone,
          signature: config.protocolSignature,
          platform: review.platform,
        }),
      });
      const data = await res.json();
      onUpdate({ ...review, aiResponse: data.reply, status: 'responded', responseDate: 'Ahora' });
    } catch {
      onUpdate({ ...review, aiResponse: 'Error al generar la respuesta. Verifica tu conexión.', status: 'responded', responseDate: 'Ahora' });
    } finally {
      setLoading(false);
    }
  };

  const copyReply = () => {
    if (review.aiResponse) {
      navigator.clipboard.writeText(review.aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={review.author} url={review.avatarUrl}/>
          <div>
            <div className="font-semibold text-slate-900">{review.author}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StarRating rating={review.rating}/>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[review.platform]}`}>
                {review.platform}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                {s.icon} {s.label}
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">{review.date}</span>
      </div>

      {/* Contenido */}
      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
        "{review.content}"
      </p>

      {/* Respuesta IA */}
      {review.aiResponse ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Bot size={12}/> Respuesta generada por IA
            </span>
            <button onClick={copyReply}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              {copied ? <><Check size={12} className="text-emerald-500"/> Copiado</> : <><Copy size={12}/> Copiar</>}
            </button>
          </div>
          <div className="text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-line">
            {review.aiResponse}
          </div>
        </div>
      ) : (
        <button onClick={generateReply} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
          {loading ? <><Loader2 size={15} className="animate-spin"/> Generando…</> : <><Zap size={15}/> Generar respuesta con IA</>}
        </button>
      )}
    </div>
  );
}

// ── Vista Reseñas ─────────────────────────────────────────
function ReviewsView({ reviews, config, onUpdate }: {
  reviews: Review[];
  config: ConfigSettings;
  onUpdate: (r: Review) => void;
}) {
  const [filter, setFilter] = useState<'all'|'pending'|'responded'>('all');
  const filtered = reviews.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reseñas</h1>
          <p className="text-slate-500 text-sm mt-1">{reviews.length} reseñas en total</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['all','pending','responded'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Respondidas'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Sin reseñas en esta categoría</p>
          </div>
        ) : filtered.map(r => (
          <ReviewPanel key={r.id} review={r} config={config} onUpdate={onUpdate}/>
        ))}
      </div>
    </div>
  );
}

// ── Vista Asistente ───────────────────────────────────────
function AssistantView({ reviews }: { reviews: Review[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    sender: 'assistant',
    text: 'Hola, soy tu Asistente ReviewPulse AI. Puedo ayudarte a redactar respuestas, analizar tendencias de tu reputación y configurar el piloto automático. ¿En qué te enfoco hoy?',
    timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const ts = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text, timestamp: ts };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now()+1).toString(), sender: 'assistant',
        text: data.reply || 'Entendido. ¿En qué más puedo asistirte?',
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), sender: 'assistant',
        text: 'Hubo un error de conexión. Verifica que el servidor esté corriendo.',
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally { setLoading(false); }
  };

  const suggestions = [
    '¿Cuántas reseñas críticas tengo pendientes?',
    'Ayúdame a responder una queja difícil',
    '¿Cómo mejoro mi calificación promedio?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Asistente IA</h1>
        <p className="text-slate-500 text-sm mt-1">Tu consultor experto en reputación digital</p>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                {m.sender === 'user' ? <User size={14}/> : <Bot size={14}/>}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${m.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-slate-50 text-slate-800 rounded-tl-sm'}`}>
                {m.text}
                <div className={`text-[10px] mt-1.5 ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>{m.timestamp}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><Bot size={14} className="text-white"/></div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 size={16} className="animate-spin text-slate-400"/>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {messages.length === 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 p-4 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Escribe tu consulta…"
            className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-slate-200 focus:border-slate-400 transition-colors"/>
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white transition-colors disabled:opacity-40">
            <Send size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vista Configuración ───────────────────────────────────
function ConfigView({ config, onUpdate }: { config: ConfigSettings; onUpdate: (c: ConfigSettings) => void }) {
  const tones: ToneType[] = ['Formal', 'Cercano', 'Conciso', 'Empático'];
  const toneDesc: Record<ToneType, string> = {
    'Formal':   'Lenguaje distinguido, respetuoso y estructurado.',
    'Cercano':  'Empático, cálido y accesible.',
    'Conciso':  'Directo, breve pero siempre educado.',
    'Empático': 'Comprensión profunda y validación emocional.',
  };

  // Precargar credenciales desde variables de entorno del servidor
  useEffect(() => {
    if (!config.googleClientId) {
      fetch('/api/config')
        .then(r => r.json())
        .then(data => {
          if (data.googleClientId) {
            onUpdate({ ...config, ...data });
          }
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Personaliza la personalidad de tu IA</p>
      </div>

      {/* Conexión Google Business */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp size={16}/> Conexión Google Business API
        </h2>

        {config.isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-sm font-semibold text-emerald-700 flex-1">Conectado a Google Business</span>
              <button onClick={async () => {
                  await fetch('/api/auth/disconnect', { method: 'POST' });
                  onUpdate({ ...config, isConnected: false, googleClientId: '', googleClientSecret: '', googleAccountId: '', googleLocationId: '' });
                }}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                <LogOut size={12}/> Desconectar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="font-semibold text-slate-700 mb-1">Account ID</div>
                <div className="font-mono text-slate-500 truncate">{config.googleAccountId || '—'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="font-semibold text-slate-700 mb-1">Location ID</div>
                <div className="font-mono text-slate-500 truncate">{config.googleLocationId || '—'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
              <AlertCircle size={13}/> Ingresa tus credenciales de Google Business Profile API para sincronizar reseñas reales.
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={config.googleClientId}
                  onChange={e => onUpdate({ ...config, googleClientId: e.target.value })}
                  placeholder="xxxxxxxx.apps.googleusercontent.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 font-mono transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client Secret</label>
                <input
                  type="password"
                  value={config.googleClientSecret}
                  onChange={e => onUpdate({ ...config, googleClientSecret: e.target.value })}
                  placeholder="GOCSPX-••••••••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 font-mono transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Account ID <span className="text-slate-400 font-normal">(Google Business Profile)</span></label>
                <input
                  type="text"
                  value={config.googleAccountId}
                  onChange={e => onUpdate({ ...config, googleAccountId: e.target.value })}
                  placeholder="accounts/1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 font-mono transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Location ID <span className="text-slate-400 font-normal">(tu sede o local)</span></label>
                <input
                  type="text"
                  value={config.googleLocationId}
                  onChange={e => onUpdate({ ...config, googleLocationId: e.target.value })}
                  placeholder="locations/1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 font-mono transition-colors"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                if (!config.googleClientId || !config.googleClientSecret || !config.googleAccountId || !config.googleLocationId) {
                  alert('Por favor completa todos los campos antes de conectar.');
                  return;
                }
                try {
                  const res = await fetch('/api/auth/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      clientId: config.googleClientId,
                      clientSecret: config.googleClientSecret,
                    }),
                  });
                  const data = await res.json();
                  if (data.url) {
                    // Guardamos Account y Location en localStorage para usarlos después del callback
                    localStorage.setItem('gAccountId', config.googleAccountId);
                    localStorage.setItem('gLocationId', config.googleLocationId);
                    window.location.href = data.url;
                  } else {
                    alert('Error generando la URL de autorización.');
                  }
                } catch {
                  alert('Error conectando con Google. Verifica tus credenciales.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors">
              <RefreshCw size={14}/> Autorizar con Google Business
            </button>
          </div>
        )}
      </div>

      {/* Tono de IA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Bot size={16}/> Personalidad de la IA</h2>
        <p className="text-xs text-slate-500">Selecciona el tono predeterminado para las respuestas generadas automáticamente.</p>
        <div className="grid grid-cols-2 gap-3">
          {tones.map(t => (
            <button key={t} onClick={() => onUpdate({ ...config, aiTone: t })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${config.aiTone === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 hover:border-slate-300 text-slate-700'}`}>
              <div className="font-semibold text-sm">{t}</div>
              <div className={`text-xs mt-1 ${config.aiTone === t ? 'text-slate-300' : 'text-slate-400'}`}>{toneDesc[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Piloto automático */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Zap size={16}/> Piloto automático</h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <div className="text-sm font-semibold text-slate-800">Responder automáticamente</div>
            <div className="text-xs text-slate-500 mt-0.5">La IA responderá reseñas positivas sin intervención manual.</div>
          </div>
          <button onClick={() => onUpdate({ ...config, autopilotEnabled: !config.autopilotEnabled })}
            className="flex-shrink-0 transition-colors">
            {config.autopilotEnabled
              ? <ToggleRight size={32} className="text-emerald-500"/>
              : <ToggleLeft size={32} className="text-slate-300"/>}
          </button>
        </div>
        {config.autopilotEnabled && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <AlertCircle size={13}/> El piloto automático está activo. Las reseñas positivas (4-5★) se responderán automáticamente.
          </div>
        )}
      </div>

      {/* Firma */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><MessageSquare size={16}/> Firma de protocolo</h2>
        <p className="text-xs text-slate-500">Se añade automáticamente al final de cada respuesta generada.</p>
        <textarea value={config.protocolSignature}
          onChange={e => onUpdate({ ...config, protocolSignature: e.target.value })}
          rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 resize-none transition-colors"/>
        <button onClick={() => alert('Configuración guardada')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
          <Check size={14}/> Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState<NavTab>('dashboard');
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [config, setConfig]   = useState<ConfigSettings>(INITIAL_CONFIG);
  const [logs]                = useState<ActivityLog[]>(INITIAL_LOGS);

  const updateReview = (updated: Review) => {
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard',  icon: <LayoutDashboard size={18}/> },
    { id: 'reviews'   as NavTab, label: 'Reseñas',    icon: <Star size={18}/> },
    { id: 'assistant' as NavTab, label: 'Asistente',  icon: <MessageSquare size={18}/> },
    { id: 'config'    as NavTab, label: 'Config',     icon: <Settings size={18}/> },
  ];

  const pending = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col fixed h-full z-10">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Zap size={16} className="text-white"/>
            </div>
            <div>
              <div className="text-sm font-bold text-white">ReviewPulse</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">AI PLATFORM</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {item.icon}
              {item.label}
              {item.id === 'reviews' && pending > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${config.autopilotEnabled ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.autopilotEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}/>
            Piloto {config.autopilotEnabled ? 'activo' : 'inactivo'}
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-60 p-6 min-h-screen">
        {tab === 'dashboard' && <Dashboard reviews={reviews} logs={logs} onNav={setTab}/>}
        {tab === 'reviews'   && <ReviewsView reviews={reviews} config={config} onUpdate={updateReview}/>}
        {tab === 'assistant' && <AssistantView reviews={reviews}/>}
        {tab === 'config'    && <ConfigView config={config} onUpdate={setConfig}/>}
      </main>
    </div>
  );
}
