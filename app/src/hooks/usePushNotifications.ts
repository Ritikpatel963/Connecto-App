import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { ENV } from '../config/env';

export const usePushNotifications = (userId?: string | number) => {
  useEffect(() => {
    if (!userId) return;

    const setupFCM = async () => {
      try {
        // 1. Request permission (required for iOS)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          
          // 2. Get the FCM token
          const token = await messaging().getToken();
          console.log('FCM Token:', token);

          // 3. Save it to Supabase via Admin API or direct fetch
          fetch(`${ENV.API_URL}/users/${userId}/fcm-token`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userId}`, // using user id as dummy auth token as seen in http.js
            },
            body: JSON.stringify({ fcm_token: token })
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Failed to setup FCM:', error);
      }
    };

    setupFCM();

    // Listen for foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // In a real app, you might show an in-app toast here
      // For now, just alert if we get a message while app is open
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || ''
        );
      }
    });

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      fetch(`${ENV.API_URL}/users/${userId}/fcm-token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({ fcm_token: token })
      }).catch(console.error);
    });

    return () => {
      unsubscribe();
      unsubscribeTokenRefresh();
    };
  }, [userId]);
};
