import React, { useState } from 'react';
import { Review, ReviewStatus } from '../types';

interface ReviewsViewProps {
  reviews: Review[];
  onOpenAiModal: (review: Review) => void;
  onAddNewReview: (newReview: Review) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  onOpenAiModal,
  onAddNewReview,
}) => {
  const [activeTab, setActiveTab] = useState<'TODAS' | 'PENDIENTES' | 'RESPONDIDAS'>('TODAS');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  // New review form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newPlatform, setNewPlatform] = useState<'google' | 'trustpilot'>('google');
  const [newRating, setNewRating] = useState<number>(5);
  const [newText, setNewText] = useState('');

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'PENDIENTES') return r.status === 'PENDIENTES';
    if (activeTab === 'RESPONDIDAS') return r.status === 'RESPONDIDAS';
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === 'PENDIENTES').length;

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) return;

    const created: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      platform: newPlatform,
      status: 'PENDIENTES',
      rating: newRating,
      timeAgo: 'Hace un momento',
      text: newText.trim(),
      date: new Date().toISOString(),
    };

    onAddNewReview(created);
    setNewAuthor('');
    setNewText('');
    setShowAddModal(false);
  };

  return (
    <div className="pt-24 pb-28 px-4 sm:px-8 max-w-2xl mx-auto min-h-screen animate-in fade-in duration-300">
      {/* Screen Title Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-garamond text-2xl sm:text-3xl font-medium text-[#e7e2dd] tracking-tight">
            Gestión de Reseñas
          </h2>
          <p className="text-sm text-[#d0c5af] mt-1">
            Controla la reputación de tu marca con IA
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[#f2ca50] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#f2ca50]/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Nueva Reseña</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#363432] mb-6 sticky top-20 bg-[#141311] z-40 py-2">
        <button
          onClick={() => setActiveTab('TODAS')}
          className={`flex-1 py-2 font-label-caps text-xs font-bold transition-colors relative ${
            activeTab === 'TODAS'
              ? 'text-[#f2ca50] border-b-2 border-[#f2ca50]'
              : 'text-[#d0c5af] hover:text-[#E8B04B]'
          }`}
        >
          TODAS
        </button>
        <button
          onClick={() => setActiveTab('PENDIENTES')}
          className={`flex-1 py-2 font-label-caps text-xs font-bold transition-colors relative ${
            activeTab === 'PENDIENTES'
              ? 'text-[#f2ca50] border-b-2 border-[#f2ca50]'
              : 'text-[#d0c5af] hover:text-[#E8B04B]'
          }`}
        >
          PENDIENTES
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-2 sm:right-6 w-2 h-2 bg-[#E8B04B] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('RESPONDIDAS')}
          className={`flex-1 py-2 font-label-caps text-xs font-bold transition-colors relative ${
            activeTab === 'RESPONDIDAS'
              ? 'text-[#f2ca50] border-b-2 border-[#f2ca50]'
              : 'text-[#d0c5af] hover:text-[#E8B04B]'
          }`}
        >
          RESPONDIDAS
        </button>
      </div>

      {/* Review Cards Feed */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#d0c5af]">rate_review</span>
            <p className="text-sm text-[#e7e2dd] font-medium">No hay reseñas en esta categoría.</p>
            <p className="text-xs text-[#99907c]">Prueba a cambiar los filtros o simula una nueva reseña arriba.</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isPending = review.status === 'PENDIENTES';
            const isExpanded = expandedThreadId === review.id;

            return (
              <article
                key={review.id}
                className={`p-5 rounded-xl transition-all duration-200 ${
                  isPending
                    ? 'glass-panel inner-glow-gold'
                    : 'bg-[#211f1d] border border-[#4d4635]/30'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E8B04B] text-lg">
                      {review.platform === 'google' ? 'google' : 'star_rate'}
                    </span>
                    <span className="font-label-caps text-xs text-[#d0c5af] uppercase tracking-wider">
                      {review.platform === 'google' ? 'GOOGLE REVIEW' : 'TRUSTPILOT'}
                    </span>
                  </div>
                  {isPending ? (
                    <div className="bg-[#f2ca50]/10 border border-[#f2ca50]/20 px-2.5 py-0.5 rounded-full">
                      <span className="text-[10px] font-bold text-[#f2ca50] tracking-widest">
                        PENDIENTE
                      </span>
                    </div>
                  ) : (
                    <span className="font-label-caps text-[10px] text-[#99907c] tracking-widest">
                      RESPONDIDA
                    </span>
                  )}
                </div>

                {/* Stars and Time */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-[#f2ca50] text-sm"
                      style={{
                        fontVariationSettings:
                          star <= review.rating ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  ))}
                  <span className="ml-2 font-semibold text-xs text-[#e7e2dd]">
                    {review.timeAgo}
                  </span>
                  <span className="ml-auto text-xs text-[#99907c]">by {review.author}</span>
                </div>

                {/* Review body */}
                <p className="text-sm text-[#e7e2dd] mb-4 leading-relaxed font-sans">
                  "{review.text}"
                </p>

                {/* Response snippet if answered */}
                {review.publishedResponse && (
                  <div className="p-3.5 rounded-lg bg-[#1d1b19] border-l-2 border-[#f2ca50]/50 italic text-[#d0c5af] text-xs mb-4">
                    "{review.publishedResponse}"
                  </div>
                )}

                {/* Full thread expanded view */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-[#1a1917] rounded-lg border border-[#4d4635]/40 text-xs text-[#d0c5af] space-y-2 mb-4 animate-in fade-in">
                    <p className="font-bold text-[#f2ca50]">Hilo de conversación completo:</p>
                    <p>• {review.author}: "{review.text}"</p>
                    {review.publishedResponse && (
                      <p>• Roberto (Francachela): "{review.publishedResponse}"</p>
                    )}
                    <p className="text-[10px] text-[#99907c] pt-1">
                      Estado: Sincronizado con la API oficial de {review.platform.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* Card Actions */}
                {isPending ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenAiModal(review)}
                      className="flex-1 gold-gradient py-3 rounded-lg font-semibold text-xs text-[#3c2f00] uppercase tracking-wider active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/20"
                    >
                      <span className="material-symbols-outlined text-lg">psychology</span>
                      GENERAR RESPUESTA CON IA
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedThreadId(isExpanded ? null : review.id)}
                    className="w-full border border-[#E8B04B]/40 py-2.5 rounded-lg font-semibold text-xs text-[#E8B04B] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#f2ca50]/10"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isExpanded ? 'expand_less' : 'forum'}
                    </span>
                    {isExpanded ? 'OCULTAR HILO' : 'VER HILO COMPLETO'}
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Atmospheric Element */}
      <div className="mt-12 text-center opacity-40 pointer-events-none space-y-1">
        <span className="material-symbols-outlined text-5xl text-[#E8B04B]">auto_awesome</span>
        <p className="font-label-caps text-[11px] tracking-[0.2em] uppercase text-[#d0c5af]">
          Precision Management
        </p>
      </div>

      {/* Add New Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141311] border border-[#E8B04B]/30 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-[#4d4635] pb-3">
              <h3 className="font-garamond text-xl font-medium text-[#e7e2dd]">
                Simular Nueva Reseña
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#d0c5af] hover:text-[#e7e2dd]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="text-xs text-[#d0c5af] block mb-1">Nombre del cliente:</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ej: Sofia Vergara"
                  className="w-full bg-[#1d1b19] border border-[#4d4635] focus:border-[#f2ca50] rounded-lg p-2.5 text-xs text-[#e7e2dd] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#d0c5af] block mb-1">Plataforma:</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full bg-[#1d1b19] border border-[#4d4635] text-[#e7e2dd] text-xs rounded-lg p-2.5 outline-none"
                  >
                    <option value="google">Google Review</option>
                    <option value="trustpilot">Trustpilot</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#d0c5af] block mb-1">Calificación (Estrellas):</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full bg-[#1d1b19] border border-[#4d4635] text-[#e7e2dd] text-xs rounded-lg p-2.5 outline-none"
                  >
                    <option value={5}>5 Estrellas (Excelente)</option>
                    <option value={4}>4 Estrellas (Bueno)</option>
                    <option value={3}>3 Estrellas (Regular)</option>
                    <option value={2}>2 Estrellas (Malo)</option>
                    <option value={1}>1 Estrella (Pésimo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#d0c5af] block mb-1">Comentario del cliente:</label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribe la opinión recibida..."
                  className="w-full bg-[#1d1b19] border border-[#4d4635] focus:border-[#f2ca50] rounded-lg p-2.5 text-xs text-[#e7e2dd] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full gold-gradient py-3 rounded-lg font-bold text-xs text-[#3c2f00] uppercase tracking-wider"
              >
                Guardar e Integrar en Reseñas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
