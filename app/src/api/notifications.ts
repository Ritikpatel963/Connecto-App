import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUser } from '../context/UserContext';
import { Notification } from '../shared/types/app';

export const useNotifications = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: async () => {
      // Lazy mock implementation
      return [
        {
          id: '1',
          type: 'system',
          title: 'Welcome to snappo!',
          body: 'Your profile is ready. Start discovering new people.',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ] as Notification[];
    }
  });
};
