import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let initialized = false;

export function getFirebaseAdmin() {
  if (initialized) return admin;
  try {
    const serviceAccountPath = path.resolve(process.cwd(), "firebase-service-account.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
      return admin;
    } else {
      console.warn("Push Notifications disabled: firebase-service-account.json not found in backend/admin-api root.");
      return null;
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin || !fcmToken) return false;

  try {
    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data
    });
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}
