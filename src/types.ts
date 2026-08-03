export type NavTab = 'dashboard' | 'reviews' | 'assistant' | 'config';

export type ReviewStatus = 'pending' | 'responded';

export type ReviewSentiment = 'positive' | 'neutral' | 'critical';

export type ToneType = 'formal' | 'cercano' | 'conciso' | 'empatico';

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  platform: 'Google Business' | 'Yelp' | 'TripAdvisor' | 'Trustpilot';
  rating: number; // 1-5
  date: string;
  content: string;
  sentiment: ReviewSentiment;
  status: ReviewStatus;
  aiResponse?: string;
  responseDate?: string;
  isAutopilotResponded?: boolean;
}

export interface ConfigSettings {
  googleClientId: string;
  googleClientSecret: string;
  isConnected: boolean;
  aiTone: ToneType;
  autopilotEnabled: boolean;
  protocolSignature: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  type: 'sync' | 'ai_reply' | 'autopilot' | 'config_update';
  title: string;
  description: string;
  timestamp: string;
}
