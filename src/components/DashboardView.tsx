import React, { useState } from 'react';
import { NavTab, Review, ActivityItem } from '../types';
import { FRANCACHELA_LOGO } from '../data/mockData';

interface DashboardViewProps {
  reviews: Review[];
  activities: ActivityItem[];
  onNavigate: (tab: NavTab) => void;
  onOpenAiModal: (review: Review) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reviews,
  activities,
  onNavigate,
  onOpenAiModal,
}) => {
  const [activeDay, setActiveDay] = useState<string>('W');

  const pendingReviews = reviews.filter((r) => r.status === 'PENDIENTES');
  const pendingCount = pendingReviews.length;

  const weeklyData = [
    { day: 'M', label: 'Lun', height: 'h-16', count: 18 },
    { day: 'T', label: 'Mar', height: 'h-24', count: 28 },
    { day: 'W', label: 'Mié', height: 'h-32', count: 42, active: true },
    { day: 'T', label: 'Jue', height: 'h-20', count: 22 },
    { day: 'F', label: 'Vie', height: 'h-28', count: 35 },
    { day: 'S', label: 'Sáb', height: 'h-12', count: 14 },
    { day: 'S', label: 'Dom', height: 'h-18', count: 19 },
  ];

  const handleResolveAll = () => {
    if (pendingReviews.length > 0) {
      onOpenAiModal(pendingReviews[0]);
    } else {
      onNavigate('reviews');
    }
  };

  return (
    <div className="pt-24 pb-28 px-4 sm:px-8 max-w-5xl mx-auto min-h-screen space-y-10 animate-in fade-in duration-300">
      {/* Welcome Hero Section */}
      <section className="text-center md:text-left flex flex-col items-center md:items-start space-y-2">
        <div className="w-48 sm:w-60 mb-2">
          <img
            src={FRANCACHELA_LOGO}
            alt="Francachela Logo"
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>
        <h1 className="font-garamond text-4xl sm:text-5xl font-medium text-[#f2ca50] gold-glow tracking-tight">
          Hola, Roberto.
        </h1>
        <p className="text-lg font-garamond italic text-[#d0c5af] font-light">
          "La noche espera tus respuestas."
        </p>
      </section>

      {/* Bento Grid Dashboard Access */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Primary Action Card: Reseñas */}
        <div 
          onClick={() => onNavigate('reviews')}
          className="md:col-span-8 group cursor-pointer glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-[#E8B04B]/30 hover:border-[#f2ca50]"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[110px] text-[#f2ca50]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rate_review
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="material-symbols-outlined text-[#f2ca50] text-2xl">rate_review</span>
              <span className="font-label-caps text-xs text-[#f2ca50] uppercase tracking-[0.2em] font-bold">
                Acción Prioritaria
              </span>
            </div>
            <h2 className="font-garamond text-2xl sm:text-3xl text-[#F4EFE4] font-medium mb-2">
              Gestión de Reseñas
            </h2>
            <p className="text-sm text-[#d0c5af] max-w-md leading-relaxed">
              Tienes <strong className="text-[#f2ca50]">{pendingCount} nuevas reseñas</strong> que requieren atención. Tu asistente IA ha preparado borradores basados en el protocolo de excelencia.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button className="gold-gradient text-[#3c2f00] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform shadow-lg shadow-[#f2ca50]/20">
              <span>Responder ahora</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <div className="w-8 h-8 rounded-full border border-[#141311] bg-[#363432] flex items-center justify-center text-xs text-[#f2ca50] font-bold shadow-md">
              +{pendingCount}
            </div>
          </div>
        </div>

        {/* Secondary Card: Dashboard Quick Stats */}
        <div 
          onClick={() => onNavigate('reviews')}
          className="md:col-span-4 group cursor-pointer glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between border border-[#E8B04B]/20"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="material-symbols-outlined text-[#f2ca50] text-2xl">dashboard</span>
              <h2 className="font-garamond text-2xl text-[#F4EFE4] font-medium">Dashboard</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-[#f2ca50]/10 pb-3">
                <div>
                  <p className="text-xs text-[#d0c5af]">Satisfacción Semanal</p>
                  <p className="font-garamond text-3xl text-[#f2ca50]">4.8/5.0</p>
                </div>
                <span className="material-symbols-outlined text-[#E8B04B]">trending_up</span>
              </div>

              <div className="flex justify-between items-end border-b border-[#f2ca50]/10 pb-3">
                <div>
                  <p className="text-xs text-[#d0c5af]">Tasa de Respuesta</p>
                  <p className="font-garamond text-3xl text-[#f2ca50]">94%</p>
                </div>
                <span className="material-symbols-outlined text-[#E8B04B]">check_circle</span>
              </div>
            </div>
          </div>

          <button className="mt-6 w-full border border-[#f2ca50]/40 text-[#f2ca50] py-2.5 rounded-full font-bold text-xs uppercase tracking-wider group-hover:bg-[#f2ca50] group-hover:text-[#3c2f00] transition-all">
            Ver Métricas
          </button>
        </div>

        {/* Protocol Card */}
        <div 
          onClick={() => onNavigate('config')}
          className="md:col-span-6 group cursor-pointer glass-card p-6 rounded-2xl flex items-center gap-5 border border-[#E8B04B]/20 hover:border-[#f2ca50]"
        >
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 flex items-center justify-center border border-[#f2ca50]/30 shrink-0">
            <span className="material-symbols-outlined text-[#f2ca50] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-garamond text-xl text-[#F4EFE4] font-medium mb-1">
              Protocolo de Voz
            </h2>
            <p className="text-xs text-[#d0c5af]">
              Revisa y ajusta la personalidad de Roberto en las respuestas.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#f2ca50]/40 group-hover:text-[#f2ca50] transition-colors">
            chevron_right
          </span>
        </div>

        {/* Config IA Card */}
        <div 
          onClick={() => onNavigate('config')}
          className="md:col-span-6 group cursor-pointer glass-card p-6 rounded-2xl flex items-center gap-5 border border-[#E8B04B]/20 hover:border-[#f2ca50]"
        >
          <div className="w-16 h-16 rounded-full bg-[#363432] flex items-center justify-center border border-[#f2ca50]/20 shrink-0">
            <span className="material-symbols-outlined text-[#d0c5af] group-hover:text-[#f2ca50] text-3xl transition-colors">
              psychology
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-garamond text-xl text-[#F4EFE4] font-medium mb-1">
              Configuración IA
            </h2>
            <p className="text-xs text-[#d0c5af]">
              Ajustes avanzados, integración y límites de automatización.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#f2ca50]/40 group-hover:text-[#f2ca50] transition-colors">
            settings
          </span>
        </div>
      </div>

      {/* Activity Summary Section */}
      <section className="space-y-6 pt-4 border-t border-[#4d4635]/30">
        <div>
          <h2 className="font-garamond text-2xl font-medium text-[#e7e2dd]">
            Resumen de Actividad
          </h2>
          <p className="text-xs text-[#d0c5af]">
            Insights for your reputation performance today.
          </p>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Reviews */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="font-label-caps text-xs text-[#E8B04B] uppercase tracking-wider font-bold">
              Total Reviews
            </span>
            <div className="flex items-end justify-between">
              <span className="font-garamond text-4xl leading-none text-[#e7e2dd]">1,284</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                +12% <span className="material-symbols-outlined text-sm">trending_up</span>
              </span>
            </div>
          </div>

          {/* Avg Rating */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="font-label-caps text-xs text-[#E8B04B] uppercase tracking-wider font-bold">
              Avg Rating
            </span>
            <div className="flex items-end justify-between">
              <span className="font-garamond text-4xl leading-none text-[#e7e2dd]">4.8</span>
              <div className="flex text-[#f2ca50] gap-0.5">
                {[1, 2, 3, 4].map((s) => (
                  <span key={s} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0.5" }}>
                  star_half
                </span>
              </div>
            </div>
          </div>

          {/* Pending Responses */}
          <div className="sm:col-span-2 md:col-span-1 glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-label-caps text-xs text-[#E8B04B] uppercase tracking-wider block mb-1 font-bold">
                Pending Responses
              </span>
              <span className="font-garamond text-3xl text-[#e7e2dd]">{pendingCount} Tasks</span>
            </div>
            <button
              onClick={handleResolveAll}
              className="bg-[#f2ca50] text-[#3c2f00] px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform shadow-md shadow-[#f2ca50]/20 hover:bg-[#E8B04B]"
            >
              Resolve All
            </button>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-semibold text-base text-[#e7e2dd]">Weekly Trend</h3>
            <span className="font-label-caps text-[10px] text-[#d0c5af] bg-[#211f1d] px-2.5 py-1 rounded-md font-bold border border-[#4d4635]/50">
              LAST 7 DAYS
            </span>
          </div>

          <div className="h-44 w-full relative flex items-end justify-between px-4 sm:px-8">
            <div className="absolute inset-x-0 bottom-8 h-[1px] bg-[#E8B04B]/20 pointer-events-none" />

            {weeklyData.map((item) => {
              const isSel = activeDay === item.day;
              return (
                <div
                  key={item.day}
                  onClick={() => setActiveDay(item.day)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-3.5 rounded-t-full transition-all duration-300 relative ${item.height} ${
                      isSel || item.active
                        ? 'bg-[#d4af37] gold-glow w-4'
                        : 'bg-[#2b2a27] group-hover:bg-[#E8B04B]/50'
                    }`}
                  >
                    {(isSel || item.active) && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#f2ca50] text-[#3c2f00] font-bold text-[10px] px-1.5 py-0.5 rounded shadow-md">
                        {item.count}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-label-caps ${
                      isSel || item.active ? 'text-[#f2ca50] font-bold' : 'text-[#d0c5af]'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-semibold text-base text-[#e7e2dd]">
              Recent Activity
            </h3>
            <button 
              onClick={() => onNavigate('reviews')}
              className="text-[#f2ca50] font-label-caps text-xs font-bold hover:underline"
            >
              VIEW ALL
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="glass-panel p-4 rounded-xl flex gap-4 items-start border-l-2 border-l-[#f2ca50] hover:bg-[#211f1d]/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#363432] flex items-center justify-center shrink-0 text-[#f2ca50]">
                  <span className="material-symbols-outlined">
                    {act.type === 'review' ? 'rate_review' : act.type === 'ai_draft' ? 'psychology' : 'trending_up'}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm text-[#e7e2dd]">{act.title}</p>
                    <span className="text-[11px] text-[#99907c]">{act.timeAgo}</span>
                  </div>
                  <p className="text-xs text-[#d0c5af] italic">{act.subtitle}</p>
                  {act.badges && (
                    <div className="pt-1.5 flex gap-2">
                      {act.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 bg-[#f2ca50]/10 text-[#f2ca50] text-[10px] font-label-caps font-bold rounded"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
