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
      const oppositeGender = currentUser?.role === 'boy' ? 'female' : 'male';
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', id || 0)
        .eq('gender', oppositeGender)
        .limit(20);
      if (error) throw error;

      return (users || []).map((u: any): ChatConversation => ({
        id: `chat-${u.id}`,
        user: {
          id: u.id,
          name: u.name || 'Unknown',
          age: u.age || 20,
          avatar: u.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random&color=fff&size=256`,
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: 'New user',
          isOnline: u.is_online,
          isPremium: false,
          isVerified: u.is_id_verified && u.is_active,
          rating: parseFloat(u.average_rating) || 0,
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
