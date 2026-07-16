import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUser } from '../context/UserContext';
import { Notification } from '../shared/types/app';

export const useNotifications = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: async () => {
      const [broadcasts, targeted] = await Promise.all([
        supabase.from('push_notifications').select('*').is('target_user_id', null).order('created_at', { ascending: false }).limit(10),
        id ? supabase.from('push_notifications').select('*').eq('target_user_id', id).order('created_at', { ascending: false }).limit(10) : { data: [], error: null }
      ]);

      if (broadcasts.error) throw broadcasts.error;
      if (targeted.error) throw targeted.error;

      const combined = [...(broadcasts.data || []), ...(targeted.data || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      return combined.map((n: any) => ({
        id: n.id,
        type: 'system',
        title: n.title,
        body: n.message,
        timestamp: n.created_at,
        isRead: false
      })) as Notification[];
    }
  });
};
