import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUser } from '../context/UserContext';
import { UserProfile } from '../shared/types/app';

export const useFavorites = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;

  return useQuery({
    queryKey: ['favorites', id],
    queryFn: async () => {
      const userId = id || 1;
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          target_user:users!favorites_target_user_id_fkey(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((fav: any): UserProfile => {
        const u = fav.target_user || {};
        return {
          id: u.id,
          name: u.name || 'Unknown',
          age: u.age || 20,
          avatar: u.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: 'Favorite User',
          isOnline: u.is_online,
          isPremium: false,
          isVerified: u.is_id_verified && u.is_active,
          rating: parseFloat(u.average_rating) || 0,
          totalCalls: 0,
          pricePerMinute: u.call_rate || 0,
          languages: ['English'],
          interests: [],
          city: u.city || 'Unknown'
        };
      });
    }
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!userId) return false;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (data) {
        await supabase.from('favorites').delete().eq('id', data.id);
        return false;
      } else {
        await supabase.from('favorites').insert({ user_id: userId, target_user_id: targetUserId });
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
    }
  });
};
