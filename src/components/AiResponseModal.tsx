import React, { useState } from 'react';
import { Review, AIPersonality } from '../types';

interface AiResponseModalProps {
  review: Review | null;
  currentPersonality: AIPersonality;
  onClose: () => void;
  onApprove: (reviewId: string, responseText: string) => void;
  onPersonalityChange: (tone: AIPersonality) => void;
}

export const AiResponseModal: React.FC<AiResponseModalProps> = ({
  review,
  currentPersonality,
  onClose,
  onApprove,
  onPersonalityChange,
}) => {
  if (!review) return null;

  const [responseText, setResponseText] = useState<string>(
    review.aiDraftResponse || review.publishedResponse || ''
  );
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<AIPersonality>(currentPersonality);

  const handleToneSelect = async (tone: AIPersonality) => {
    setSelectedTone(tone);
    onPersonalityChange(tone);
    await triggerAiGeneration(tone, customInstruction);
  };

  const triggerAiGeneration = async (toneToUse = selectedTone, instruction = customInstruction) => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review,
          personality: toneToUse,
          customInstruction: instruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en el servidor de IA.');
      }

      if (data.response) {
        setResponseText(data.response);
      }
    } catch (err: any) {
      console.error('Error al generar respuesta:', err);
      setErrorMsg('No se pudo conectar con el motor de IA. Puedes escribir tu respuesta manualmente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    if (!responseText.trim()) return;
    onApprove(review.id, responseText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#141311] border border-[#E8B04B]/30 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4d4635]/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#f2ca50]/10 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <span className="material-symbols-outlined text-xl">psychology</span>
            </div>
            <div>
              <h3 className="font-garamond text-xl font-semibold text-[#e7e2dd]">
                Generar Respuesta con IA
              </h3>
              <p className="text-xs text-[#d0c5af]">
                Asistente Roberto - Francachela
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#d0c5af] hover:text-[#e7e2dd] hover:bg-[#211f1d] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Original Review Details */}
        <div className="bg-[#211f1d]/80 p-4 rounded-xl border border-[#4d4635]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E8B04B] text-lg">
                {review.platform === 'google' ? 'google' : 'star_rate'}
              </span>
              <span className="font-label-caps text-xs text-[#d0c5af] uppercase">
                {review.author} • {review.platform === 'google' ? 'Google Review' : 'Trustpilot'}
              </span>
            </div>
            <span className="text-xs text-[#99907c]">{review.timeAgo}</span>
          </div>

          <div className="flex text-[#f2ca50] text-sm gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            ))}
          </div>

          <p className="text-sm text-[#e7e2dd] italic leading-relaxed">
            "{review.text}"
          </p>
        </div>

        {/* Personality Selector Quick Pills */}
        <div className="space-y-2">
          <label className="font-label-caps text-xs text-[#d0c5af] uppercase tracking-wider block">
            Tono de la IA (Personalidad activa: {selectedTone})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Formal', 'Cercano', 'Profesional', 'Entusiasta'] as AIPersonality[]).map((tone) => (
              <button
                key={tone}
                onClick={() => handleToneSelect(tone)}
                disabled={isGenerating}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  selectedTone === tone
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20'
                    : 'bg-[#211f1d] text-[#d0c5af] border border-[#4d4635]/60 hover:border-[#E8B04B]/50'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tone === 'Formal' ? 'theater_comedy' : tone === 'Cercano' ? 'sentiment_satisfied' : tone === 'Profesional' ? 'work' : 'celebration'}
                </span>
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Instruction Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs text-[#d0c5af]">Ajuste especial para esta respuesta (Opcional):</label>
            <button
              onClick={() => triggerAiGeneration()}
              disabled={isGenerating}
              className="text-xs text-[#f2ca50] hover:underline flex items-center gap-1"
            >
              <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Regenerar
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Ej: Invítalo a probar el postre de la casa en su próxima visita..."
              className="flex-1 bg-[#1d1b19] border border-[#4d4635] focus:border-[#f2ca50] rounded-lg px-3 py-2 text-xs text-[#e7e2dd] outline-none transition-colors"
            />
            <button
              onClick={() => triggerAiGeneration()}
              disabled={isGenerating}
              className="px-3 py-2 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f2ca50] text-xs font-bold rounded-lg hover:bg-[#d4af37]/30 transition-all shrink-0"
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* AI Draft Text Output Area */}
        <div className="space-y-2">
          <label className="font-label-caps text-xs text-[#d0c5af] uppercase tracking-wider block">
            Borrador Generado (Puedes editarlo directamente):
          </label>
          <div className="relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-[#141311]/80 backdrop-blur-xs rounded-xl flex items-center justify-center z-10 gap-2 text-[#f2ca50]">
                <span className="material-symbols-outlined text-2xl animate-spin">auto_awesome</span>
                <span className="text-xs font-semibold">Redactando respuesta con IA...</span>
              </div>
            )}
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="w-full bg-[#1d1b19] border border-[#E8B04B]/30 focus:border-[#f2ca50] rounded-xl p-3.5 text-sm text-[#e7e2dd] leading-relaxed outline-none transition-all focus:ring-1 focus:ring-[#f2ca50]"
              placeholder="Escribe la respuesta..."
            />
          </div>
          {errorMsg && (
            <p className="text-xs text-red-400 mt-1">{errorMsg}</p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-[#4d4635] text-[#d0c5af] py-3 rounded-xl font-semibold text-xs hover:bg-[#211f1d] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            disabled={!responseText.trim() || isGenerating}
            className="flex-[2] gold-gradient text-[#3c2f00] py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[#f2ca50]/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">send</span>
            Aprobar y Publicar
          </button>
        </div>
      </div>
    </div>
  );
};
