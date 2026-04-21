import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import type { Messaging } from "firebase/messaging";

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

let authSingleton: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!authSingleton) {
    authSingleton = getAuth(getFirebaseApp());
  }
  return authSingleton;
}

let firestoreSingleton: Firestore | null = null;
export function getFirebaseFirestore(): Firestore {
  if (!firestoreSingleton) {
    firestoreSingleton = getFirestore(getFirebaseApp());
  }
  return firestoreSingleton;
}

let messagingSingleton: Messaging | null = null;
let messagingUnsupported: boolean | null = null;

/** Cloud Messaging (ويب) — يُستخدم مع VAPID و Service Worker. إن لم تكن المنصة تدعمها يُعاد `null`. */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
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

/** Call once from a client tree when GA4 measurement ID is set. Safe no-op if unsupported. */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  assertClient();
  if (!firebaseConfig.measurementId) return null;
  try {
    if (!(await isSupported())) return null;
    return getAnalytics(getFirebaseApp());
  } catch {
    return null;
  }
}
