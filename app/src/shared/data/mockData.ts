import type { UserProfile, ChatConversation, Transaction, Notification, ReferralInfo } from '../types/app';

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
];

export const mockProfiles: UserProfile[] = [
  { id: '1', name: 'Priya Sharma', age: 23, avatar: avatars[0], role: 'girl', bio: 'Love singing & talking 💕', isOnline: true, isPremium: true, isVerified: true, rating: 4.8, totalCalls: 342, pricePerMinute: 12, languages: ['Hindi', 'English'], interests: ['Music', 'Travel'], city: 'Mumbai' },
  { id: '2', name: 'Ananya Patel', age: 21, avatar: avatars[2], role: 'girl', bio: "Let's have a fun conversation!", isOnline: true, isPremium: false, isVerified: true, rating: 4.5, totalCalls: 156, pricePerMinute: 8, languages: ['Hindi', 'Gujarati'], interests: ['Movies', 'Cooking'], city: 'Ahmedabad' },
  { id: '3', name: 'Sneha Roy', age: 24, avatar: avatars[3], role: 'girl', bio: 'Voice artist & storyteller ✨', isOnline: false, isPremium: true, isVerified: true, rating: 4.9, totalCalls: 520, pricePerMinute: 15, languages: ['Hindi', 'Bengali'], interests: ['Books', 'Art'], city: 'Kolkata', lastSeen: '5 min ago' },
  { id: '4', name: 'Meera Joshi', age: 22, avatar: avatars[4], role: 'girl', bio: 'Friendly soul 🌸', isOnline: true, isPremium: false, isVerified: false, rating: 4.2, totalCalls: 78, pricePerMinute: 6, languages: ['Hindi', 'Marathi'], interests: ['Dance', 'Yoga'], city: 'Pune' },
  { id: '5', name: 'Kavya Singh', age: 25, avatar: avatars[5], role: 'girl', bio: 'Deep talks only 🌙', isOnline: true, isPremium: true, isVerified: true, rating: 4.7, totalCalls: 289, pricePerMinute: 10, languages: ['Hindi', 'English'], interests: ['Psychology', 'Music'], city: 'Delhi' },
  { id: '6', name: 'Riya Desai', age: 20, avatar: avatars[7], role: 'girl', bio: 'New here! Say hi 👋', isOnline: false, isPremium: false, isVerified: false, rating: 4.0, totalCalls: 12, pricePerMinute: 5, languages: ['Hindi'], interests: ['Gaming', 'Anime'], city: 'Bangalore', lastSeen: '2 hrs ago' },
];

export const mockChats: ChatConversation[] = mockProfiles.slice(0, 4).map((user, i) => ({
  id: `chat-${i}`,
  user,
  lastMessage: {
    id: `msg-${i}`,
    senderId: i % 2 === 0 ? user.id : 'me',
    text: ['Hey! How are you? 😊', 'That was a great call!', 'Are you free tonight?', 'Thanks for the chat 💕'][i],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    type: 'text' as const,
    isRead: i > 1,
  },
  unreadCount: i < 2 ? i + 1 : 0,
}));

export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'recharge', amount: 500, description: 'Wallet Recharge', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
  { id: 't2', type: 'call_debit', amount: -84, description: 'Call with Priya (7 min)', timestamp: new Date(Date.now() - 43200000).toISOString(), status: 'completed' },
  { id: 't3', type: 'referral_bonus', amount: 50, description: 'Referral Bonus', timestamp: new Date(Date.now() - 21600000).toISOString(), status: 'completed' },
  { id: 't4', type: 'call_debit', amount: -40, description: 'Call with Ananya (5 min)', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
  { id: 't5', type: 'recharge', amount: 200, description: 'Wallet Recharge', timestamp: new Date().toISOString(), status: 'pending' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'call', title: 'Missed Call', body: 'You missed a call from Priya', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: false, avatar: avatars[0] },
  { id: 'n2', type: 'wallet', title: 'Recharge Successful', body: '₹500 added to your wallet', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: false },
  { id: 'n3', type: 'referral', title: 'Referral Reward!', body: 'You earned ₹50 from referral', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { id: 'n4', type: 'system', title: 'Profile Verified', body: 'Your voice verification is approved', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: true },
];

export const mockReferralInfo: ReferralInfo = {
  code: 'CONNECT2024',
  totalReferred: 7,
  totalEarnings: 350,
  milestones: [
    { target: 5, reward: 100, reached: true },
    { target: 10, reward: 300, reached: false },
    { target: 25, reward: 1000, reached: false },
  ],
};
