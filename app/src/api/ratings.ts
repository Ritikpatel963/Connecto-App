import { useMutation } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUser } from '../context/UserContext';

export const useSubmitRating = () => {
  const { currentUser } = useUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: async ({ targetUserId, rating, reviewText }: { targetUserId: string | number, rating: number, reviewText: string }) => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          rater_user_id: userId,
          rated_user_id: targetUserId,
          rating,
          review_text: reviewText,
          call_id: `call-${Date.now()}` // Mock call ID since we don't have a real one in this context
        });

      if (error) {
        throw error;
      }
      return true;
    }
  });
};
