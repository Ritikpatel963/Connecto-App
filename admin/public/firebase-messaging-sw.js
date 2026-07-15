importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1xANLUG1L1mCtE-6UhMsyK9YzPYu_5og",
  authDomain: "connecto-477ad.firebaseapp.com",
  projectId: "connecto-477ad",
  storageBucket: "connecto-477ad.firebasestorage.app",
  messagingSenderId: "890117178879",
  appId: "1:890117178879:android:ff42e49c175553122213ca"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
