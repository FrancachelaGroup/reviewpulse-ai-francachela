import React, { useState } from 'react';
import { AIPersonality, BusinessConnection } from '../types';

interface ConfigViewProps {
  currentPersonality: AIPersonality;
  onSelectPersonality: (personality: AIPersonality) => void;
  connections: BusinessConnection[];
  onToggleConnection: (id: string) => void;
  autoPilotEnabled: boolean;
  onToggleAutoPilot: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  currentPersonality,
  onSelectPersonality,
  connections,
  onToggleConnection,
  autoPilotEnabled,
  onToggleAutoPilot,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toneOptions: { id: AIPersonality; label: string; icon: string; desc: string }[] = [
    {
      id: 'Formal',
      label: 'Formal',
      icon: 'theater_comedy',
      desc: 'Elegante, respetuoso y formal.',
    },
    {
      id: 'Cercano',
      label: 'Cercano',
      icon: 'sentiment_satisfied',
      desc: 'Cálido, amigable y empático.',
    },
    {
      id: 'Profesional',
      label: 'Profesional',
      icon: 'work',
      desc: 'Directo, claro y corporativo.',
    },
    {
      id: 'Entusiasta',
      label: 'Entusiasta',
      icon: 'celebration',
      desc: 'Enérgico, alegre y apasionado.',
    },
  ];

  const handleToneChange = (tone: AIPersonality) => {
    onSelectPersonality(tone);
    showNotification(`Personalidad cambiada a "${tone}"`);
  };

  return (
    <div className="pt-24 pb-28 px-4 sm:px-8 max-w-md mx-auto min-h-screen space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#f2ca50] text-[#3c2f00] px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-bounce flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* Title */}
      <section>
        <h1 className="font-garamond text-3xl font-medium text-[#f2ca50] mb-1">
          Configuración e IA
        </h1>
        <p className="text-xs text-[#d0c5af]">
          Ajustes de motor conversacional y conexiones de marca
        </p>
      </section>

      {/* Section 1: Personalidad de la IA */}
      <section className="space-y-4">
        <div>
          <h2 className="font-sans font-semibold text-base text-[#e7e2dd]">
            Personalidad de la IA
          </h2>
          <p className="text-xs text-[#d0c5af] mt-0.5">
            Define cómo responderá la IA a tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {toneOptions.map((tone) => {
            const isSelected = currentPersonality === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => handleToneChange(tone.id)}
                className={`p-4 rounded-xl flex flex-col items-start transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'active-gold-glow glass-panel border-[#D4AF37]'
                    : 'glass-panel border-[#E8B04B]/10 hover:border-[#E8B04B]/30'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-2">
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      isSelected ? 'text-[#f2ca50]' : 'text-[#d0c5af]'
                    }`}
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tone.icon}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#f2ca50] shadow-sm shadow-[#f2ca50]" />
                  )}
                </div>
                <span className="font-semibold text-sm text-[#e7e2dd] block">
                  {tone.label}
                </span>
                <span className="text-[11px] text-[#99907c] mt-0.5 leading-tight">
                  {tone.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Conexiones */}
      <section className="space-y-4">
        <h2 className="font-sans font-semibold text-base text-[#e7e2dd]">
          Conexiones
        </h2>

        <div className="space-y-3">
          {connections.map((conn) => {
            const isConn = conn.status === 'connected';
            return (
              <div
                key={conn.id}
                className="glass-panel p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {conn.iconUrl ? (
                      <img src={conn.iconUrl} alt={conn.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[#f2ca50]">
                        {conn.platform === 'google' ? 'google' : 'star_rate'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#e7e2dd]">{conn.name}</p>
                    <p className={`text-xs flex items-center gap-1 font-medium ${
                      isConn ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isConn ? 'check_circle' : 'cancel'}
                      </span>
                      {isConn ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onToggleConnection(conn.id);
                    showNotification(`${conn.name} ${isConn ? 'desconectado' : 'conectado'}`);
                  }}
                  className="text-[#f2ca50] font-label-caps text-xs font-bold hover:underline"
                >
                  {isConn ? 'GESTIONAR' : 'CONECTAR'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Respuestas Automáticas */}
      <section className="space-y-4">
        <h2 className="font-sans font-semibold text-base text-[#e7e2dd]">
          Respuestas Automáticas
        </h2>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-[#e7e2dd]">Activar Piloto Automático</p>
            <p className="text-xs text-[#d0c5af] mt-0.5">
              La IA responderá automáticamente a reseñas de 5 estrellas.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoPilotEnabled}
              onChange={() => {
                onToggleAutoPilot();
                showNotification(`Piloto Automático ${!autoPilotEnabled ? 'activado' : 'desactivado'}`);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#363432] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2ca50]" />
          </label>
        </div>
      </section>

      {/* Section 4: Signature Protocol */}
      <section className="space-y-3 glass-panel p-4 rounded-xl border border-[#4d4635]/40">
        <div className="flex items-center gap-2 text-[#f2ca50]">
          <span className="material-symbols-outlined text-lg">edit_note</span>
          <h3 className="font-semibold text-sm text-[#e7e2dd]">Firma de Protocolo</h3>
        </div>
        <p className="text-xs text-[#d0c5af]">
          Firma predeterminada anexada a las respuestas aprobadas:
        </p>
        <div className="p-2.5 bg-[#1d1b19] rounded-lg border border-[#4d4635] text-xs text-[#f2ca50] font-mono">
          "Atentamente, Roberto • Gerente de Experiencia en Francachela"
        </div>
      </section>
    </div>
  );
};
