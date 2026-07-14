import { useMutation } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUser } from '../context/UserContext';
import { ENV } from '../config/env';

export const useSubmitRating = () => {
  const { currentUser } = useUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: async ({ targetUserId, rating, reviewText }: { targetUserId: string | number, rating: number, reviewText: string }) => {
      if (!userId) return false;

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const res = await fetch(`${ENV.API_URL}/api/app/v1/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId,
          rating,
          reviewText
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }
      
      return true;
    }
  });
};
