export type ReviewPlatform = 'google' | 'trustpilot' | 'tripadvisor' | 'yelp';

export type ReviewStatus = 'PENDIENTE' | 'RESPONDIDA';

export type AIPersonality = 'Formal' | 'Cercano' | 'Profesional' | 'Entusiasta';

export type NavTab = 'dashboard' | 'reviews' | 'protocol' | 'config';

export interface Review {
  id: string;
  author: string;
  authorAvatar?: string;
  platform: ReviewPlatform;
  status: ReviewStatus;
  rating: number; // 1-5
  timeAgo: string;
  text: string;
  aiDraftResponse?: string;
  publishedResponse?: string;
  date: string;
}

export interface ActivityItem {
  id: string;
  type: 'review' | 'ai_draft' | 'milestone';
  title: string;
  subtitle: string;
  timeAgo: string;
  badges?: string[];
}

export interface BusinessConnection {
  id: string;
  name: string;
  platform: ReviewPlatform;
  status: 'connected' | 'disconnected';
  iconUrl?: string;
}
