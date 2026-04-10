export type UserRole = 'boy' | 'girl';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  role: UserRole;
  bio: string;
  isOnline: boolean;
  isPremium: boolean;
  isVerified: boolean;
  rating: number;
  totalCalls: number;
  pricePerMinute: number;
  languages: string[];
  interests: string[];
  city: string;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text';
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  user: UserProfile;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'call_debit' | 'call_credit' | 'withdrawal' | 'referral_bonus';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface CallSession {
  id: string;
  caller: UserProfile;
  receiver: UserProfile;
  duration: number;
  costPerMinute: number;
  totalCost: number;
  rating?: number;
  startedAt: string;
  endedAt?: string;
}

export interface Notification {
  id: string;
  type: 'call' | 'chat' | 'wallet' | 'referral' | 'system';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

export interface ReferralInfo {
  code: string;
  totalReferred: number;
  totalEarnings: number;
  milestones: { target: number; reward: number; reached: boolean }[];
}
