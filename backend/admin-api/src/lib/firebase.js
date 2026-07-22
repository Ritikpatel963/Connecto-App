import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";

let initialized = false;
let app = null;

export function getFirebaseAdmin() {
  if (initialized) return app;
  try {
    const serviceAccountPath = path.resolve(process.cwd(), "firebase-service-account.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      app = initializeApp({
        credential: cert(serviceAccount)
      });
      initialized = true;
      return app;
    } else {
      console.warn("Push Notifications disabled: firebase-service-account.json not found in backend/admin-api root.");
      return null;
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

export async function sendPushNotification(fcmToken, title, body, data = {}, imageUrl = null) {
  const adminApp = getFirebaseAdmin();
  if (!adminApp || !fcmToken) return false;

  try {
    const payload = {
      token: fcmToken,
      notification: { title, body },
      data
    };
    if (imageUrl) payload.notification.imageUrl = imageUrl;

    await getMessaging(adminApp).send(payload);
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}
