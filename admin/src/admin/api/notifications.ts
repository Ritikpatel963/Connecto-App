import { BaseRecord } from "../types";
import { supabase } from "../../lib/supabase";

export type NotificationTone = "primary" | "warning" | "success" | "danger" | "info";

export interface AdminNotification extends BaseRecord {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  tone: NotificationTone;
  to: string;
  is_read: boolean;
}

export const notificationsApi = {
  list: async (): Promise<AdminNotification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as AdminNotification[];
  },
  markRead: async (id: number): Promise<AdminNotification> => {
    const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single();
    if (error) throw error;
    return data as AdminNotification;
  },
  markAllRead: async (): Promise<AdminNotification[]> => {
    const { data, error } = await supabase.from('notifications').update({ is_read: true }).neq('is_read', true).select();
    if (error) throw error;
    return (data || []) as AdminNotification[];
  },
  subscribe: (callback: (payload: any) => void) => {
    return supabase.channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, callback)
      .subscribe();
  }
};

