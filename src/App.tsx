import React, { useState } from 'react';
import { NavTab, Review, AIPersonality, ActivityItem, BusinessConnection } from './types';
import {
  INITIAL_REVIEWS,
  INITIAL_ACTIVITIES,
  INITIAL_CONNECTIONS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ReviewsView } from './components/ReviewsView';
import { ConfigView } from './components/ConfigView';
import { AiResponseModal } from './components/AiResponseModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [connections, setConnections] = useState<BusinessConnection[]>(INITIAL_CONNECTIONS);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality>('Formal');
  const [autoPilotEnabled, setAutoPilotEnabled] = useState<boolean>(true);
  const [selectedReviewForAi, setSelectedReviewForAi] = useState<Review | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const pendingCount = reviews.filter((r) => r.status === 'PENDIENTES').length;

  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleApproveResponse = (reviewId: string, responseText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'RESPONDIDA',
              publishedResponse: responseText,
            }
          : r
      )
    );

    const updatedRev = reviews.find((r) => r.id === reviewId);
    if (updatedRev) {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'review',
        title: 'Respuesta Publicada con Éxito',
        subtitle: `Roberto respondió a la reseña de ${updatedRev.author}`,
        timeAgo: 'Hace un momento',
        badges: ['PUBLICADO', 'IA RESPONDIDO'],
      };
      setActivities((prev) => [newActivity, ...prev]);
    }

    triggerToast('¡Respuesta publicada y sincronizada correctamente!');
  };

  const handleAddNewReview = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'review',
      title: `Nueva Reseña (${newReview.rating}★)`,
      subtitle: `Recibida de ${newReview.author} en ${newReview.platform}`,
      timeAgo: 'Hace un momento',
      badges: ['NUEVO', 'PENDIENTE'],
    };
    setActivities((prev) => [newActivity, ...prev]);
    triggerToast(`Nueva reseña agregada de ${newReview.author}`);
  };

  const handleToggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' }
          : c
      )
    );
  };

  return (
    <div className="min-[#141311] min-h-screen text-[#e7e2dd] bg-mesh relative font-sans">
      {/* Toast Notification Floating Banner */}
      {toastNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#f2ca50] text-[#3c2f00] px-5 py-2.5 rounded-full font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2 border border-[#3c2f00]/20">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        pendingCount={pendingCount}
      />

      {/* Main Views */}
      <main className="w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            reviews={reviews}
            activities={activities}
            onNavigate={setCurrentTab}
            onOpenAiModal={(rev) => setSelectedReviewForAi(rev)}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            onOpenAiModal={(rev) => setSelectedReviewForAi(rev)}
            onAddNewReview={handleAddNewReview}
          />
        )}

        {(currentTab === 'config' || currentTab === 'protocol') && (
          <ConfigView
            currentPersonality={currentPersonality}
            onSelectPersonality={setCurrentPersonality}
            connections={connections}
            onToggleConnection={handleToggleConnection}
            autoPilotEnabled={autoPilotEnabled}
            onToggleAutoPilot={() => setAutoPilotEnabled(!autoPilotEnabled)}
          />
        )}
      </main>

      {/* AI Response Modal */}
      {selectedReviewForAi && (
        <AiResponseModal
          review={selectedReviewForAi}
          currentPersonality={currentPersonality}
          onClose={() => setSelectedReviewForAi(null)}
          onApprove={handleApproveResponse}
          onPersonalityChange={setCurrentPersonality}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        pendingCount={pendingCount}
      />
    </div>
  );
}
