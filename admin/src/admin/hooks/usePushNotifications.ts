import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';
import api from '../api/http';

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1xANLUG1L1mCtE-6UhMsyK9YzPYu_5og",
  authDomain: "connecto-477ad.firebaseapp.com",
  projectId: "connecto-477ad",
  storageBucket: "connecto-477ad.firebasestorage.app",
  messagingSenderId: "890117178879",
  appId: "1:890117178879:android:ff42e49c175553122213ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const usePushNotifications = (userId?: string | number) => {
  useEffect(() => {
    if (!userId) return;

    const setupPush = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          // TODO: Replace with your actual VAPID key
          const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_HERE' });

          if (token) {
            console.log('Web FCM Token:', token);
            // Save token to backend (using the same route the mobile app uses)
            await api.patch(`/users/${userId}/fcm-token`, { fcm_token: token });
          }

          onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast.info(`${payload.notification?.title}: ${payload.notification?.body}`);
          });
        }
      } catch (error) {
        console.error('Error setting up Web Push Notifications:', error);
      }
    };

    setupPush();
  }, [userId]);
};
