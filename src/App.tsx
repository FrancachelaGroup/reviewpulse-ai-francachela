import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/views/DashboardView";
import { ReviewsView } from "./components/views/ReviewsView";
import { AssistantView } from "./components/views/AssistantView";
import { ConfigView } from "./components/views/ConfigView";
import { AppConfig, Review, TabType, AITone } from "./types";
import { INITIAL_CONFIG, INITIAL_REVIEWS } from "./data/mockData";

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");

  // Load state from localStorage or initial defaults
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("francachela_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REVIEWS;
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("francachela_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CONFIG;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("francachela_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("francachela_config", JSON.stringify(config));
  }, [config]);

  const pendingCount = reviews.filter((r) => r.status === "PENDIENTE").length;

  // Approve a single review reply
  const handleApproveReply = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            status: "RESPONDIDA",
            aiResponse: replyText,
            responseDate: "Hace un momento",
          };
        }
        return r;
      })
    );
  };

  // Generate fresh AI reply for a specific review via backend API
  const handleGenerateAIReply = async (reviewId: string) => {
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return;

    try {
      const res = await fetch("/api/ai/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewAuthor: targetReview.author,
          starRating: targetReview.rating,
          reviewText: targetReview.content,
          tone: config.aiTone,
          signature: config.protocolSignature,
          businessName: config.businessName,
        }),
      });

      const data = await res.json();
      if (data.replyText) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === reviewId) {
              return {
                ...r,
                aiResponse: data.replyText,
                toneUsed: config.aiTone,
              };
            }
            return r;
          })
        );
      }
    } catch (err) {
      console.error("Error generating AI reply:", err);
    }
  };

  // Batch resolve all pending reviews
  const handleBatchResolvePending = () => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.status === "PENDIENTE") {
          return {
            ...r,
            status: "RESPONDIDA",
            responseDate: "Hace un momento",
            isAutoReplied: true,
          };
        }
        return r;
      })
    );
  };

  // Add a new simulated review
  const handleAddNewReview = async (newReviewData: Omit<Review, "id">) => {
    const newId = `rev-${Date.now()}`;
    const newReview: Review = {
      ...newReviewData,
      id: newId,
      toneUsed: config.aiTone,
    };

    // Immediately insert review
    setReviews((prev) => [newReview, ...prev]);

    // Fetch AI response draft for this review
    try {
      const res = await fetch("/api/ai/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewAuthor: newReview.author,
          starRating: newReview.rating,
          reviewText: newReview.content,
          tone: config.aiTone,
          signature: config.protocolSignature,
          businessName: config.businessName,
        }),
      });

      const data = await res.json();
      if (data.replyText) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === newId) {
              return {
                ...r,
                aiResponse: data.replyText,
              };
            }
            return r;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfig = (updated: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateTone = (newTone: AITone) => {
    setConfig((prev) => ({ ...prev, aiTone: newTone }));
  };

  return (
    <div className="min-h-screen bg-[#141311] text-[#e7e2dd] font-manrope selection:bg-[#f2ca50] selection:text-[#3c2f00] relative">
      {/* Top App Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
      />

      {/* Main View Area */}
      <main className="pt-24 sm:pt-28 pb-28 px-4 sm:px-8 min-h-screen">
        {currentTab === "dashboard" && (
          <DashboardView
            reviews={reviews}
            config={config}
            onSelectTab={setCurrentTab}
            onBatchResolvePending={handleBatchResolvePending}
          />
        )}

        {currentTab === "reviews" && (
          <ReviewsView
            reviews={reviews}
            config={config}
            onApproveReply={handleApproveReply}
            onGenerateAIReply={handleGenerateAIReply}
            onAddNewReview={handleAddNewReview}
          />
        )}

        {currentTab === "assistant" && (
          <AssistantView
            config={config}
            onUpdateTone={handleUpdateTone}
          />
        )}

        {currentTab === "config" && (
          <ConfigView
            config={config}
            onUpdateConfig={handleUpdateConfig}
          />
        )}
      </main>

      {/* Fixed Footer Version Tag matching Screenshot */}
      <div className="fixed bottom-[88px] right-4 z-40 text-[10px] font-bold tracking-widest uppercase text-[#D4AF37]/50 pointer-events-none font-manrope">
        v3.1 - VERIFICADA
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
      />
    </div>
  );
}
