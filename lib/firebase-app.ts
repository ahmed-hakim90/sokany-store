import { type FirebaseApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertClient(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK must only be used in the browser.");
  }
}

/** Minimal Firebase app bootstrap — avoids pulling Auth/Firestore/Analytics into the storefront bundle. */
export function getFirebaseApp(): FirebaseApp {
  assertClient();
  const existing = getApps()[0];
  if (existing) return existing;
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }
  return initializeApp(firebaseConfig);
}

let messagingSingleton: import("firebase/messaging").Messaging | null = null;
let messagingUnsupported: boolean | null = null;

/** Cloud Messaging — dynamic import so FCM is not parsed on the critical path until needed. */
export async function getFirebaseMessaging(): Promise<
  import("firebase/messaging").Messaging | null
> {
  assertClient();
  if (messagingUnsupported === true) return null;
  const { isSupported, getMessaging } = await import("firebase/messaging");
  if (!(await isSupported())) {
    messagingUnsupported = true;
    return null;
  }
  if (!messagingSingleton) {
    messagingSingleton = getMessaging(getFirebaseApp());
  }
  return messagingSingleton;
}
