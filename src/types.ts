export type NavTab = 'dashboard' | 'reviews' | 'assistant' | 'config';

export type ReviewStatus = 'pending' | 'responded';

export type ReviewSentiment = 'positive' | 'neutral' | 'critical';

export type ToneType = 'Formal' | 'Cercano' | 'Conciso' | 'Empático';

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  platform: 'Google Business' | 'Yelp' | 'TripAdvisor' | 'Trustpilot';
  rating: number;
  date: string;
  content: string;
  sentiment: ReviewSentiment;
  status: ReviewStatus;
  aiResponse?: string;
  responseDate?: string;
  isAutopilotResponded?: boolean;
}

export interface ConfigSettings {
  isConnected: boolean;
  aiTone: ToneType;
  autopilotEnabled: boolean;
  protocolSignature: string;
  googleClientId: string;
  googleClientSecret: string;
  googleAccountId: string;
  googleLocationId: string;
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
