import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { ChatConversation } from '../shared/types/app';
import { useUser } from '../context/UserContext';

export const useChats = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;
  return useQuery({
    queryKey: ['chats', id],
    queryFn: async () => {
      // Lazy mock implementation that fetches real users to simulate chats
      const { data: users, error } = await supabase.from('users').select('*').limit(5);
      if (error) throw error;

      return (users || []).map((u: any): ChatConversation => ({
        id: `chat-${u.id}`,
        user: {
          id: u.id,
          name: u.name || 'Unknown',
          age: u.age || 20,
          avatar: u.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: 'New user',
          isOnline: u.is_online,
          isPremium: false,
          isVerified: u.is_active,
          rating: u.average_rating || 0,
          totalCalls: 0,
          pricePerMinute: u.call_rate || 0,
          languages: ['English'],
          interests: [],
          city: u.city || 'Unknown'
        },
        lastMessage: {
          id: `msg-${u.id}`,
          senderId: String(u.id),
          text: 'Hello, are you available?',
          timestamp: new Date().toISOString(),
          type: 'text',
          isRead: false
        },
        unreadCount: 1
      }));
    }
  });
};
