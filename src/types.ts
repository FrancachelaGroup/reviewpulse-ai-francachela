export type AITone = "Formal" | "Cercano" | "Profesional" | "Entusiasta";

export type ReviewStatus = "PENDIENTE" | "RESPONDIDA";

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  rating: number; // 1-5
  date: string;
  relativeTime: string;
  content: string;
  status: ReviewStatus;
  aiResponse?: string;
  responseDate?: string;
  toneUsed?: AITone;
  isAutoReplied?: boolean;
}

export interface AppConfig {
  aiTone: AITone;
  googleClientId: string;
  googleClientSecret: string;
  isConnected: boolean;
  autopilotEnabled: boolean;
  protocolSignature: string;
  businessName: string;
}

export type TabType = "dashboard" | "reviews" | "assistant" | "config";
