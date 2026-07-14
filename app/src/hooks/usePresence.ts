import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../api/supabase';
import { ENV } from '../config/env';

const HEARTBEAT_INTERVAL = 25000; // 25 seconds

/**
 * 1. Heartbeat Hook
 * Uses setInterval, AppState, and NetInfo to manage the background ping loop.
 * Cleans up the interval to avoid memory leaks.
 */
export function useHeartbeat(userId: string | null) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnlineRef = useRef(false);

  const pingBackend = async (isOnline: boolean) => {
    if (!userId) return;
    try {
      await fetch(`${ENV.API_URL}/api/app/v1/users/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({ isOnline })
      });
    } catch (e) {
      console.warn('Ping failed', e);
    }
  };

  const startLoop = () => {
    if (timerRef.current) return;
    isOnlineRef.current = true;
    pingBackend(true); // immediate ping
    timerRef.current = setInterval(() => {
      pingBackend(true);
    }, HEARTBEAT_INTERVAL);
  };

  const stopLoop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isOnlineRef.current) {
      isOnlineRef.current = false;
      pingBackend(false); // immediate offline state
    }
  };

  useEffect(() => {
    if (!userId) {
      stopLoop();
      return;
    }

    const appStateSub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startLoop();
      } else {
        stopLoop();
      }
    });

    // Start on mount if app is active
    if (AppState.currentState === 'active') {
      startLoop();
    }

    return () => {
      appStateSub.remove();
      stopLoop(); // Cleanup on unmount/logout
    };
  }, [userId]);
}

/**
 * 3. Consumer Hook
 * Subscribes to a single user's `is_online` status via Postgres changes.
 */
export function useOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    supabase.from('users').select('is_online').eq('id', userId).single().then(({ data }) => {
      if (data) setIsOnline(!!data.is_online);
    });

    // Subscribe to DB changes for this specific user
    const channel = supabase.channel(`online-status-${userId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload: any) => {
        setIsOnline(!!payload.new.is_online);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return isOnline;
}
